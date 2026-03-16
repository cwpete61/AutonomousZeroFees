import { IsString, IsNotEmpty, IsEmail, IsOptional, MaxLength } from 'class-validator';

export class CreateAppointmentDto {
  @IsString()
  @IsNotEmpty()
  calculatorSessionId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(254)
  email: string;

  @IsString()
  @IsOptional()
  @MaxLength(32)
  phone?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  businessName: string;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  preferredTimeWindow?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  notes?: string;
}
