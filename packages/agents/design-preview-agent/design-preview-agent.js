/**
 * DESIGN PREVIEW AGENT
 * Creates blurred redesign previews and before/after comparisons
 * Uses: Screenshots, Sharp (image processing), Claude for design direction
 *
 * SETUP REQUIRED:
 *   ANTHROPIC_API_KEY
 *   SCREENSHOTONE_API_KEY (or Playwright for self-hosted)
 *   S3 credentials for asset storage
 */

const DESIGN_SYSTEM_PROMPT = `You are a web design director for a modern agency.
Given a business's industry, brand info, and current website problems, provide design direction for a redesign mockup.

Return JSON:
{
  "colorScheme": { "primary": "#hex", "secondary": "#hex", "accent": "#hex", "background": "#hex" },
  "layoutStyle": "hero-focused|card-grid|split-panel|full-width-sections",
  "typography": "modern-sans|friendly-rounded|professional-serif|bold-geometric",
  "heroHeadline": "string",
  "heroSubheadline": "string",
  "ctaText": "string",
  "keyFeatures": ["3-5 sections the redesign should highlight"],
  "designNotes": "string"
}`;

class DesignPreviewAgent {
    constructor(config = {}) {
        this.config = config;
        this.anthropicKey = config.anthropicApiKey || process.env.ANTHROPIC_API_KEY;
        this.screenshotKey = config.screenshotKey || process.env.SCREENSHOTONE_API_KEY;
        this.storageConfig = config.storage || {};
    }

    /**
     * Generate all preview assets for a lead
     */
    async generate(lead) {
        console.log(`[DesignPreview] Generating previews for ${lead.name}`);

        const [screenshot, designDirection] = await Promise.allSettled([
            this.captureScreenshot(lead.website),
            this.getDesignDirection(lead),
        ]);

        const screenshotUrl = screenshot.status === 'fulfilled' ? screenshot.value : null;
        const direction = designDirection.status === 'fulfilled' ? designDirection.value : {};

        const blurredPreview = await this.generateBlurredPreview(screenshotUrl, direction);
        const fullPreview = await this.generateFullPreview(screenshotUrl, direction, lead);
        const beforeAfter = await this.generateBeforeAfter(screenshotUrl, fullPreview);

        return {
            id: `demo_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            leadId: lead.id,
            blurredPreviewUrl: blurredPreview.url,
            fullPreviewUrl: fullPreview.url,
            beforeAfterUrl: beforeAfter.url,
            hostedDemoUrl: null,
            generationStatus: 'COMPLETED',
            reviewStatus: 'PENDING',
            designDirection: direction,
            createdAt: new Date().toISOString(),
        };
    }

    async captureScreenshot(url) {
        if (!url) return null;
        console.log(`[DesignPreview] Capturing screenshot of ${url}`);
        // PRODUCTION: ScreenshotOne API or Playwright
        return `https://placeholder.agency/screenshots/${url.replace(/https?:\/\//, '').replace(/\//g, '_')}.png`;
    }

    async getDesignDirection(lead) {
        const prompt = `Create design direction for redesigning this business website:

Business: ${lead.name}
Industry: ${lead.industry}
City: ${lead.city || 'US-based'}
Google Rating: ${lead.googleRating}/5 (${lead.googleReviews} reviews)
Current Website Problems: ${(lead.issues || []).join(', ')}
Budget Tier: ${lead.estimatedBudgetTier || 'professional'}

Design a modern, conversion-focused website for this ${lead.industry} business.`;

        return this.callClaude(DESIGN_SYSTEM_PROMPT, prompt);
    }

    async generateBlurredPreview(screenshotUrl, direction) {
        console.log('[DesignPreview] Generating blurred preview...');
        // PRODUCTION: Use Sharp to apply gaussian blur
        return {
            url: `https://placeholder.agency/previews/blurred_${Date.now()}.png`,
            blurLevel: 25,
            designNotes: direction.designNotes || 'Modern redesign concept',
        };
    }

    async generateFullPreview(screenshotUrl, direction, lead) {
        console.log('[DesignPreview] Generating full preview...');
        return {
            url: `https://placeholder.agency/previews/full_${Date.now()}.png`,
            designDirection: direction,
            sections: direction.keyFeatures || ['Hero', 'Services', 'Reviews', 'Contact'],
        };
    }

    async generateBeforeAfter(beforeUrl, afterPreview) {
        console.log('[DesignPreview] Generating before/after comparison...');
        return {
            url: `https://placeholder.agency/previews/beforeafter_${Date.now()}.png`,
            beforeUrl,
            afterUrl: afterPreview.url,
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

module.exports = { DesignPreviewAgent };
