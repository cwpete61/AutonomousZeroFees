import { Process, Processor } from "@nestjs/bull";
import { Logger } from "@nestjs/common";
import { Job } from "bull";
import { BaseProcessor } from "./base.processor";
import { ClientSuccessAgent } from "@agency/agents";
import { PrismaService, LeadStatus } from "@agency/db";
import { RedisEventBus, EVENTS } from "@agency/events";

@Processor("client-success-queue")
export class ClientSuccessProcessor extends BaseProcessor {
  private readonly successAgent: any;

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: RedisEventBus,
  ) {
    super(ClientSuccessProcessor.name);
    this.successAgent = new ClientSuccessAgent();
  }

  @Process("onboard")
  async handleOnboarding(job: Job<any>) {
    const { id: leadId, ...data } = job.data;
    this.logger.log(`Onboarding new client: ${leadId}`);

    try {
      this.reportProgress(job, 10);

      const result = await this.successAgent.onboard(job.data);

      this.reportProgress(job, 100);
      return result;
    } catch (error) {
      this.handleFailure(job, error);
      throw error;
    }
  }

  @Process("deliver")
  async handleDelivery(job: Job<any>) {
    const { id: leadId, ...data } = job.data;
    this.logger.log(`Delivering final project results to client: ${leadId}`);

    try {
      this.reportProgress(job, 10);

      const result = await this.successAgent.deliver(job.data);

      // Update status to CLOSED_WON on successful delivery
      await this.prisma.lead.update({
        where: { id: leadId },
        data: {
          status: LeadStatus.CLOSED_WON,
        },
      });

      this.reportProgress(job, 100);
      return result;
    } catch (error) {
      this.handleFailure(job, error);
      throw error;
    }
  }
}
