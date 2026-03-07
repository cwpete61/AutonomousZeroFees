import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { RedisEventBus, EVENTS, DomainEvent } from '@agency/events';
import { OrchestratorService } from '@agency/orchestrator';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class WorkflowListener implements OnModuleInit {
    private readonly logger = new Logger(WorkflowListener.name);

    constructor(
        private readonly eventBus: RedisEventBus,
        private readonly orchestrator: OrchestratorService,
        @InjectQueue('research-queue') private researchQueue: Queue,
        @InjectQueue('audit-queue') private auditQueue: Queue,
        @InjectQueue('qualification-queue') private qualificationQueue: Queue,
        @InjectQueue('enrichment-queue') private enrichmentQueue: Queue,
        @InjectQueue('outreach-queue') private outreachQueue: Queue,
        @InjectQueue('build-queue') private buildQueue: Queue,
        @InjectQueue('content-queue') private contentQueue: Queue,
    ) { }

    async onModuleInit() {
        this.logger.log('Initializing WorkflowListener: Subscribing to LEAD_STATUS_CHANGED');

        await this.eventBus.subscribe(EVENTS.LEAD_STATUS_CHANGED, async (event: DomainEvent) => {
            await this.handleLeadStatusChange(event);
        });

        await this.eventBus.subscribe(EVENTS.LEAD_CREATED, async (event: DomainEvent) => {
            await this.handleLeadCreated(event);
        });
    }

    private async handleLeadCreated(event: DomainEvent) {
        this.logger.log(`New lead created: ${event.payload.id}. Routing to initial processing.`);
        await this.researchQueue.add('process', event.payload, {
            jobId: `research-${event.payload.id}`,
            removeOnComplete: true,
        });
    }

    private async handleLeadStatusChange(event: DomainEvent) {
        const { leadId, to, lead } = event.payload;
        this.logger.log(`Handling status change for lead ${leadId}: ${to}`);

        const queueName = this.orchestrator.getQueueForStatus(to);
        if (!queueName) return;

        const queueMap: Record<string, Queue> = {
            'research-queue': this.researchQueue,
            'audit-queue': this.auditQueue,
            'qualification-queue': this.qualificationQueue,
            'enrichment-queue': this.enrichmentQueue,
            'outreach-queue': this.outreachQueue,
            'build-queue': this.buildQueue,
            'content-queue': this.contentQueue,
        };

        const targetQueue = queueMap[queueName];
        if (targetQueue) {
            this.logger.log(`Routing lead ${leadId} to ${queueName}`);
            await targetQueue.add('process', lead, {
                jobId: `${queueName}-${leadId}-${Date.now()}`,
                removeOnComplete: true,
            });
        }
    }
}
