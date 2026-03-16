import { Process, Processor } from "@nestjs/bull";
import { Inject, Logger } from "@nestjs/common";
import { Job } from "bull";
import { BaseProcessor } from "./base.processor";
import { NurtureAgent } from "@agency/agents";
import { PrismaService } from "@agency/db";
import { RedisEventBus, EVENTS } from "@agency/events";

@Processor("nurture-queue")
export class NurtureProcessor extends BaseProcessor {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: RedisEventBus,
    @Inject(NurtureAgent) private readonly nurtureAgent: any,
  ) {
    super(NurtureProcessor.name);
  }

  @Process("process")
  async handleNurture(job: Job<any>) {
    const { id: leadId } = job.data;
    this.logger.log(`Starting nurture for lead: ${leadId}`);

    try {
      this.reportProgress(job, 10);

      // Fetch lead details for the agent
      const lead = await this.prisma.lead.findUnique({
        where: { id: leadId },
        include: { business: true },
      });

      if (!lead) {
        throw new Error(`Lead ${leadId} not found`);
      }

      this.reportProgress(job, 30);

      // Generate "Value Drop" content
      const valueDrop = await this.nurtureAgent.generateValueDrop(lead);

      this.reportProgress(job, 70);

      // Log the nurture action
      await this.prisma.auditLog.create({
        data: {
          actorType: "AGENT",
          action: "LEAD_NURTURE_SENT",
          targetType: "LEAD",
          targetId: leadId,
          metadata: {
            agent: "NurtureAgent",
            topic: valueDrop.topic,
            subject: valueDrop.subject,
          },
        },
      });

      // Update lead (status update if needed, currently just trigger update)
      await this.prisma.lead.update({
        where: { id: leadId },
        data: {}, // No lastContactAt field in schema, updatedAt will refresh
      });

      // Emit nurture event
      await this.eventBus.publish({
        eventType: EVENTS.LEAD_STATUS_CHANGED, // Or a specific NURTURED event if exists
        timestamp: new Date().toISOString(),
        correlationId: `nurture-${leadId}-${Date.now()}`,
        actorType: "AGENT",
        payload: {
          leadId,
          action: "NURTURED",
          topic: valueDrop.topic,
        },
      });

      this.reportProgress(job, 100);
      this.logger.log(`Nurture completed for lead: ${leadId}`);

      return valueDrop;
    } catch (error) {
      this.handleFailure(job, error);
      throw error;
    }
  }
}
