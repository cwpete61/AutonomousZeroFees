import { Process, Processor } from "@nestjs/bull";
import { Logger } from "@nestjs/common";
import { Job } from "bull";
import { BaseProcessor } from "./base.processor";
import { DesignPreviewAgent } from "@agency/agents";
import { PrismaService, LeadStatus } from "@agency/db";
import { RedisEventBus, EVENTS } from "@agency/events";

@Processor("demo-queue")
export class DemoProcessor extends BaseProcessor {
  private readonly designAgent: any;

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: RedisEventBus,
  ) {
    super(DemoProcessor.name);
    this.designAgent = new DesignPreviewAgent();
  }

  @Process("process")
  async handleDemoGeneration(job: Job<any>) {
    const { id: leadId, ...data } = job.data;
    this.logger.log(
      `Starting automated demo/preview generation for lead: ${leadId}`,
    );

    try {
      this.reportProgress(job, 10);

      // Call the agent's demo generation logic
      const demoResults = await this.designAgent.generate(job.data);

      this.reportProgress(job, 80);

      // Update lead status
      const lead = await this.prisma.lead.update({
        where: { id: leadId },
        data: {
          status: LeadStatus.DEMO_SENT,
        },
        include: { business: true },
      });

      // Store demo assets in the DB if we had a Demo model, but for now we'll use AuditLog
      await this.prisma.auditLog.create({
        data: {
          actorType: "AGENT",
          action: "DEMO_GENERATED",
          targetType: "LEAD",
          targetId: leadId,
          metadata: {
            agent: "DesignPreviewAgent",
            demoId: demoResults.id,
            previewUrl: demoResults.fullPreviewUrl,
            designDirection: demoResults.designDirection,
          },
        },
      });

      // Emit status change event
      await this.eventBus.publish({
        eventType: EVENTS.LEAD_STATUS_CHANGED,
        timestamp: new Date().toISOString(),
        correlationId: `demo-${leadId}-${Date.now()}`,
        actorType: "AGENT",
        payload: {
          leadId,
          from: "AUDITED",
          to: LeadStatus.DEMO_SENT,
          lead,
        },
      });

      this.reportProgress(job, 100);
      this.logger.log(
        `Demo generation completed and event emitted for lead: ${leadId}`,
      );

      return demoResults;
    } catch (error) {
      this.handleFailure(job, error);
      throw error;
    }
  }
}
