import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { HealthController } from './health.controller';
import { EventsModule } from '@agency/events';
import { OrchestratorModule } from '@agency/orchestrator';
import { DbModule, PrismaService } from '@agency/db';
import { ScoutAgent, OutreachAgent, NurtureAgent } from '@agency/agents';
import { WorkflowListener } from './runners/workflow.listener';
import { ScoutProcessor } from './jobs/scout.processor';
import { AuditProcessor } from './jobs/audit.processor';
import { OutreachProcessor } from './jobs/outreach.processor';
import { DemoProcessor } from './jobs/demo.processor';
import { SalesCloseProcessor } from './jobs/sales-close.processor';
import { ContentProcessor } from './jobs/content.processor';
import { WebBuildProcessor } from './jobs/web-build.processor';
import { ClientSuccessProcessor } from './jobs/client-success.processor';
import { ErrorProcessor } from './jobs/error.processor';
import { NurtureProcessor } from './jobs/nurture.processor';
import { secretsLoader } from '@agency/utils';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
      load: [secretsLoader],
    }),

    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: parseInt(configService.get('REDIS_PORT', '6379'), 10),
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
      { name: 'demo-queue' },
      { name: 'build-queue' },
      { name: 'content-queue' },
      { name: 'sales-close-queue' },
      { name: 'client-success-queue' },
      { name: 'error-queue' },
      { name: 'nurture-queue' },
    ),

    // Bull Board Monitoring UI
    BullBoardModule.forRoot({
      route: '/admin/queues',
      adapter: ExpressAdapter,
    }),

    BullBoardModule.forFeature(
      { name: 'research-queue', adapter: BullAdapter },
      { name: 'audit-queue', adapter: BullAdapter },
      { name: 'outreach-queue', adapter: BullAdapter },
      { name: 'demo-queue', adapter: BullAdapter },
      { name: 'build-queue', adapter: BullAdapter },
      { name: 'content-queue', adapter: BullAdapter },
      { name: 'sales-close-queue', adapter: BullAdapter },
      { name: 'client-success-queue', adapter: BullAdapter },
      { name: 'error-queue', adapter: BullAdapter },
      { name: 'nurture-queue', adapter: BullAdapter },
    ),

    EventsModule,
    OrchestratorModule,
    DbModule,
  ],
  controllers: [HealthController],
  providers: [
    WorkflowListener,
    ScoutProcessor,
    AuditProcessor,
    OutreachProcessor,
    DemoProcessor,
    SalesCloseProcessor,
    ContentProcessor,
    WebBuildProcessor,
    ClientSuccessProcessor,
    ErrorProcessor,
    NurtureProcessor,
    {
      provide: ScoutAgent,
      useFactory: (prisma: PrismaService) => new ScoutAgent({ db: prisma }),
      inject: [PrismaService],
    },
    {
      provide: OutreachAgent,
      useValue: new OutreachAgent(),
    },
    {
      provide: NurtureAgent,
      useValue: new NurtureAgent(),
    },
  ],
})
export class WorkersModule { }
