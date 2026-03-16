import { Process, Processor } from "@nestjs/bull";
import { Logger } from "@nestjs/common";
import { Job } from "bull";
import { BaseProcessor } from "./base.processor";
import { ContentAgent } from "@agency/agents";
import { PrismaService, ContentAssetType } from "@agency/db";
import { RedisEventBus, EVENTS } from "@agency/events";

@Processor("content-queue")
export class ContentProcessor extends BaseProcessor {
  private readonly contentAgent: any;

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: RedisEventBus,
  ) {
    super(ContentProcessor.name);
    this.contentAgent = new ContentAgent();
  }

  @Process("process")
  async handleContentGeneration(job: Job<any>) {
    const { id: leadId, assetType, ...data } = job.data;
    this.logger.log(
      `Starting content generation for lead: ${leadId} | Type: ${assetType}`,
    );

    try {
      this.reportProgress(job, 10);

      // Prepare brief for the content agent
      const brief = {
        businessName: data.business?.name || data.name,
        industry: data.business?.industry || data.industry,
        city: data.business?.city || data.city,
        services: data.business?.services || [],
        googleRating: data.business?.googleRating,
        googleReviews: data.business?.googleReviews,
      };

      // Call the agent's content generation logic
      const content = await this.contentAgent.generateContent(
        brief,
        assetType || "SERVICE_PAGE",
      );

      this.reportProgress(job, 80);

      // Store the generated content asset in the database
      const asset = await this.prisma.contentAsset.create({
        data: {
          assetType: (assetType || "SERVICE_PAGE") as any,
          title: content.title,
          body: content.body,
          metadataJson: content.metadataJson as any,
          // If we have a project link, we'd add it here
        },
      });

      await this.prisma.auditLog.create({
        data: {
          actorType: "AGENT",
          action: "CONTENT_ASSET_GENERATED",
          targetType: "CONTENT_ASSET",
          targetId: asset.id,
          metadata: {
            agent: "ContentAgent",
            leadId,
            assetType,
          },
        },
      });

      this.reportProgress(job, 100);
      this.logger.log(
        `Content generation completed for lead: ${leadId}. Asset ID: ${asset.id}`,
      );

      return content;
    } catch (error) {
      this.handleFailure(job, error);
      throw error;
    }
  }
}
