import { IsString, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { LeadStatus, LeadPriority } from '@agency/db';

export class CreateLeadDto {
  @IsString()
  businessId: string;

  @IsEnum(LeadStatus)
  status: LeadStatus;

  @IsOptional()
  @IsEnum(LeadPriority)
  priority?: LeadPriority;

  @IsOptional()
  @IsString()
  source?: string;
}
