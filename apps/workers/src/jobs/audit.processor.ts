import { Process, Processor } from "@nestjs/bull";
import { Logger } from "@nestjs/common";
import { Job } from "bull";
import { BaseProcessor } from "./base.processor";
import { AuditAgent } from "@agency/agents";
import { PrismaService } from "@agency/db";
import { RedisEventBus, EVENTS } from "@agency/events";

@Processor("audit-queue")
export class AuditProcessor extends BaseProcessor {
  private readonly auditAgent: any;

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: RedisEventBus,
  ) {
    super(AuditProcessor.name);
    this.auditAgent = new AuditAgent();
  }

  @Process("process")
  async handleAudit(job: Job<any>) {
    const { id: leadId, ...data } = job.data;
    this.logger.log(`Starting deep audit for lead: ${leadId}`);

    try {
      this.reportProgress(job, 10);

      // Call the agent's audit logic
      const auditResults = await this.auditAgent.performAudit(data.websiteUrl);

      this.reportProgress(job, 80);

      // Update lead and create WebsiteAudit record
      const lead = await this.prisma.lead.update({
        where: { id: leadId },
        data: {
          status: "AUDITED",
        },
        include: { business: true },
      });

      await this.prisma.websiteAudit.create({
        data: {
          leadId: leadId,
          technicalScore: auditResults.score,
          summary: auditResults.recommendation,
          issueListJson: auditResults.vulnerabilities as any,
        },
      });

      await this.prisma.auditLog.create({
        data: {
          actorType: "AGENT",
          action: "LEAD_AUDIT_COMPLETED",
          targetType: "LEAD",
          targetId: leadId,
          metadata: {
            agent: "AuditAgent",
            score: auditResults.score,
            recommendations: auditResults.recommendation,
          },
        },
      });

      // Emit status change event to trigger next stage (Qualification)
      await this.eventBus.publish({
        eventType: EVENTS.LEAD_STATUS_CHANGED,
        timestamp: new Date().toISOString(),
        correlationId: `audit-${leadId}-${Date.now()}`,
        actorType: "AGENT",
        payload: {
          leadId,
          from: "RESEARCHED",
          to: "AUDITED",
          lead,
        },
      });

      this.reportProgress(job, 100);
      this.logger.log(`Audit completed and event emitted for lead: ${leadId}`);

      return auditResults;
    } catch (error) {
      this.handleFailure(job, error);
      throw error;
    }
  }
}
