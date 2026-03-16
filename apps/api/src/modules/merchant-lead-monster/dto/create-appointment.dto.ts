import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from "class-validator";
import { Transform } from "class-transformer";

const trim = ({ value }: { value: any }) =>
  typeof value === "string" ? value.trim() : value;

const trimOptional = ({ value }: { value: any }) => {
  const v = typeof value === "string" ? value.trim() : value;
  return v ? v : undefined;
};

export class CreateAppointmentDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  calculatorSessionId: string;

  @Transform(trim)
  @IsString()
  @MaxLength(120)
  @IsNotEmpty()
  name: string;

  @Transform(trim)
  @IsEmail()
  @MaxLength(254)
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @Transform(trimOptional)
  @IsString()
  @MaxLength(32)
  @Matches(/^[+0-9()\-\s]{7,32}$/)
  phone?: string;

  @Transform(trim)
  @IsString()
  @MaxLength(160)
  @IsNotEmpty()
  businessName: string;

  @IsOptional()
  @Transform(trimOptional)
  @IsString()
  @MaxLength(120)
  preferredTimeWindow?: string;

  @IsOptional()
  @Transform(trimOptional)
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
