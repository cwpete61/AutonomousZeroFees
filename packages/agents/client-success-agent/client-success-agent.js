/**
 * CLIENT SUCCESS AGENT
 * Manages client onboarding, updates, revisions, and ongoing communication
 * Uses: Claude for message drafting, multi-channel delivery
 *
 * SETUP REQUIRED:
 *   ANTHROPIC_API_KEY
 *   RESEND_API_KEY or SENDGRID_API_KEY
 *   TWILIO credentials (WhatsApp/SMS)
 */

const CLIENT_SYSTEM_PROMPT = `You are a client success manager for a web design agency.
Your job is to keep clients informed, happy, and engaged throughout the build process.

Communication principles:
- Always over-communicate, never leave clients guessing
- Set clear expectations on timelines
- Proactively share progress updates with specifics
- Handle revision requests gracefully, scope boundary firmly but kindly
- Ask for reviews/referrals only after confirmed client satisfaction

Client lifecycle stages:
1. Onboarding — Welcome, gather brand assets, confirm scope
2. Build Updates — Weekly progress emails with screenshots
3. Review — Share staging URL, collect feedback
4. Revision — Handle revision rounds (2-3 depending on package)
5. Delivery — Final handoff, DNS/hosting setup instructions
6. Post-Launch — Check-in at 2 weeks, request Google review

Return JSON:
{
  "message": "string — the message to send",
  "channel": "email|sms|whatsapp|in_app",
  "tone": "string",
  "nextScheduledTouchpoint": "ISO date string or null",
  "internalNotes": "string"
}`;

class ClientSuccessAgent {
    constructor(config = {}) {
        this.config = config;
        this.anthropicKey = config.anthropicApiKey || process.env.ANTHROPIC_API_KEY;
    }

    /**
     * Send onboarding welcome message
     */
    async onboard(lead) {
        console.log(`[ClientSuccess] Onboarding ${lead.name}`);

        const prompt = `Write a welcome/onboarding message for a new client:

Business: ${lead.name}
Industry: ${lead.industry}
Contact: ${lead.contactFirstName || 'the owner'}
Package: ${lead.estimatedBudgetTier || 'professional'}
City: ${lead.city || 'US'}

Include:
1. Warm welcome and excitement to work together
2. Brief overview of what happens next
3. Request for brand assets (logo, colors, photos)
4. Expected timeline
5. How to reach us`;

        const result = await this.callClaude(CLIENT_SYSTEM_PROMPT, prompt);
        return {
            status: 'success',
            agentName: 'client_success',
            confidence: 0.9,
            data: {
                action: 'onboarding_sent',
                message: result.message || this._fallbackOnboarding(lead),
                channel: result.channel || 'email',
                sentAt: new Date().toISOString(),
                nextTouchpoint: result.nextScheduledTouchpoint || new Date(Date.now() + 3 * 86400000).toISOString(),
            },
            startedAt: new Date().toISOString(),
            finishedAt: new Date().toISOString(),
        };
    }

    /**
     * Send a build progress update
     */
    async sendProgressUpdate(client, project, progressDetails) {
        console.log(`[ClientSuccess] Sending progress update to ${client.businessId}`);

        const prompt = `Write a progress update for a website build:

Client: ${client.businessId}
Project Status: ${project.status}
Progress Details: ${progressDetails}
Package: ${project.scopeJson?.features?.join(', ') || 'standard'}

Make it friendly, specific, and reassuring. Include what was completed and what's coming next.`;

        const result = await this.callClaude(CLIENT_SYSTEM_PROMPT, prompt);
        return {
            message: result.message || `Update: Your website build is progressing well. ${progressDetails}`,
            channel: result.channel || 'email',
            sentAt: new Date().toISOString(),
        };
    }

    /**
     * Handle delivery — share final site
     */
    async deliver(lead) {
        console.log(`[ClientSuccess] Delivering final site to ${lead.name}`);

        const prompt = `Write a delivery/handoff message for a completed website:

Business: ${lead.name}
Industry: ${lead.industry}
Contact: ${lead.contactFirstName || 'the owner'}

Include:
1. Congratulations and excitement
2. Remind them of what was built
3. Quick guide on DNS/hosting next steps
4. Offer for a 15-min walkthrough call
5. Ask if they'd leave a Google review (gently)`;

        const result = await this.callClaude(CLIENT_SYSTEM_PROMPT, prompt);
        return {
            status: 'success',
            agentName: 'client_success',
            confidence: 0.9,
            data: {
                action: 'delivery_sent',
                message: result.message || this._fallbackDelivery(lead),
                channel: result.channel || 'email',
                sentAt: new Date().toISOString(),
            },
            startedAt: new Date().toISOString(),
            finishedAt: new Date().toISOString(),
        };
    }

    /**
     * Handle a client message (classify and respond)
     */
    async handleClientMessage(client, message, channel) {
        console.log(`[ClientSuccess] Handling ${channel} message from client`);

        const classifyPrompt = `Classify and respond to this client message:

Channel: ${channel}
Message: "${message}"

Classify as: question|revision_request|complaint|praise|general
Then draft an appropriate response.`;

        return this.callClaude(CLIENT_SYSTEM_PROMPT, classifyPrompt);
    }

    _fallbackOnboarding(lead) {
        return `Hi ${lead.contactFirstName || 'there'}!\n\nWelcome aboard! We're thrilled to start building your new website for ${lead.name}.\n\nHere's what happens next:\n1. We'll need your logo, brand colors, and any photos you'd like us to use\n2. Our team will have your first draft ready within 5-7 business days\n3. You'll get a staging link to review before anything goes live\n\nJust reply to this email with your brand assets, or let us know if you have any questions!\n\nExcited to get started,\nYour Web Agency Team`;
    }

    _fallbackDelivery(lead) {
        return `Hi ${lead.contactFirstName || 'there'}!\n\nGreat news — your new website for ${lead.name} is ready!\n\nWe'd love to walk you through it on a quick 15-minute call. Reply with a time that works for you.\n\nBest,\nYour Web Agency Team`;
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
                    max_tokens: 1000,
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

module.exports = { ClientSuccessAgent };
