import { Process, Processor } from "@nestjs/bull";
import { Logger } from "@nestjs/common";
import { Job } from "bull";
import { BaseProcessor } from "./base.processor";
import { ErrorAgent } from "@agency/agents";
import { PrismaService } from "@agency/db";
import { RedisEventBus, EVENTS } from "@agency/events";

@Processor("error-queue")
export class ErrorProcessor extends BaseProcessor {
  private readonly errorAgent: any;

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: RedisEventBus,
  ) {
    super(ErrorProcessor.name);
    this.errorAgent = new ErrorAgent();
  }

  @Process("handle")
  async handleAgentError(job: Job<any>) {
    const { error, context, leadId } = job.data;
    this.logger.error(
      `Handling agent error for lead ${leadId}: ${error.message}`,
    );

    try {
      this.reportProgress(job, 10);

      // Log incident in the database
      await this.prisma.auditLog.create({
        data: {
          actorType: "SYSTEM",
          action: "AGENT_ERROR_DETECTED",
          targetType: "LEAD",
          targetId: leadId,
          metadata: {
            error: error.message,
            stack: error.stack,
            context,
          },
        },
      });

      // Emit incident opened event
      await this.eventBus.publish({
        eventType: EVENTS.INCIDENT_OPENED,
        timestamp: new Date().toISOString(),
        correlationId: `error-${leadId}-${Date.now()}`,
        actorType: "SYSTEM",
        payload: {
          leadId,
          error: error.message,
          context,
        },
      });

      this.reportProgress(job, 100);
      return { status: "logged", incidentId: leadId };
    } catch (err) {
      this.logger.error(`Failed to handle agent error: ${err.message}`);
      throw err;
    }
  }
}
