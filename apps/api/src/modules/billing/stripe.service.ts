import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
    private stripe: Stripe;

    constructor(private configService: ConfigService) {
        const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
        this.stripe = new Stripe(secretKey || '', {
            apiVersion: '2023-10-16' as any, // Using a stable version
        });
    }

    async createCheckoutSession(params: {
        leadId: string;
        amount: number;
        currency?: string;
        packageName: string;
    }) {
        const { leadId, amount, currency = 'usd', packageName } = params;

        return this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency,
                        product_data: {
                            name: `Orbis Outreach - BPS — ${packageName}`,
                            description: `Web Design & SEO Services for Lead ${leadId}`,
                        },
                        unit_amount: Math.round(amount * 100), // cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            client_reference_id: leadId,
            success_url: `${this.configService.get('NEXT_PUBLIC_API_URL')}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${this.configService.get('NEXT_PUBLIC_API_URL')}/billing/cancel`,
            metadata: {
                leadId,
                packageName,
            },
        });
    }

    async createInvoice(params: {
        customerEmail: string;
        amount: number;
        description: string;
        metadata?: Record<string, string>;
    }) {
        // Step 1: Find or Create Customer
        let customer = (await this.stripe.customers.list({ email: params.customerEmail, limit: 1 })).data[0];
        if (!customer) {
            customer = await this.stripe.customers.create({
                email: params.customerEmail,
                metadata: params.metadata,
            });
        }

        // Step 2: Create Invoice Item
        await this.stripe.invoiceItems.create({
            customer: customer.id,
            amount: Math.round(params.amount * 100),
            currency: 'usd',
            description: params.description,
        });

        // Step 3: Create Invoice
        const invoice = await this.stripe.invoices.create({
            customer: customer.id,
            auto_advance: true,
            collection_method: 'send_invoice',
            days_until_due: 7,
            metadata: params.metadata,
        });

        // Step 4: Finalize and Send
        return this.stripe.invoices.sendInvoice(invoice.id);
    }

    verifyWebhookSignature(payload: string | Buffer, signature: string, secret: string) {
        return this.stripe.webhooks.constructEvent(payload, signature, secret);
    }
}
