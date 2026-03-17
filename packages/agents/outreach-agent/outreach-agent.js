/**
 * OUTREACH AGENT
 * Writes and sends cold outreach via email AND social media
 * Manages multi-channel follow-up scheduling and reply detection
 *
 * CHANNELS:
 *   Email    — Resend / SendGrid (primary)
 *   LinkedIn — InMail / connection requests (best B2B channel)
 *   Facebook — Page-to-Page messaging
 *   Instagram — Business DMs (visual industries)
 *
 * SETUP REQUIRED:
 *   ANTHROPIC_API_KEY
 *   RESEND_API_KEY or SENDGRID_API_KEY
 *   EMAIL_FROM (sender address)
 *   LINKEDIN_ACCESS_TOKEN (optional — for LinkedIn outreach)
 *   FB_PAGE_ACCESS_TOKEN (optional — for Facebook outreach)
 *   IG_ACCESS_TOKEN (optional — for Instagram outreach)
 */

const OUTREACH_SYSTEM_PROMPT = `You are a professional financial efficiency expert working for an agency that helps local businesses keep more of their profits.
Your core offer is the "Zero-Fee Profit Shield": You eliminate their credit card processing fees (which are usually 2.5% - 4% of their revenue) so they can keep more money for themselves and their business.

Your job is to write personalized, CAN-SPAM compliant cold emails that get replies.

Rules:
- Be professional, conversational, and respectful
- Focus EXCLUSIVELY on the hidden costs of credit card processing fees (the "Processing Leak")
- Use the business owner's first name if available
- Keep subject lines under 50 characters
- Keep emails under 120 words
- Include a clear but soft CTA (reply-based, e.g., "Is this something you'd want to stop?")
- Never use spam trigger words (free, guarantee, act now, limited time)
- Frame as "I noticed a potential for recovery" not "I'm selling a service"
- Reference their industry's typical margins to show you understand their business
- Each follow-up must provide a new insight into processing fee structures (Interchange, Markup, etc.) or how this reclaimed revenue can be used for the business.

Return JSON:
{
  "subjectLine": "string",
  "emailBody": "string (plain text, include line breaks)",
  "toneNotes": "string explaining the approach taken"
}`;

const FOLLOW_UP_SYSTEM_PROMPT = `You are writing a follow-up email for an agency that eliminates credit card processing fees.
The prospect did not reply to the previous email. Write a follow-up that:
- References the previous email naturally
- Adds NEW value (e.g., mention a specific fee like 'Interchange Plus' or 'Rate Markup')
- Is shorter than the original (under 100 words)
- Uses a different hook centered on ROI and profit retention
- Maintains a professional, non-pushy tone

Return JSON:
{
  "subjectLine": "string",
  "emailBody": "string",
  "followUpAngle": "string describing what new angle was used"
}`;

const EMAIL_SEQUENCES = {
    standard: {
        steps: 3,
        delays: [0, 3, 7], // days after qualification
        description: 'Standard 3-touch sequence over 10 days',
    },
    aggressive: {
        steps: 5,
        delays: [0, 2, 5, 8, 14],
        description: '5-touch sequence for high-value leads',
    },
    gentle: {
        steps: 2,
        delays: [0, 7],
        description: '2-touch sequence for warm/referral leads',
    },
};

// ─── Social Media Channel Configs ────────────────────────────────

const SOCIAL_CHANNELS = {
    linkedin: {
        name: 'LinkedIn',
        maxMessageLength: 300,
        dailyLimit: 25,       // connection requests per day
        weeklyLimit: 100,
        bestFor: ['professional services', 'B2B', 'consulting', 'legal', 'accounting'],
        complianceNotes: 'Use personalized connection requests. No automation bots. Follow LinkedIn ToS.',
    },
    facebook: {
        name: 'Facebook',
        maxMessageLength: 500,
        dailyLimit: 30,
        weeklyLimit: 150,
        bestFor: ['home services', 'restaurants', 'retail', 'beauty', 'fitness'],
        complianceNotes: 'Message as Business Page only. Engage with content first when possible.',
    },
    instagram: {
        name: 'Instagram',
        maxMessageLength: 500,
        dailyLimit: 20,
        weeklyLimit: 100,
        bestFor: ['beauty', 'fitness', 'restaurants', 'photography', 'landscaping', 'interior design'],
        complianceNotes: 'Use Business account. Engage with their posts before DMing. Keep volume low.',
    },
    sms: {
        name: 'SMS',
        maxMessageLength: 160,
        dailyLimit: 50,
        bestFor: ['home services', 'appointment based businesses'],
        complianceNotes: 'A2P 10DLC required. Must include opt-out text in first message.',
    },
    voice: {
        name: 'Voice',
        maxMessageLength: 1000,
        dailyLimit: 20,
        bestFor: ['high-intent leads', 'follow-ups'],
        complianceNotes: 'No robocalls. Must identify caller and purpose. SCRub against DNC list.',
    },
};

