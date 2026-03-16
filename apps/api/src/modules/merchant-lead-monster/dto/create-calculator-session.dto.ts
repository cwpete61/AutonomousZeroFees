import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from "class-validator";
import { Transform, Type } from "class-transformer";

const trim = ({ value }: { value: any }) =>
  typeof value === "string" ? value.trim() : value;

const trimOptional = ({ value }: { value: any }) => {
  const v = typeof value === "string" ? value.trim() : value;
  return v ? v : undefined;
};

export class UtmDto {
  @IsOptional()
  @Transform(trimOptional)
  @IsString()
  @MaxLength(200)
  source?: string;

  @IsOptional()
  @Transform(trimOptional)
  @IsString()
  @MaxLength(200)
  medium?: string;

  @IsOptional()
  @Transform(trimOptional)
  @IsString()
  @MaxLength(200)
  campaign?: string;

  @IsOptional()
  @Transform(trimOptional)
  @IsString()
  @MaxLength(200)
  term?: string;

  @IsOptional()
  @Transform(trimOptional)
  @IsString()
  @MaxLength(200)
  content?: string;
}

export class CreateCalculatorSessionDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  monthlyVolumeUsd: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  currentRatePct: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UtmDto)
  utm?: UtmDto;

  @IsOptional()
  @Transform(trimOptional)
  @IsString()
  @MaxLength(500)
  referrer?: string;
}
