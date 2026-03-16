import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class CreateCalculatorSessionDto {
  @IsString()
  @IsNotEmpty()
  monthlyVolumeUsd: string;

  @IsString()
  @IsNotEmpty()
  currentRatePct: string;

  @IsObject()
  @IsOptional()
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };

  @IsString()
  @IsOptional()
  referrer?: string;
}