const SOCIAL_DM_SYSTEM_PROMPT = `You are writing a social media direct message for a merchant recovery agency.
This is a SHORT, conversational DM — not a formal email.

Rules:
- Keep it under 2-3 sentences max
- Sound like a real person, not a marketer
- Reference their business and the potential for fee reclamation
- Include a soft question to start a conversation (e.g., "Ever thought about the Zero-Fee model?")
- NO links in the first message
- Match the platform's tone
- Focus on "Keeping more of what you earn"

Return JSON:
{
  "message": "string — the DM text",
  "openingHook": "string — what specific thing you referenced",
  "toneNotes": "string"
}`;

const { InstantlyClient } = require('./instantly-client');

class OutreachAgent {
    constructor(config = {}) {
        this.config = config;
        this.anthropicKey = config.anthropicApiKey || process.env.ANTHROPIC_API_KEY;
        this.emailProvider = config.emailProvider || 'instantly'; // 'instantly' | 'resend' | 'sendgrid'
        this.resendKey = config.resendKey || process.env.RESEND_API_KEY;
        this.sendgridKey = config.sendgridKey || process.env.SENDGRID_API_KEY;
        this.fromEmail = config.fromEmail || process.env.EMAIL_FROM || 'agency@yourdomain.com';
        this.fromName = config.fromName || 'Web Agency';

        // Instantly client
        this.instantly = new InstantlyClient({
            apiKey: config.instantlyApiKey || process.env.INSTANTLY_API_KEY,
        });
    }

