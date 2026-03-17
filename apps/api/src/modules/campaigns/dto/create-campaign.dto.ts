import { IsString, IsOptional, IsObject, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CampaignStatus } from '@agency/db';

export class CreateCampaignDto {
    @ApiProperty({ description: 'Campaign display name' })
    @IsString()
    name: string;

    @ApiProperty({ description: 'Target niche / industry' })
    @IsString()
    niche: string;

    @ApiProperty({ description: 'Target geography string (e.g. Miami, FL)' })
    @IsString()
    geography: string;

    @ApiPropertyOptional({ description: 'Optional source config JSON' })
    @IsOptional()
    @IsObject()
    sourceConfig?: Record<string, unknown>;

    @ApiPropertyOptional({ description: 'Optional qualification thresholds JSON' })
    @IsOptional()
    @IsObject()
    thresholds?: Record<string, unknown>;

    @ApiPropertyOptional({ enum: CampaignStatus, default: CampaignStatus.ACTIVE })
    @IsOptional()
    @IsEnum(CampaignStatus)
    status?: CampaignStatus;

    @ApiPropertyOptional({ description: 'Optional email sequence ID' })
    @IsOptional()
    @IsString()
    emailSequenceId?: string;
}
