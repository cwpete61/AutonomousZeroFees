import { Process, Processor } from "@nestjs/bull";
import { Logger } from "@nestjs/common";
import { Job } from "bull";
import { BaseProcessor } from "./base.processor";
import { SalesCloseAgent } from "@agency/agents";
import { PrismaService, LeadStatus } from "@agency/db";
import { RedisEventBus, EVENTS } from "@agency/events";

@Processor("sales-close-queue")
export class SalesCloseProcessor extends BaseProcessor {
  private readonly salesAgent: any;

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: RedisEventBus,
  ) {
    super(SalesCloseProcessor.name);
    this.salesAgent = new SalesCloseAgent();
  }

  @Process("process")
  async handleSalesAction(job: Job<any>) {
    const { id: leadId, replyContent, intent, ...data } = job.data;
    this.logger.log(
      `Handling sales action for lead: ${leadId} | Intent: ${intent}`,
    );

    try {
      this.reportProgress(job, 10);

      // Handle the reply or next sales action
      const salesResult = await this.salesAgent.handleReply(
        job.data,
        replyContent,
        { intent },
      );

      this.reportProgress(job, 80);

      // Update lead based on result
      const lead = await this.prisma.lead.update({
        where: { id: leadId },
        data: {
          status:
            salesResult.status === "failed"
              ? LeadStatus.CLOSED_LOST
              : LeadStatus.REPLIED,
        },
        include: { business: true },
      });

      await this.prisma.auditLog.create({
        data: {
          actorType: "AGENT",
          action: "SALES_REPLY_HANDLED",
          targetType: "LEAD",
          targetId: leadId,
          metadata: {
            agent: "SalesCloseAgent",
            intent,
            nextAction: salesResult.data?.nextAction,
            confidence: salesResult.confidence,
          },
        },
      });

      // Emit status change event to trigger next stage in WorkflowListener
      await this.eventBus.publish({
        eventType: EVENTS.LEAD_STATUS_CHANGED,
        timestamp: new Date().toISOString(),
        correlationId: `sales-${leadId}-${Date.now()}`,
        actorType: "AGENT",
        payload: {
          leadId,
          from: "OUTREACH_SENT",
          to: lead.status,
          lead,
        },
      });

      this.reportProgress(job, 100);
      this.logger.log(
        `Sales action processed and event emitted for lead: ${leadId}. Status: ${lead.status}`,
      );

      return salesResult;
    } catch (error) {
      this.handleFailure(job, error);
      throw error;
    }
  }
}
