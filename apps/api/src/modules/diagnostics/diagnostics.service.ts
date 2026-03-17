import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { CampaignStatus, LeadStatus } from '@agency/db';

@Injectable()
export class DiagnosticsService {
    private readonly logger = new Logger(DiagnosticsService.name);

    constructor(
        private prisma: PrismaService,
        @InjectQueue('research-queue') private researchQueue: Queue
    ) { }

    async runWorkflowTest(urls: string | string[]) {
        const urlList = Array.isArray(urls) ? urls : [urls];
        this.logger.log(`Starting workflow test diagnostic for ${urlList.length} URLs`);

        // 1. Ensure a diagnostic campaign exists
        let campaign = await this.prisma.campaign.findFirst({
            where: { name: 'SYSTEM_DIAGNOSTIC_CAMPAIGN' }
        });

        if (!campaign) {
            campaign = await this.prisma.campaign.create({
                data: {
                    name: 'SYSTEM_DIAGNOSTIC_CAMPAIGN',
                    niche: 'Diagnostic',
                    geography: 'Global',
                    status: CampaignStatus.ACTIVE,
                    sourceConfig: { diagnostic: true },
                    thresholds: { minScore: 0 }
                }
            });
        }

        const results = [];

        for (const url of urlList) {
            try {
                const cleanUrl = url.trim();
                if (!cleanUrl) continue;

                // 2. Create a temporary business and lead
                const business = await this.prisma.business.create({
                    data: {
                        name: `Diagnostic: ${new URL(cleanUrl).hostname}`,
                        websiteUrl: cleanUrl,
                        niche: 'Diagnostic'
                    }
                });

                const lead = await this.prisma.lead.create({
                    data: {
                        campaignId: campaign.id,
                        businessId: business.id,
                        status: 'DISCOVERED' as LeadStatus,
                    },
                    include: { business: true }
                });

                // 3. Manually enqueue to research-queue
                await this.researchQueue.add('research', lead, {
                    attempts: 1, // diagnostic should be quick
                    removeOnComplete: true
                });

                results.push({ url: cleanUrl, leadId: lead.id, status: 'started' });
            } catch (err) {
                this.logger.error(`Failed to start diagnostic for ${url}: ${err.message}`);
                results.push({ url, status: 'failed', error: err.message });
            }
        }

        return {
            message: `Diagnostic workflow started for ${results.filter(r => r.status === 'started').length} URLs`,
            results,
            campaignId: campaign.id
        };
    }
}
