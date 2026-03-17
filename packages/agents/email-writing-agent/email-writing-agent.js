/**
 * EMAIL WRITING AGENT
 * Specialized agent for crafting high-converting emails across lifecycle stages
 * Centralizes copy logic to ensure consistent brand voice and conversion focus
 * 
 * SETUP REQUIRED:
 *   ANTHROPIC_API_KEY
 */

const CORE_BRAND_VOICE = `Helpful, professional, non-pushy, local-first, value-driven. 
Always aim for the "I noticed" angle. Our unique value proposition is the "Zero-Fee Profit Shield" — we eliminate their credit card processing fees so they can keep more money for themselves and their business.`;

const EMAIL_TYPES = {
  COLD_OUTREACH: {
    system: `You are an expert cold email copywriter for a financial recovery agency. Write a personalized first-touch email to a local business owner.
Lead with a specific observation about their likely overpayment in credit card fees (the "Processing Leak").
Your core pitch: "The 'Zero-Fee Profit Shield' eliminates your merchant processing fees so you can keep 100% of your card revenue. We identify the hidden junk fees (markup, interchange padding, etc.) and wipe them out, so you keep more money for you and your business."
Ensure you sound like a professional partner, not a generic service.
Keep it under 120 words. Soft CTA (reply-based) only.`,
    schema: { subjectLine: "string", body: "string", strategy: "string" }
  },
  FOLLOW_UP: {
    system: `Write a follow-up email. Do not just "check in". Add new value or a new insight.
Maintain the same helpful tone. Keep it even shorter than the first email (<100 words).`,
    schema: { subjectLine: "string", body: "string", angle: "string" }
  },
  CLIENT_UPDATE: {
    system: `Write a status update for an existing client regarding their Profit Shield implementation. 
Highlight progress, mention a "win" (e.g. "We've successfully audited your last 3 monthly statements and identified $840 in redundant fees"), and outline next steps for activation.
Build confidence and maintain momentum.`,
    schema: { subjectLine: "string", body: "string", milestone: "string" }
  },
  NEWSLETTER_SNIPPET: {
    system: `Write a short, value-driven "Profit Insight" snippet.
Explain a merchant processing concept (e.g., Interchange-Plus, PCI Compliance, or Fee Padding) in simple terms and how it impacts their industry's bottom line.`,
    schema: { title: "string", content: "string", industryRelevance: "string" }
  }
};

class EmailWritingAgent {
    constructor(config = {}) {
        this.config = config;
        this.anthropicKey = config.anthropicApiKey || process.env.ANTHROPIC_API_KEY;
    }

    /**
     * Generate an email based on type and context
     */
    async writeEmail(context, type = 'COLD_OUTREACH') {
        const config = EMAIL_TYPES[type] || EMAIL_TYPES.COLD_OUTREACH;
        console.log(`[EmailAgent] Writing ${type} for ${context.businessName}`);

        const prompt = this._buildPrompt(context, type);
        const systemPrompt = `${config.system}\n\nBrand Voice: ${CORE_BRAND_VOICE}\n\nReturn JSON conforming to: ${JSON.stringify(config.schema)}`;

        return this.callClaude(systemPrompt, prompt);
    }

    _buildPrompt(context, type) {
        return `Context:
Business Name: ${context.businessName}
Industry: ${context.industry}
Location: ${context.city}, ${context.state}
Target Problem: ${context.identifiedProblem || 'General web presence'}
Specific Goal: ${context.goal || 'Book a discovery call'}
Additional Info: ${JSON.stringify(context.metadata || {})}`;
    }

    async callClaude(systemPrompt, userMessage) {
        if (!this.anthropicKey) {
            console.warn("[EmailAgent] No API key found, returning mock response");
            return this._getMockResponse(systemPrompt);
        }

        try {
            const res = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.anthropicKey,
                    'anthropic-version': '2023-06-01',
                },
                body: JSON.stringify({
                    model: 'claude-3-sonnet-20240229',
                    max_tokens: 2000,
                    system: systemPrompt,
                    messages: [{ role: 'user', content: userMessage }],
                }),
            });
            const data = await res.json();
            const text = data.content?.[0]?.text || '{}';
            return JSON.parse(text.replace(/```json|```/g, '').trim());
        } catch (err) {
            console.error("[EmailAgent] Error calling Claude:", err);
            return this._getMockResponse(systemPrompt);
        }
    }

    _getMockResponse(system) {
        // Fallback for demo purposes if no key
        if (system.includes("COLD_OUTREACH")) {
            return {
                subjectLine: "Quick observation about your website",
                body: "Hi [Name],\n\nI was looking at your site and noticed it's not quite optimized for mobile users in [City]. \n\nI built a quick preview of how it could look. Would you be open to seeing it?\n\nBest,\nTeam",
                strategy: "Mobile-first local gap"
            };
        }
        return { subjectLine: "Follow-up", body: "Just checking in.", strategy: "Basic" };
    }
}

module.exports = { EmailWritingAgent };
