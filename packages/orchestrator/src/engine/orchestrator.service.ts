import { Injectable, Logger } from '@nestjs/common';
import { LeadStatus } from '@agency/db';

export enum AGENT_QUEUES {
    RESEARCH = 'research-queue',
    AUDIT = 'audit-queue',
    QUALIFICATION = 'qualification-queue',
    ENRICHMENT = 'enrichment-queue',
    OUTREACH = 'outreach-queue',
    DEMO = 'demo-queue',
    PROPOSAL = 'proposal-queue',
    BILLING = 'billing-queue',
    BUILD = 'build-queue',
    CONTENT = 'content-queue',
    RELIABILITY = 'reliability-queue',
    CLIENT_SUCCESS = 'client-success-queue',
    SALES_CLOSE = 'sales-close-queue'
}

@Injectable()
export class OrchestratorService {
    private readonly logger = new Logger(OrchestratorService.name);

    /**
     * Maps a LeadStatus to the appropriate agent queue for processing.
     * Returns null if no automated action is defined for that state.
     */
    getQueueForStatus(status: LeadStatus): string | null {
        switch (status) {
            case 'DISCOVERED':
                return AGENT_QUEUES.RESEARCH;
            case 'RESEARCHED':
                return AGENT_QUEUES.AUDIT;
            case 'AUDITED':
                return AGENT_QUEUES.QUALIFICATION;
            case 'QUALIFIED':
                return AGENT_QUEUES.ENRICHMENT;
            case 'ENRICHED':
                return AGENT_QUEUES.OUTREACH;
            case 'PAID':
                return AGENT_QUEUES.BUILD;
            case 'BUILD_STARTED':
                return AGENT_QUEUES.CONTENT;
            case 'REPLIED':
                return AGENT_QUEUES.SALES_CLOSE; // Map to Close Agent (needs to be added)
            default:
                this.logger.debug(`No automated queue routing defined for status: ${status}`);
                return null;
        }
    }

    // Helper to get human readable description of the next step
    getStepDescription(status: LeadStatus): string {
        const queue = this.getQueueForStatus(status);
        if (!queue) return 'Manual intervention required';
        return `Routing to ${queue} for automated processing`;
    }
}
