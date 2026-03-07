/**
 * CODE AGENT
 * Generates production-ready code patches, bug fixes, and feature additions
 * Used by Web Build Agent for complex code generation tasks
 *
 * SETUP REQUIRED:
 *   ANTHROPIC_API_KEY
 */

const CODE_SYSTEM_PROMPT = `You are a senior full-stack developer generating production-ready code.
You write clean, semantic HTML5 and CSS3 for local service business websites.

Output requirements:
- Semantic HTML5 structure
- Mobile-first responsive CSS
- No CSS frameworks (vanilla CSS only)
- Google Fonts integration
- Accessible (WCAG 2.1 AA)
- Performance-optimized (minimal DOM, no render-blocking)
- Include structured data (JSON-LD LocalBusiness schema)
- Include Open Graph meta tags
- All interactive elements have ARIA labels

Return JSON:
{
  "filename": "string",
  "language": "html|css|js",
  "content": "string — complete file content",
  "dependencies": ["array of external resources like fonts"],
  "notes": "implementation notes"
}`;

class CodeAgent {
    constructor(config = {}) {
        this.config = config;
        this.anthropicKey = config.anthropicApiKey || process.env.ANTHROPIC_API_KEY;
    }

    /**
     * Generate a complete file
     */
    async generateFile(spec) {
        console.log(`[CodeAgent] Generating ${spec.filename} (${spec.language || 'html'})`);

        const prompt = `Generate the complete ${spec.filename} file:

Type: ${spec.language || 'html'}
Purpose: ${spec.purpose}
Business: ${spec.businessName || 'Local Service Business'}
Industry: ${spec.industry || 'general'}

Requirements:
${(spec.requirements || []).map(r => `- ${r}`).join('\n')}

${spec.additionalContext || ''}

Generate the COMPLETE file content, production-ready.`;

        const result = await this.callClaude(CODE_SYSTEM_PROMPT, prompt);
        return {
            filename: spec.filename,
            language: spec.language || 'html',
            content: result.content || `<!-- ${spec.filename} placeholder -->`,
            dependencies: result.dependencies || [],
            notes: result.notes || '',
            generatedAt: new Date().toISOString(),
        };
    }

    /**
     * Generate a code patch/fix
     */
    async generatePatch(existingCode, issueDescription, filename) {
        console.log(`[CodeAgent] Generating patch for ${filename}`);

        const prompt = `Fix this code issue:

File: ${filename}
Issue: ${issueDescription}

Current code:
\`\`\`
${existingCode.slice(0, 3000)}
\`\`\`

Return JSON:
{
  "filename": "${filename}",
  "content": "string — the COMPLETE fixed file",
  "changesDescription": "what was changed and why",
  "linesChanged": number
}`;

        return this.callClaude(CODE_SYSTEM_PROMPT, prompt);
    }

    /**
     * Generate structured data (JSON-LD) for a business
     */
    async generateStructuredData(business) {
        const schema = {
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: business.name,
            '@id': `https://${business.website || 'example.com'}`,
            url: `https://${business.website || 'example.com'}`,
            telephone: business.phone || '',
            address: {
                '@type': 'PostalAddress',
                streetAddress: business.address || '',
                addressLocality: business.city || '',
                addressRegion: business.state || '',
                addressCountry: 'US',
            },
            aggregateRating: business.googleRating ? {
                '@type': 'AggregateRating',
                ratingValue: business.googleRating,
                reviewCount: business.googleReviews || 0,
            } : undefined,
        };

        return {
            filename: 'structured-data.json',
            language: 'json',
            content: JSON.stringify(schema, null, 2),
            notes: 'JSON-LD LocalBusiness structured data',
            generatedAt: new Date().toISOString(),
        };
    }

    /**
     * Generate a responsive CSS stylesheet
     */
    async generateStylesheet(designDirection, businessName) {
        console.log(`[CodeAgent] Generating stylesheet for ${businessName}`);

        const prompt = `Generate a complete responsive CSS stylesheet for a ${businessName} website.

Design Direction:
- Colors: primary ${designDirection.colorScheme?.primary || '#2563eb'}, secondary ${designDirection.colorScheme?.secondary || '#1e40af'}
- Typography: ${designDirection.typography || 'modern-sans'}
- Layout: ${designDirection.layoutStyle || 'hero-focused'}

Requirements:
- Mobile-first responsive (320px → 1440px)
- CSS custom properties for all colors
- Smooth transitions on interactive elements
- Utility classes for spacing and typography
- Dark mode support via prefers-color-scheme
- Print styles

Generate the COMPLETE style.css file.`;

        return this.callClaude(CODE_SYSTEM_PROMPT, prompt);
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
                    max_tokens: 4000,
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

module.exports = { CodeAgent };