    /**
     * Generate a full outreach sequence for a lead
     */
    async generateSequence(lead, sequenceType = 'standard') {
        console.log(`[Outreach] Generating ${sequenceType} sequence for ${lead.name}`);
        const sequence = EMAIL_SEQUENCES[sequenceType] || EMAIL_SEQUENCES.standard;

        const firstEmail = await this.generateInitialEmail(lead);
        const followUps = [];

        for (let i = 1; i < sequence.steps; i++) {
            const previousEmails = [firstEmail, ...followUps];
            const followUp = await this.generateFollowUp(lead, previousEmails, i);
            followUps.push(followUp);
        }

        return {
            id: `seq_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            leadId: lead.id,
            status: 'draft',
            sequenceType,
            subjectLine: firstEmail.subjectLine,
            firstEmail: firstEmail.emailBody,
            followupOne: followUps[0]?.emailBody || null,
            followupTwo: followUps[1]?.emailBody || null,
            schedule: sequence.delays.map((delay, i) => ({
                step: i + 1,
                sendAfterDays: delay,
                scheduledAt: new Date(Date.now() + delay * 86400000).toISOString(),
            })),
            createdAt: new Date().toISOString(),
        };
    }

    /**
     * Generate the initial cold email
     */
    async generateInitialEmail(lead) {
        const prompt = `Write a cold email to this business owner:

Business: ${lead.name}
Industry: ${lead.industry}
Contact: ${lead.contactFirstName || 'the owner'}
City: ${lead.city || 'their city'}

Profit Shield Signal: ${lead.wasteSignal || 'Potential high-volume processing'}
Key Pitch Angle: ${lead.profitShieldPitch || 'Stop the processing leak and keep your profit'}
Tone: ${lead.contactApproach || 'friendly and professional'}`;

        try {
            const analysis = await this.callClaude(OUTREACH_SYSTEM_PROMPT, prompt);
            return {
                subjectLine: analysis.subjectLine || `Quick question about ${lead.website}`,
                emailBody: analysis.emailBody || this._fallbackEmail(lead),
                toneNotes: analysis.toneNotes || '',
            };
        } catch (error) {
            console.error('[Outreach] Error generating email via AI, using fallback:', error);
            return {
                subjectLine: `Quick question about ${lead.website}`,
                emailBody: this._fallbackEmail(lead),
                toneNotes: '',
            };
        }
    }

    /**
     * Generate a follow-up email
     */
    async generateFollowUp(lead, previousEmails, followUpNumber) {
        const prevContext = previousEmails.map((e, i) =>
            `Email ${i + 1}: "${e.subjectLine}" - ${e.emailBody?.slice(0, 100)}...`
        ).join('\n');

        const prompt = `Write follow-up #${followUpNumber} for this lead:

Business: ${lead.name}
Industry: ${lead.industry}
Contact: ${lead.contactFirstName || 'the owner'}

Previous emails sent (no reply):
${prevContext}

Financial Gap: ${lead.estimatedAnnualWaste || 'Estimated thousands in processing fees'}`;

        try {
            const analysis = await this.callClaude(FOLLOW_UP_SYSTEM_PROMPT, prompt);
            return {
                subjectLine: analysis.subjectLine || `Re: ${previousEmails[0]?.subjectLine}`,
                emailBody: analysis.emailBody || this._fallbackFollowUp(lead, followUpNumber),
                followUpAngle: analysis.followUpAngle || '',
            };
        } catch (error) {
            console.error('[Outreach] Error generating follow-up via AI, using fallback:', error);
            return {
                subjectLine: `Re: ${previousEmails[0]?.subjectLine || 'Quick question'}`,
                emailBody: this._fallbackFollowUp(lead, followUpNumber),
                followUpAngle: '',
            };
        }
    }

    /**
     * Send an email via configured provider
     */
    async sendEmail(to, subject, body, options = {}) {
        console.log(`[Outreach] Sending email to ${to} | Subject: ${subject}`);

        // CAN-SPAM Compliance Check
        const compliance = this.validateCompliance(body, options);
        if (!compliance.valid) {
            throw new Error(`CAN-SPAM Compliance Failure: ${compliance.reasons.join(', ')}`);
        }

        // Add CAN-SPAM footer if missing (redundant check but safe)
        const fullBody = `${body}\n\n---\nIf you'd prefer I not reach out, just reply "unsubscribe" and I'll remove you immediately.\n${this.fromName} • ${options.physicalAddress || '123 Agency St, Austin TX 78701'}`;

        if (this.emailProvider === 'instantly') {
            console.log('[Outreach] Note: For Instantly, use sendViaInstantly() for full sequences');
            return { messageId: `instantly_direct_${Date.now()}`, status: 'use_sendViaInstantly' };
        } else if (this.emailProvider === 'resend') {
            return this._sendViaResend(to, subject, fullBody);
        } else if (this.emailProvider === 'sendgrid') {
            return this._sendViaSendGrid(to, subject, fullBody);
        }

        // Stub fallback
        console.log(`[Outreach] STUB — Would send to ${to}:\nSubject: ${subject}\n${fullBody}`);
        return { messageId: `stub_${Date.now()}`, status: 'sent_stub' };
    }

    /**
     * Compose emails in-app → push entire sequence to Instantly
     * This is the primary send method when using Instantly
     *
     * @param {Object} lead - Lead data from Scout Agent
     * @param {string} sequenceType - 'standard' | 'aggressive' | 'gentle'
     * @param {Object} opts - { campaignId, campaignName, autoActivate, emailAccounts }
     */
    async sendViaInstantly(lead, sequenceType = 'standard', opts = {}) {
        console.log(`[Outreach] Composing & pushing to Instantly for ${lead.name}`);

        // Step 1: Generate the email sequence in-app using AI
        const sequence = await this.generateSequence(lead, sequenceType);

        // Step 2: Push composed emails to Instantly
        const result = await this.instantly.pushOutreachToInstantly({
            lead,
            emailSequence: sequence,
            campaignId: opts.campaignId || null,
            campaignName: opts.campaignName || null,
            autoActivate: opts.autoActivate || false,
            emailAccounts: opts.emailAccounts || [],
        });

        return {
            ...result,
            sequence, // return the composed emails for CRM logging
        };
    }

    /**
     * Send the initial email of a sequence
     */
    async sendInitialEmail(lead) {
        if (!lead.email) {
            console.warn(`[Outreach] No email for lead ${lead.id}, skipping`);
            return { status: 'skipped', reason: 'no_email' };
        }

        const sequence = await this.generateSequence(lead);
        const result = await this.sendEmail(lead.email, sequence.subjectLine, sequence.firstEmail);

        return {
            status: 'sent',
            sequenceId: sequence.id,
            messageId: result.messageId,
            subjectLine: sequence.subjectLine,
            sentAt: new Date().toISOString(),
            nextFollowUpAt: sequence.schedule[1]?.scheduledAt || null,
        };
    }

    /**
     * Classify an inbound reply
     */
    async classifyReply(replyContent, lead) {
        const prompt = `Classify this email reply from a prospect:

Original outreach was about the 'Zero-Fee Profit Shield' to eliminate their credit card processing fees.

Their reply:
"${replyContent}"

Return JSON:
{
  "sentiment": "positive|negative|neutral|unsubscribe",
  "intent": "interested|not_interested|question|objection|unsubscribe|spam",
  "suggestedNextAction": "send_audit|answer_question|handle_objection|remove_from_list|escalate_to_human",
  "confidence": 0.0-1.0,
  "summary": "one sentence summary"
}`;

        return this.callClaude('You classify sales email replies accurately.', prompt);
    }

    /**
     * Validate email content for CAN-SPAM compliance
     */
    validateCompliance(body, options = {}) {
        const reasons = [];
        const content = body.toLowerCase();

        // 1. Unsubscribe mechanism
        if (!content.includes('unsubscribe') && !content.includes('opt out') && !content.includes('remove me')) {
            reasons.push('Missing unsubscribe or opt-out mechanism');
        }

        // 2. Physical address
        if (!options.physicalAddress && !process.env.AGENCY_PHYSICAL_ADDRESS && !body.includes('St') && !body.includes('Ave')) {
            reasons.push('Missing physical postal address');
        }

        // 3. Deceptive subject lines (AI should handle this via prompt, but we can do basic checks)
        // [Add more heuristics as needed]

        return {
            valid: reasons.length === 0,
            reasons
        };
    }

    // ─── Email Providers ────────────────────────────────────────────

    async _sendViaResend(to, subject, body) {
        if (!this.resendKey) {
            console.warn('[Outreach] Resend API key missing — using mock data');
            return { messageId: `resend_stub_${Date.now()}`, status: 'sent_stub' };
        }

        try {
            const res = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.resendKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: `${this.fromName} <${this.fromEmail}>`,
                    to,
                    subject,
                    text: body
                }),
            });
            const data = await res.json();
            return data;
        } catch (error) {
            console.error('[Outreach] Resend error:', error.message);
            return { error: true, message: error.message };
        }
    }

    async _sendViaSendGrid(to, subject, body) {
        // PRODUCTION: Uncomment and use
        // const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        //     method: 'POST',
        //     headers: { 'Authorization': `Bearer ${this.sendgridKey}`, 'Content-Type': 'application/json' },
        //     body: JSON.stringify({
        //         personalizations: [{ to: [{ email: to }] }],
        //         from: { email: this.fromEmail, name: this.fromName },
        //         subject,
        //         content: [{ type: 'text/plain', value: body }],
        //     }),
        // });
        // return { messageId: res.headers.get('x-message-id'), status: 'sent' };

        return { messageId: `sg_stub_${Date.now()}`, status: 'sent_stub' };
    }

    // ─── Social Media Outreach ──────────────────────────────────────

    /**
     * Generate a social media DM for a specific platform
     */
    async generateSocialDM(lead, platform = 'linkedin') {
        const channel = SOCIAL_CHANNELS[platform];
        if (!channel) throw new Error(`Unknown social platform: ${platform}`);

        console.log(`[Outreach] Generating ${channel.name} DM for ${lead.name}`);

        const prompt = `Write a ${channel.name} DM to this business:

Business: ${lead.name}
Industry: ${lead.industry}
City: ${lead.city || 'US'}
Google Rating: ${lead.googleRating || 'N/A'}/5 (${lead.googleReviews || 0} reviews)
Platform: ${channel.name}
Max Length: ${channel.maxMessageLength} characters

Their industry likely carries high processing costs. Open a conversation about eliminating those fees.`;

        const result = await this.callClaude(SOCIAL_DM_SYSTEM_PROMPT, prompt);
        const message = result.message || this._fallbackSocialDM(lead, platform);

        return {
            platform,
            message: message.slice(0, channel.maxMessageLength),
            openingHook: result.openingHook || 'general',
            toneNotes: result.toneNotes || '',
            complianceNotes: channel.complianceNotes,
            createdAt: new Date().toISOString(),
        };
    }

    /**
     * Send a social DM via platform API (stubs for now)
     */
    async sendSocialDM(recipientId, message, platform) {
        console.log(`[Outreach] Sending ${platform} DM to ${recipientId}`);

        switch (platform) {
            case 'linkedin':
                return this._sendViaLinkedIn(recipientId, message);
            case 'facebook':
                return this._sendViaFacebook(recipientId, message);
            case 'instagram':
                return this._sendViaInstagram(recipientId, message);
            default:
                throw new Error(`Unsupported social platform: ${platform}`);
        }
    }

    /**
     * Determine best outreach channels for a lead
     */
    selectChannels(lead) {
        const channels = ['email']; // email is always included

        const industry = (lead.industry || '').toLowerCase();

        // LinkedIn — always good for B2B
        if (lead.linkedInUrl || SOCIAL_CHANNELS.linkedin.bestFor.some(i => industry.includes(i))) {
            channels.push('linkedin');
        }

        // Facebook — great for local/consumer services
        if (lead.facebookUrl || SOCIAL_CHANNELS.facebook.bestFor.some(i => industry.includes(i))) {
            channels.push('facebook');
        }

        // Instagram — visual industries
        if (lead.instagramUrl || SOCIAL_CHANNELS.instagram.bestFor.some(i => industry.includes(i))) {
            channels.push('instagram');
        }

        // SMS — if phone is present
        if (lead.phone) {
            channels.push('sms');
        }

        return channels;
    }

    /**
     * Generate a full multi-channel outreach plan
     */
    async generateMultiChannelPlan(lead, sequenceType = 'standard') {
        console.log(`[Outreach] Building multi-channel plan for ${lead.name}`);

        const channels = this.selectChannels(lead);
        const plan = { leadId: lead.id, channels: [], createdAt: new Date().toISOString() };

        // Always generate email sequence
        const emailSequence = await this.generateSequence(lead, sequenceType);
        plan.channels.push({ type: 'email', sequence: emailSequence });

        // Generate social DMs for selected platforms
        for (const ch of channels.filter(c => c !== 'email')) {
            const dm = await this.generateSocialDM(lead, ch);
            plan.channels.push({ type: ch, dm });
        }

        return plan;
    }

    async _sendViaLinkedIn(recipientId, message) {
        // PRODUCTION: Use LinkedIn API
        // POST https://api.linkedin.com/v2/messages
        // Requires LINKEDIN_ACCESS_TOKEN
        return { messageId: `li_stub_${Date.now()}`, platform: 'linkedin', status: 'sent_stub' };
    }

    async _sendViaFacebook(recipientId, message) {
        // PRODUCTION: Use Facebook Graph API
        // POST https://graph.facebook.com/v19.0/me/messages
        // Requires FB_PAGE_ACCESS_TOKEN
        return { messageId: `fb_stub_${Date.now()}`, platform: 'facebook', status: 'sent_stub' };
    }

    async _sendViaInstagram(recipientId, message) {
        // PRODUCTION: Use Instagram Graph API
        // POST https://graph.facebook.com/v19.0/{ig-user-id}/messages
        // Requires IG_ACCESS_TOKEN
        return { messageId: `ig_stub_${Date.now()}`, platform: 'instagram', status: 'sent_stub' };
    }

    // ─── Twilio SMS & Voice ─────────────────────────────────────────

    /**
     * Send an SMS via Twilio
     */
    async sendSMS(to, message) {
        console.log(`[Outreach] Sending SMS to ${to}: "${message}"`);
        // Add A2P compliance opt-out
        const fullMessage = `${message} Reply STOP to opt out.`;
        
        // PRODUCTION: Use Twilio API
        // const client = require('twilio')(this.config.twilioSid, this.config.twilioToken);
        // return client.messages.create({ body: fullMessage, from: this.config.twilioPhone, to });

        return { messageId: `sms_stub_${Date.now()}`, status: 'sent_stub', compliant: true };
    }

    /**
     * Trigger a voice call script (AI generated)
     */
    async makeCall(to, script) {
        console.log(`[Outreach] Triggering Voice Call to ${to} with script: "${script.slice(0, 50)}..."`);
        
        // PRODUCTION: Use Twilio API + TwiML
        // const client = require('twilio')(this.config.twilioSid, this.config.twilioToken);
        // return client.calls.create({ url: 'http://demo.twilio.com/docs/voice.xml', to, from: this.config.twilioPhone });

        return { callId: `call_stub_${Date.now()}`, status: 'queued_stub' };
    }

    _fallbackSocialDM(lead, platform) {
        const name = lead.contactFirstName || 'there';
        const biz = lead.name;
        switch (platform) {
            case 'linkedin':
                return `Hi ${name}, I came across ${biz} and noticed your scale in ${lead.industry}. Are you guys still on a standard percentage-based processing model? We've been helping businesses in ${lead.city} switch to a "Zero-Fee" structure to keep more of their revenue. Worth a chat?`;
            case 'facebook':
                return `Hey ${name}! Love what you're doing with ${biz}. Quick question — have you looked at your merchant statement lately? I help local businesses eliminate those fees entirely so they can keep more money for them and their business.`;
            case 'instagram':
                return `Hey! 👋 Love your page for ${biz}. Quick question: Are you guys still paying 3% or more on every transaction? We specialty in "Zero-Fee" processing for ${lead.industry} shops. Happy to share how it works!`;
            default:
                return `Hi ${name}, I noticed ${biz} and had some ideas about your profit retention. Mind if I share?`;
        }
    }

