import { Controller, Post, Body, Headers, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('webhooks')
export class WebhooksController {
  constructor(private configService: ConfigService) {}

  @Post('stripe')
  async handleStripe(@Body() payload: any, @Headers('stripe-signature') signature: string) {
    // In production, verify signature with Stripe library
    console.log('[Webhook] Stripe event received:', payload.type);
    return { received: true };
  }

  @Post('email')
  async handleEmail(@Body() payload: any) {
    console.log('[Webhook] Email event received:', payload);
    return { received: true };
  }
}
