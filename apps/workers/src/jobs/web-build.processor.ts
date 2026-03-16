import { Process, Processor } from "@nestjs/bull";
import { Logger } from "@nestjs/common";
import { Job } from "bull";
import { BaseProcessor } from "./base.processor";
import { WebBuildAgent } from "@agency/agents";
import { PrismaService, LeadStatus } from "@agency/db";
import { RedisEventBus, EVENTS } from "@agency/events";

@Processor("build-queue")
export class WebBuildProcessor extends BaseProcessor {
  private readonly buildAgent: any;

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: RedisEventBus,
  ) {
    super(WebBuildProcessor.name);
    this.buildAgent = new WebBuildAgent();
  }

  @Process("process")
  async handleBuild(job: Job<any>) {
    const { id: leadId, ...data } = job.data;
    this.logger.log(`Starting production website build for lead: ${leadId}`);

    try {
      this.reportProgress(job, 10);

      // Call the agent's build logic
      const buildResults = await this.buildAgent.startBuild(job.data);

      this.reportProgress(job, 90);

      // Update lead and potentially create a Project record
      const lead = await this.prisma.lead.update({
        where: { id: leadId },
        data: {
          status: LeadStatus.REVIEW_PENDING,
        },
        include: { business: true },
      });

      await this.prisma.auditLog.create({
        data: {
          actorType: "AGENT",
          action: "WEBSITE_BUILD_COMPLETED",
          targetType: "LEAD",
          targetId: leadId,
          metadata: {
            agent: "WebBuildAgent",
            stagingUrl: buildResults.data?.stagingUrl,
            filesCount: buildResults.data?.filesGenerated,
          },
        },
      });

      // Emit status change event
      await this.eventBus.publish({
        eventType: EVENTS.LEAD_STATUS_CHANGED,
        timestamp: new Date().toISOString(),
        correlationId: `build-${leadId}-${Date.now()}`,
        actorType: "AGENT",
        payload: {
          leadId,
          from: "BUILD_STARTED",
          to: LeadStatus.REVIEW_PENDING,
          lead,
        },
      });

      this.reportProgress(job, 100);
      this.logger.log(
        `Website build completed and event emitted for lead: ${leadId}`,
      );

      return buildResults;
    } catch (error) {
      this.handleFailure(job, error);
      throw error;
    }
  }
}