    // ─── Claude API ─────────────────────────────────────────────────

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
                    model: 'claude-3-5-sonnet-latest',
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

    // ─── Fallbacks ──────────────────────────────────────────────────

    _fallbackEmail(lead) {
        const name = lead.contactFirstName || 'there';
        return `Hi ${name},\n\nI came across ${lead.name} while looking at local ${lead.industry} businesses in ${lead.city || 'your area'}. Your ${lead.googleReviews} reviews show you're doing great work.\n\nI noticed a specific financial leak that's likely costing you thousands every month: your credit card processing fees. Most businesses in ${lead.industry} are overcharged by legacy banks who take 3% or more of every sale.\n\nWe specialize in the "Zero-Fee Profit Shield" which eliminates those processing costs entirely. This allows you to keep more money for you and your business. We even set up the modern infrastructure for you so you can focus on growth without the "bank tax."\n\nWould you be open to a quick 2-minute chat to see how much we can recover for you?\n\nBest,\n${this.fromName}`;
    }

    _fallbackFollowUp(lead, num) {
        const name = lead.contactFirstName || 'there';
        if (num === 1) {
            return `Hi ${name},\n\nJust following up on my note last week about ${lead.name}'s processing fees. I actually ran a quick audit on the typical waste for a business of your scale — would you like to see the recovery report?\n\nNo strings attached.\n\nBest,\n${this.fromName}`;
        }
        return `Hi ${name},\n\nLast message from me — I put together a side-by-side comparison of your current profit margin vs. what it looks like with the Profit Shield active. Happy to share it if you're curious.\n\nEither way, wishing you a great week.\n\n${this.fromName}`;
    }
}

module.exports = { OutreachAgent, EMAIL_SEQUENCES, SOCIAL_CHANNELS };
