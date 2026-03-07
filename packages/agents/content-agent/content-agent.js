/**
 * CONTENT AGENT
 * Generates website copy, SEO content, and marketing assets
 * Uses: Claude for content generation
 *
 * SETUP REQUIRED:
 *   ANTHROPIC_API_KEY
 */

const CONTENT_SYSTEM_PROMPT = `You are an expert SEO copywriter for local service businesses.
You write compelling, conversion-focused website copy and content assets.

Guidelines:
- Write at an 8th grade reading level
- Use the business's city/region name naturally for local SEO
- Include power words and urgency where appropriate
- Every page should have a clear CTA
- Use customer-centric language ("you/your" over "we/our")
- Include relevant keywords without stuffing
- Aim for 300-500 words per page section
- Write meta descriptions under 160 characters
- Include FAQ schema-ready Q&A pairs

Content types you can generate:
- SERVICE_PAGE: Detailed service description with benefits
- LOCAL_PAGE: Location-specific landing page
- BLOG_POST: Industry topic article (500-1000 words)
- FAQ: Question and answer pairs
- CTA_BLOCK: Call-to-action section
- META_DESCRIPTION: SEO meta description
- SOCIAL_POST: Social media captions`;

class ContentAgent {
    constructor(config = {}) {
        this.config = config;
        this.anthropicKey = config.anthropicApiKey || process.env.ANTHROPIC_API_KEY;
    }

    /**
     * Generate content for a specific asset type
     */
    async generateContent(brief, assetType) {
        console.log(`[Content] Generating ${assetType} for ${brief.businessName}`);

        const prompt = this._buildPrompt(brief, assetType);
        const result = await this.callClaude(CONTENT_SYSTEM_PROMPT, prompt);

        return {
            id: `content_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            assetType,
            title: result.title || `${assetType} for ${brief.businessName}`,
            body: result.body || result.content || '',
            metadataJson: {
                keywords: result.keywords || [],
                metaDescription: result.metaDescription || '',
                wordCount: (result.body || result.content || '').split(/\s+/).length,
            },
            createdAt: new Date().toISOString(),
        };
    }

    /**
     * Generate a full content checklist for a website build
     */
    async generateContentChecklist(brief) {
        console.log(`[Content] Generating content checklist for ${brief.businessName}`);

        const pages = [
            { type: 'SERVICE_PAGE', title: 'Homepage Hero & Services Overview' },
            { type: 'SERVICE_PAGE', title: 'Individual Service Pages' },
            { type: 'LOCAL_PAGE', title: `${brief.city} Landing Page` },
            { type: 'FAQ', title: 'FAQ Section' },
            { type: 'META_DESCRIPTION', title: 'All Page Meta Descriptions' },
        ];

        // Add service-specific pages
        for (const service of (brief.services || []).slice(0, 5)) {
            pages.push({ type: 'SERVICE_PAGE', title: `${service} Service Page` });
        }

        const results = [];
        for (const page of pages) {
            const content = await this.generateContent(brief, page.type);
            results.push({ ...content, pageTitle: page.title });
        }

        return {
            totalAssets: results.length,
            assets: results,
            generatedAt: new Date().toISOString(),
        };
    }

    /**
     * Generate a blog post for content marketing
     */
    async generateBlogPost(brief, topic) {
        console.log(`[Content] Generating blog post: ${topic}`);

        const prompt = `Write a blog post for a ${brief.industry} business in ${brief.city || 'the US'}:

Business: ${brief.businessName}
Topic: ${topic}

Requirements:
- 600-1000 words
- Include an engaging title
- Use H2 and H3 subheadings
- Include a meta description
- End with a CTA
- Include 3-5 target keywords
- Make it locally relevant

Return JSON:
{
  "title": "string",
  "body": "string — full article in markdown",
  "metaDescription": "string under 160 chars",
  "keywords": ["array of target keywords"]
}`;

        return this.callClaude(CONTENT_SYSTEM_PROMPT, prompt);
    }

    _buildPrompt(brief, assetType) {
        const base = `Generate ${assetType} content for:
Business: ${brief.businessName}
Industry: ${brief.industry}
City: ${brief.city || 'US'}
Services: ${(brief.services || []).join(', ')}
Google Rating: ${brief.googleRating || 'N/A'}/5 (${brief.googleReviews || 0} reviews)`;

        const typeInstructions = {
            SERVICE_PAGE: `${base}\n\nWrite a compelling service page section (300-500 words) that highlights benefits, includes a CTA, and uses local keywords. Return JSON: { "title": "string", "body": "string", "metaDescription": "string", "keywords": ["array"] }`,
            LOCAL_PAGE: `${base}\n\nWrite a location-specific landing page (400-600 words) targeting "${brief.city}" customers. Include local landmarks/references naturally. Return JSON: { "title": "string", "body": "string", "metaDescription": "string", "keywords": ["array"] }`,
            FAQ: `${base}\n\nGenerate 8-10 FAQ questions and answers for this ${brief.industry} business. Return JSON: { "title": "FAQs", "body": "string — Q&A formatted", "questions": [{"q": "string", "a": "string"}] }`,
            CTA_BLOCK: `${base}\n\nWrite 3 variations of a call-to-action block. Return JSON: { "title": "CTA Options", "body": "string", "variations": [{"headline": "string", "subtext": "string", "buttonText": "string"}] }`,
            META_DESCRIPTION: `${base}\n\nWrite meta descriptions for: homepage, services, about, contact. Return JSON: { "title": "Meta Descriptions", "body": "string", "descriptions": {"home": "string", "services": "string", "about": "string", "contact": "string"} }`,
            SOCIAL_POST: `${base}\n\nWrite 5 social media posts for different platforms. Return JSON: { "title": "Social Posts", "body": "string", "posts": [{"platform": "string", "caption": "string", "hashtags": ["array"]}] }`,
        };

        return typeInstructions[assetType] || `${base}\n\nGenerate appropriate content. Return JSON: { "title": "string", "body": "string" }`;
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
                    max_tokens: 2000,
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

module.exports = { ContentAgent };
