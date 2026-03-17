const { ScreenshotService } = require('../../services/screenshot-service');
const path = require('path');
const fs = require('fs/promises');

/**
 * PROFIT AUDIT AGENT
 * Creates financial recovery audits and fee-gap comparisons
 * Evaluates processing waste and hidden bank taxes
 *
 * SETUP REQUIRED:
 *   ANTHROPIC_API_KEY
 */

const AUDIT_SYSTEM_PROMPT = `You are a professional financial efficiency director for a merchant recovery agency.
Given a business's industry, revenue signals, and current payment friction, provide a financial recovery audit direction.

Return JSON:
{
  "estimatedAnnualWaste": "$range",
  "recoveryTier": "high|medium|low",
  "identifiedGap": "description of the hidden bank tax found",
  "reinvestmentStrategy": "how the reclaimed profit could be used (e.g. equipment, hiring, web upgrade)",
  "auditHeadline": "string",
  "auditSummary": "string",
  "ctaText": "string",
  "keyMetrics": ["3-5 financial leaks the audit should highlight"],
  "auditNotes": "string"
}`;

class ProfitAuditAgent {
    constructor(config = {}) {
        this.config = config;
        this.anthropicKey = config.anthropicApiKey || process.env.ANTHROPIC_API_KEY;
        this.screenshotService = new ScreenshotService();
    }

    /**
     * Generate all audit assets for a lead
     */
    async generate(lead) {
        console.log(`[ProfitAudit] Generating recovery audit for ${lead.name}`);

        const auditDirection = await this.getAuditDirection(lead);

        return {
            id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            leadId: lead.id,
            auditType: 'FINANCIAL_RECOVERY',
            annualWasteEstimate: auditDirection.estimatedAnnualWaste,
            recoveryTier: auditDirection.recoveryTier,
            generationStatus: 'COMPLETED',
            reviewStatus: 'PENDING',
            auditDetails: auditDirection,
            createdAt: new Date().toISOString(),
        };
    }

    async getAuditDirection(lead) {
        const prompt = `Create a profit recovery audit for this business:

Business: ${lead.name}
Industry: ${lead.industry}
Location: ${lead.city || 'US-based'}
Estimated Volume Signal: ${lead.estimatedMonthlyVolume || 'high-frequency'}
Processing Pain Points: ${(lead.processingPainPoints || []).join(', ')}

Identify the specific financial leaks and calculate potential recovery under the 'Zero-Fee Profit Shield'.`;

        return this.callClaude(AUDIT_SYSTEM_PROMPT, prompt);
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
                    model: 'claude-3-5-sonnet-20240620',
                    max_tokens: 1000,
                    system: systemPrompt,
                    messages: [{ role: 'user', content: userMessage }],
                }),
            });
            const data = await res.json();
            const text = data.content?.[0]?.text || '{}';
            return JSON.parse(text.replace(/```json|```/g, '').trim());
        } catch (error) {
            console.error('[ProfitAudit] Claude Error:', error.message);
            return {};
        }
    }
}

module.exports = { ProfitAuditAgent };
