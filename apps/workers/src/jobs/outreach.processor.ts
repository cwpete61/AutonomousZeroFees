import { Process, Processor } from "@nestjs/bull";
import { Inject, Logger } from "@nestjs/common";
import { Job } from "bull";
import { BaseProcessor } from "./base.processor";
import { OutreachAgent } from "@agency/agents";
import { PrismaService, OutreachStatus } from "@agency/db";
import { RedisEventBus, EVENTS } from "@agency/events";

@Processor("outreach-queue")
export class OutreachProcessor extends BaseProcessor {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: RedisEventBus,
    @Inject(OutreachAgent) private readonly outreachAgent: any,
  ) {
    super(OutreachProcessor.name);
  }

  @Process("process")
  async handleOutreach(job: Job<any>) {
    const { id: leadId, ...data } = job.data;
    this.logger.log(`Starting automated outreach for lead: ${leadId}`);

    try {
      this.reportProgress(job, 10);

      // Call the agent's outreach logic
      const emailResult = await this.outreachAgent.sendInitialEmail(job.data);

      this.reportProgress(job, 90);

      // Update lead and create OutreachSequence record
      const lead = await this.prisma.lead.update({
        where: { id: leadId },
        data: {
          status: "OUTREACH_SENT",
        },
        include: { business: true },
      });

      await this.prisma.outreachSequence.create({
        data: {
          leadId: leadId,
          status: OutreachStatus.SENT,
          subjectLine: emailResult.subjectLine,
          firstEmail: emailResult.emailBody || "",
        },
      });

      await this.prisma.auditLog.create({
        data: {
          actorType: "AGENT",
          action: "LEAD_OUTREACH_SENT",
          targetType: "LEAD",
          targetId: leadId,
          metadata: {
            agent: "OutreachAgent",
            emailId: emailResult.id,
            provider: emailResult.provider,
          },
        },
      });

      // Emit status change event to trigger next stage in WorkflowListener
      await this.eventBus.publish({
        eventType: EVENTS.LEAD_STATUS_CHANGED,
        timestamp: new Date().toISOString(),
        correlationId: `outreach-${leadId}-${Date.now()}`,
        actorType: "AGENT",
        payload: {
          leadId,
          from: "ENRICHED",
          to: "OUTREACH_SENT",
          lead,
        },
      });

      this.reportProgress(job, 100);
      this.logger.log(`Outreach sent and event emitted for lead: ${leadId}`);

      return emailResult;
    } catch (error) {
      this.handleFailure(job, error);
      throw error;
    }
  }
}
