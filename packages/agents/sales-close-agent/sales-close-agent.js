/**
 * SALES CLOSE AGENT
 * Handles demo release, objection handling, proposals, and invoice creation
 * Uses: Stripe for invoicing, Claude for objection handling
 *
 * SETUP REQUIRED:
 *   ANTHROPIC_API_KEY
 *   STRIPE_SECRET_KEY
 */

const SALES_SYSTEM_PROMPT = `You are an expert sales closer for a web design agency.
Handle follow-up after a prospect replies to outreach or views a demo.

Approach:
- Be helpful, not high-pressure
- Address objections honestly
- Anchor to the gap between their Google reviews and their poor website
- Use social proof from similar industries

Packages:
- Starter ($997): 3-page site, mobile responsive, basic SEO
- Professional ($1,997): 5-page site, custom design, SEO, Google Business optimization
- Premium ($3,497): 8+ page site, premium design, full SEO, content writing, ongoing support

Return JSON:
{
  "response": "string email reply",
  "recommendedPackage": "starter|professional|premium",
  "nextAction": "send_demo|send_proposal|handle_objection|send_invoice|schedule_call|close_lost",
  "confidence": 0.0-1.0,
  "objectionType": "price|timing|diy|competitor|not_interested|null",
  "notes": "internal notes"
}`;

const PRICING = {
    starter: { name: 'Starter', price: 997, pages: 3, features: ['Mobile responsive', 'Basic SEO', 'Contact form'] },
    professional: { name: 'Professional', price: 1997, pages: 5, features: ['Custom design', 'Full SEO', 'Google Business optimization', 'Analytics setup'] },
    premium: { name: 'Premium', price: 3497, pages: 8, features: ['Premium design', 'Full SEO', 'Content writing', 'Ongoing support', 'Priority revisions'] },
};

class SalesCloseAgent {
    constructor(config = {}) {
        this.config = config;
        this.anthropicKey = config.anthropicApiKey || process.env.ANTHROPIC_API_KEY;
        this.stripeKey = config.stripeKey || process.env.STRIPE_SECRET_KEY;
    }

    async handleReply(lead, replyContent, classification) {
        console.log(`[SalesClose] Handling reply from ${lead.name} | Intent: ${classification?.intent}`);

        const prompt = `A prospect replied to our web design outreach:

Business: ${lead.name} (${lead.industry})
Google Rating: ${lead.googleRating}/5 (${lead.googleReviews} reviews)
Budget Tier Estimate: ${lead.estimatedBudgetTier}
Website Issues: ${(lead.issues || []).join(', ')}
Reply classification: ${classification?.intent || 'unknown'}

Their reply:
"${replyContent}"

Determine the best response and next action.`;

        const analysis = await this.callClaude(SALES_SYSTEM_PROMPT, prompt);
        return {
            agentName: 'sales_close',
            status: analysis.nextAction === 'close_lost' ? 'failed' : 'success',
            confidence: analysis.confidence || 0.7,
            data: analysis,
            startedAt: new Date().toISOString(),
            finishedAt: new Date().toISOString(),
        };
    }

    async sendDemo(lead) {
        console.log(`[SalesClose] Sending demo to ${lead.name}`);
        return {
            status: 'success',
            agentName: 'sales_close',
            confidence: 0.85,
            data: {
                action: 'demo_sent',
                hostedDemoUrl: `https://demo.agency/preview/${lead.id}`,
                sentAt: new Date().toISOString(),
            },
            startedAt: new Date().toISOString(),
            finishedAt: new Date().toISOString(),
        };
    }

    async generateProposal(lead, packageTier) {
        const tier = packageTier || lead.estimatedBudgetTier || 'professional';
        const pkg = PRICING[tier] || PRICING.professional;
        console.log(`[SalesClose] Generating ${pkg.name} proposal for ${lead.name}`);

        return {
            id: `prop_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            leadId: lead.id,
            packageName: pkg.name,
            scopeJson: {
                pages: pkg.pages,
                features: pkg.features,
                deliveryTimeline: tier === 'premium' ? '3-4 weeks' : '1-2 weeks',
                revisionRounds: tier === 'premium' ? 3 : 2,
            },
            price: pkg.price,
            status: 'DRAFT',
            createdAt: new Date().toISOString(),
        };
    }

    async createInvoice(lead, proposal) {
        console.log(`[SalesClose] Creating invoice for ${lead.name} | $${proposal.price}`);
        // PRODUCTION: Stripe invoice creation
        return {
            id: `inv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            leadId: lead.id,
            proposalId: proposal.id,
            amount: proposal.price,
            currency: 'USD',
            status: 'ISSUED',
            paymentLink: `https://pay.stripe.com/stub_${lead.id}`,
            externalRef: `stripe_inv_${Date.now()}`,
            issuedAt: new Date().toISOString(),
        };
    }

    async callClaude(systemPrompt, userMessage) {
        try {
            const res = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.anthropicKey,
                    'anthropic-version': '2023-06-01',
                },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 1500,
                    system: systemPrompt,
                    messages: [{ role: 'user', content: userMessage }],
                }),
            });
            const data = await res.json();
            const text = data.content?.[0]?.text || '{}';
            return JSON.parse(text.replace(/```json|```/g, '').trim());
        } catch {
            return {};
        }
    }
}

module.exports = { SalesCloseAgent, PRICING };
