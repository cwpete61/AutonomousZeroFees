import { Module } from "@nestjs/common";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { HealthController } from "./health.controller";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { LeadsModule } from "./modules/leads/leads.module";
import { BusinessesModule } from "./modules/businesses/businesses.module";
import { PrismaModule } from "./modules/prisma/prisma.module";
import { WebhooksModule } from "./modules/webhooks/webhooks.module";
import { CampaignsModule } from "./modules/campaigns/campaigns.module";
import { AiModule } from "./modules/ai/ai.module";
import { EmailSequencesModule } from "./modules/email-sequences/email-sequences.module";
import { BillingModule } from "./modules/billing/billing.module";
import { ApprovalsModule } from "./modules/approvals/approvals.module";
import { BackupsModule } from "./modules/backups/backups.module";
import { MaintenanceModule } from "./modules/maintenance/maintenance.module";
import { IncidentsModule } from "./modules/incidents/incidents.module";
import { AgentsModule } from "./modules/agents/agents.module";
import { DiagnosticsModule } from "./modules/diagnostics/diagnostics.module";
import { SettingsModule } from "./modules/settings/settings.module";
import { MerchantLeadMonsterModule } from "./modules/merchant-lead-monster/merchant-lead-monster.module";
import { BullModule } from "@nestjs/bull";
import { EventsModule } from "@agency/events";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { AuditInterceptor } from "./common/interceptors/audit.interceptor";
import { secretsLoader } from "@agency/utils";

@Module({
  imports: [
    // Environment configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: "../../.env",
      load: [secretsLoader],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Queue infrastructure
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get("REDIS_HOST", "localhost"),
          port: parseInt(configService.get("REDIS_PORT", "6379"), 10),
        },
      }),
      inject: [ConfigService],
    }),

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
    BackupsModule,
    MaintenanceModule,
    IncidentsModule,
    AgentsModule,
    DiagnosticsModule,
    SettingsModule,
    EventsModule,
    ...(process.env.MERCHANT_LEAD_MONSTER_ENABLED === "true" ||
    process.env.MLM_ENABLED === "true"
      ? [MerchantLeadMonsterModule]
      : []),
    // OutreachModule,
    // NotificationsModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}
