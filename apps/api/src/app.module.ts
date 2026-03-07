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
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { AiModule } from './modules/ai/ai.module';
import { EmailSequencesModule } from './modules/email-sequences/email-sequences.module';
import { BillingModule } from './modules/billing/billing.module';
import { ApprovalsModule } from './modules/approvals/approvals.module';
import { EventsModule } from '@agency/events';

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
    CampaignsModule,
    AiModule,
    EmailSequencesModule,
    BillingModule,
    ApprovalsModule,
    EventsModule,
    // OutreachModule,
    // NotificationsModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule { }
