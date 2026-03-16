import { Controller, Post, Get, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BackupsService } from './backups.service';

@ApiTags('backups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('backups')
export class BackupsController {
    constructor(private backupsService: BackupsService) { }

    @Post('run')
    @ApiOperation({ summary: 'Trigger a manual database backup' })
    async triggerBackup(@Query('type') type: 'FULL_DB' | 'MANUAL_SNAPSHOT' = 'MANUAL_SNAPSHOT') {
        const result = await this.backupsService.runBackup(type);
        return { message: 'Backup initiated', ...result };
    }

    @Get('list')
    @ApiOperation({ summary: 'List recent backup jobs' })
    async listBackups() {
        return this.backupsService.listBackups();
    }
}
