import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { BaseProcessor } from './base.processor';
import { ScoutAgent } from '@agency/agents';
import { AGENT_QUEUES } from '@agency/orchestrator';
import { PrismaService } from '@agency/db';

@Processor('research-queue')
export class ScoutProcessor extends BaseProcessor {
    private readonly scoutAgent: ScoutAgent;

    constructor(private readonly prisma: PrismaService) {
        super(ScoutProcessor.name);
        this.scoutAgent = new ScoutAgent();
    }

    @Process('process')
    async handleResearch(job: Job<any>) {
        const { id: leadId, ...data } = job.data;
        this.logger.log(`Starting research for lead: ${leadId}`);

        try {
            this.reportProgress(job, 10);

            // Call the agent's research logic
            const results = await this.scoutAgent.evaluateBusiness(data);

            this.reportProgress(job, 70);

            // Update lead and create audit log
            await this.prisma.$transaction([
                this.prisma.lead.update({
                    where: { id: leadId },
                    data: {
                        status: 'RESEARCHED',
                        qualificationScore: results.qualityScore, // using qualificationScore for now as qualityScore proxy
                        discoveryNotes: results.redesignPitch,
                    }
                }),
                this.prisma.auditLog.create({
                    data: {
                        actorType: 'AGENT',
                        action: 'LEAD_RESEARCH_COMPLETED',
                        targetType: 'LEAD',
                        targetId: leadId,
                        metadata: {
                            agent: 'ScoutAgent',
                            qualityScore: results.qualityScore,
                            issues: results.issues
                        }
                    }
                })
            ]);

            this.reportProgress(job, 100);
            this.logger.log(`Research completed for lead: ${leadId}. Quality Score: ${results.qualityScore}`);

            return results;
        } catch (error) {
            this.handleFailure(job, error);
            throw error;
        }
    }
}
