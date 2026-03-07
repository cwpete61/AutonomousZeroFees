import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { HealthController } from './health.controller';
import { EventsModule } from '@agency/events';
import { OrchestratorModule } from '@agency/orchestrator';
import { DbModule } from '@agency/db';
import { WorkflowListener } from './runners/workflow.listener';
import { ScoutProcessor } from './jobs/scout.processor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),

    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: 'localhost', // Simplified for now, should use REDIS_URL parse
          port: 6379,
        },
      }),
      inject: [ConfigService],
    }),

    BullModule.registerQueue(
      { name: 'research-queue' },
      { name: 'audit-queue' },
      { name: 'qualification-queue' },
      { name: 'enrichment-queue' },
      { name: 'outreach-queue' },
      { name: 'build-queue' },
      { name: 'content-queue' },
      { name: 'sales-close-queue' },
    ),

    EventsModule,
    OrchestratorModule,
    DbModule,
  ],
  controllers: [HealthController],
  providers: [WorkflowListener, ScoutProcessor],
})
export class WorkersModule { }
