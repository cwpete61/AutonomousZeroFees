import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { DiagnosticsService } from './diagnostics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('diagnostics')
export class DiagnosticsController {
    constructor(private readonly diagnosticsService: DiagnosticsService) { }

    @UseGuards(JwtAuthGuard)
    @Post('workflow-test')
    async runWorkflowTest(@Body() body: { url?: string; urls?: string[] }) {
        const input = body.urls || body.url || [];
        return this.diagnosticsService.runWorkflowTest(input);
    }
}
