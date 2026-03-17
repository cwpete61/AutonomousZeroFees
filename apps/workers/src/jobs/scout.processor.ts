import { Process, Processor, InjectQueue } from "@nestjs/bull";
import { Inject, Logger } from "@nestjs/common";
import { Job, Queue } from "bull";
import { BaseProcessor } from "./base.processor";
import { ScoutAgent } from "@agency/agents";
import { PrismaService } from "@agency/db";
import { RedisEventBus, EVENTS } from "@agency/events";

@Processor("research-queue")
export class ScoutProcessor extends BaseProcessor {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: RedisEventBus,
    @Inject(ScoutAgent) private readonly scoutAgent: any,
    @InjectQueue("research-queue") private readonly researchQueue: Queue,
  ) {
    super(ScoutProcessor.name);
  }

  @Process("research")
  async handleResearch(job: Job<any>) {
    const { id: leadId, ...data } = job.data;
    this.logger.log(`Starting research for lead: ${leadId}`);

    try {
      this.reportProgress(job, 10);

      // Call the agent's research logic
      const results = await this.scoutAgent.evaluateBusiness(data);

      this.reportProgress(job, 70);

      // Update lead and create audit log
      const lead = await this.prisma.lead.update({
        where: { id: leadId },
        data: {
          status: "RESEARCHED",
          qualificationScore: results.qualityScore,
          discoveryNotes: results.profitShieldPitch,
        },
        include: { business: true },
      });

      await this.prisma.auditLog.create({
        data: {
          actorType: "AGENT",
          action: "LEAD_RESEARCH_COMPLETED",
          targetType: "LEAD",
          targetId: leadId,
          metadata: {
            agent: "ScoutAgent",
            qualityScore: results.qualityScore,
            issues: results.issues,
          },
        },
      });

      // Emit status change event to trigger next stage in WorkflowListener
      await this.eventBus.publish({
        eventType: EVENTS.LEAD_STATUS_CHANGED,
        timestamp: new Date().toISOString(),
        correlationId: `scout-${leadId}-${Date.now()}`,
        actorType: "AGENT",
        payload: {
          leadId,
          from: "DISCOVERED",
          to: "RESEARCHED",
          lead,
        },
      });

      this.reportProgress(job, 100);
      this.logger.log(
        `Research completed and event emitted for lead: ${leadId}`,
      );

      return results;
    } catch (error) {
      this.handleFailure(job, error);
      throw error;
    }
  }

  @Process("discover")
  async handleDiscovery(job: Job<any>) {
    const { campaignId, niche, geography, minLeads } = job.data;
    this.logger.log(
      `Starting business discovery for campaign: ${campaignId} (${niche} in ${geography})`,
    );

    try {
      this.reportProgress(job, 10);

      // Call the agent's findLeads logic which now has "Database First" check
      const leads = await this.scoutAgent.findLeads({
        industries: [niche],
        location: geography,
        minLeads: minLeads || 20,
      });

      this.reportProgress(job, 80);

      // Associate newly found/persisted leads with this campaign
      // Note: persistLead already created the Business and Lead records, but without campaignId
      for (const lead of leads) {
        await this.prisma.lead.update({
          where: { id: lead.id },
          data: { campaignId },
        });

        // Trigger the next stage (research) for each new lead
        await this.researchQueue.add("research", lead, {
          attempts: 3,
          backoff: 5000,
          removeOnComplete: true,
        });
      }

      this.reportProgress(job, 100);
      this.logger.log(
        `Discovery completed: Found and enqueued ${leads.length} leads for campaign ${campaignId}`,
      );

      return { leadsFound: leads.length };
    } catch (error) {
      this.handleFailure(job, error);
      throw error;
    }
  }
}
