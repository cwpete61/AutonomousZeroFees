import { IsString, IsArray, ValidateNested, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class EmailStepDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    @Min(1)
    stepNumber: number;

    @ApiProperty({ example: 0, description: 'Days to wait after previous email (0 for first)' })
    @IsInt()
    @Min(0)
    delayDays: number;

    @ApiPropertyOptional({ example: 'Initial Outreach' })
    @IsString()
    @IsOptional()
    subject?: string;

    @ApiPropertyOptional({ example: 'Hello, I saw your website...' })
    @IsString()
    @IsOptional()
    body?: string;
}

export class CreateEmailSequenceDto {
    @ApiProperty({ example: 'Home Service Cold Outreach' })
    @IsString()
    name: string;

    @ApiProperty({ type: [EmailStepDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => EmailStepDto)
    steps: EmailStepDto[];

    @ApiPropertyOptional({ example: 'cuid_of_campaign' })
    @IsString()
    @IsOptional()
    assignedCampaignId?: string;

    @ApiPropertyOptional({ example: true, default: false })
    @IsOptional()
    autoWriteEmail?: boolean;
}
