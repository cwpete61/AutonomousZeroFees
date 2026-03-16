import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@agency/db';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    this.$connect().catch(err => {
      console.error('[Prisma] Database connection failed:', err.message);
    });
  }
}
