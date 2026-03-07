import { IsString, IsOptional, IsUrl } from 'class-validator';

export class CreateBusinessDto {
  @IsString()
  name: string;

  @IsString()
  niche: string;

  @IsOptional()
  @IsUrl()
  websiteUrl?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;
}
