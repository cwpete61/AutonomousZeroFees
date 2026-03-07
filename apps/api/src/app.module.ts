import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { HealthController } from './health.controller';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { LeadsModule } from './modules/leads/leads.module';
import { BusinessesModule } from './modules/businesses/businesses.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';

@Module({
  imports: [
    // Environment configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),

    // Rate limiting
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),

    // Global modules
    PrismaModule,

    // Feature modules
    AuthModule,
    UsersModule,
    LeadsModule,
    BusinessesModule,
    WebhooksModule,
    // OutreachModule,
    // BillingModule,
    // ApprovalsModule,
    // CampaignsModule,
    // NotificationsModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
