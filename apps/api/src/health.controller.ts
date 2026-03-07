import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      service: 'agency-api',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
