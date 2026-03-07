import { Controller, Post, Body, Headers, BadRequestException, RawBodyRequest, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LeadsService } from '../leads/leads.service';
import { LeadStatus } from '@agency/db';
import Stripe from 'stripe';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private leadsService: LeadsService,
  ) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2024-04-10' as any,
    });
  }

  @Post('stripe')
  @ApiOperation({ summary: 'Handle Stripe webhook events with signature verification' })
  async handleStripe(@Req() req: RawBodyRequest<Request>, @Headers('stripe-signature') signature: string) {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

    let event: Stripe.Event;

    try {
      if (webhookSecret && signature) {
        // Use rawBody for verification
        event = this.stripe.webhooks.constructEvent(
          (req as any).rawBody,
          signature,
          webhookSecret,
        );
      } else {
        // Fallback for development (if secret not set)
        event = req.body as any;
      }
    } catch (err) {
      console.error(`[Webhook Error] Signature verification failed: ${err.message}`);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    console.log('[Webhook] Stripe event verified:', event.type);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const leadId = session.client_reference_id;

      if (leadId) {
        console.log(`[Webhook] Payment completed for lead ${leadId}. Advancing to PAID.`);
        await this.leadsService.updateStage(leadId, LeadStatus.PAID);
      }
    }

    return { received: true };
  }

  @Post('email')
  @ApiOperation({ summary: 'Handle inbound email events (replies)' })
  async handleEmail(@Body() payload: any) {
    console.log('[Webhook] Email event received:', payload);

    // Assume payload contains leadId or we can find it via email mapping
    const leadId = payload.leadId;

    if (leadId) {
      console.log(`[Webhook] Reply received for lead ${leadId}. Advancing to REPLIED.`);
      await this.leadsService.updateStage(leadId, LeadStatus.REPLIED);
    }

    return { received: true };
  }

  @Post('twilio')
  @ApiOperation({ summary: 'Handle inbound Twilio (SMS) events' })
  async handleTwilio(@Body() payload: any) {
    console.log('[Webhook] Twilio message received:', payload);

    // Twilio usually sends 'From' and 'Body'. We'd lookup the lead by phone.
    const fromPhone = payload.From;

    if (fromPhone) {
      // Stub: In a real app, find lead by phone first
      // const lead = await this.leadsService.findByPhone(fromPhone);
      // if (lead) await this.leadsService.updateStage(lead.id, LeadStatus.REPLIED);
      console.log(`[Webhook] SMS reply from ${fromPhone}. Stage update logic would trigger here.`);
    }

    return { received: true };
  }
}
