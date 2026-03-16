import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';

const execAsync = promisify(exec);

@Injectable()
export class BackupsService {
    private readonly logger = new Logger(BackupsService.name);
    private readonly backupPath = this.configService.get<string>('BACKUP_LOCAL_PATH') || './backups';

    constructor(
        private configService: ConfigService,
        private prisma: PrismaService,
    ) {
        if (!fs.existsSync(this.backupPath)) {
            fs.mkdirSync(this.backupPath, { recursive: true });
        }
    }

    async runBackup(type: 'FULL_DB' | 'MANUAL_SNAPSHOT' = 'FULL_DB') {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `backup-${timestamp}.sql`;
        const filepath = path.join(this.backupPath, filename);

        const dbUrl = this.configService.get<string>('DATABASE_URL');
        // Extract database name from URL if possible, or use env var
        const dbName = this.configService.get<string>('POSTGRES_DB') || 'agency';

        const job = await this.prisma.backupJob.create({
            data: {
                backupType: type,
                status: 'RUNNING',
                startedAt: new Date(),
            },
        });

        try {
            this.logger.log(`Starting backup job ${job.id} to ${filepath}...`);
            
            // NOTE: pg_dump must be in the PATH of the environment
            // Using PGPASSWORD is a common way to pass password without prompt
            const pgPassword = this.configService.get<string>('POSTGRES_PASSWORD');
            const env = { ...process.env, PGPASSWORD: pgPassword };

            // Command: pg_dump -U [user] -h [host] -p [port] [db] > [file]
            // For simple DATABASE_URL parsing or just using the URL directly if pg_dump supports it
            // pg_dump "[DATABASE_URL]" > [file]
            await execAsync(`pg_dump "${dbUrl}" > "${filepath}"`, { env });

            await this.prisma.backupJob.update({
                where: { id: job.id },
                data: {
                    status: 'COMPLETED',
                    finishedAt: new Date(),
                    artifactPath: filepath,
                },
            });

            this.logger.log(`Backup job ${job.id} completed successfully.`);
            return { id: job.id, path: filepath };
        } catch (error) {
            this.logger.error(`Backup job ${job.id} failed: ${error.message}`);
            await this.prisma.backupJob.update({
                where: { id: job.id },
                data: {
                    status: 'FAILED',
                    finishedAt: new Date(),
                },
            });
            throw error;
        }
    }

    async listBackups() {
        return this.prisma.backupJob.findMany({
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
    }
}
