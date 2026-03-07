import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),

    // Queue processors will be registered here:
    // BullModule.forRoot({ ... }),
    // ScoutQueueModule,
    // OutreachQueueModule,
    // DesignPreviewQueueModule,
    // SalesCloseQueueModule,
    // WebBuildQueueModule,
    // ClientSuccessQueueModule,
    // ContentQueueModule,
    // MaintenanceQueueModule,
  ],
  controllers: [HealthController],
})
export class WorkersModule {}
