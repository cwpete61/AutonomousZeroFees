import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { AiService } from './ai.service';
import { IsString, IsNumber, Min, Max, IsOptional } from 'class-validator';

export class GenerateEmailsDto {
    @IsString()
    industry: string;

    @IsString()
    pain_point_signal: string;

    @IsString()
    primary_outcome: string;

    @IsOptional()
    @IsString()
    secondary_outcome?: string;

    @IsString()
    sender_name: string;

    @IsString()
    sender_company: string;

    @IsNumber()
    @Min(3)
    @Max(5)
    step_count: number; // 3 | 4 | 5

    @IsOptional()
    @IsString()
    provider?: 'anthropic' | 'openai';

    @IsOptional()
    @IsString()
    model?: string;
}

@Controller('ai')
export class AiController {
    constructor(private readonly aiService: AiService) { }

    @Post('generate-emails')
    async generateEmails(@Body() dto: GenerateEmailsDto) {
        return this.aiService.generateEmailSequence(dto);
    }
}
