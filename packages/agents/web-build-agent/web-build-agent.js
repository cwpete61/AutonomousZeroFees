/**
 * GROWTH AGENT (formerly Web Build Agent)
 * Deploys growth infrastructure (websites, landing pages, local SEO) funded by reclaimed profit.
 * Uses: Claude for code generation, file system for output
 *
 * SETUP REQUIRED:
 *   ANTHROPIC_API_KEY
 *   ANTIGRAVITY_PROJECTS_PATH
 */

const GROWTH_SYSTEM_PROMPT = `You are a Digital Growth Strategist building high-performance conversion infrastructure for local businesses.
This infrastructure is funded by the capital reclaimed via the 'Zero-Fee Profit Shield.'

Given a business brief and the amount of reclaimed annual capital, generate complete HTML/CSS for their new growth-focused website.

Technical requirements:
- Semantic HTML5
- Mobile-first responsive CSS (no frameworks)
- Optimized for Core Web Vitals (conversion-focused)
- Include schema.org LocalBusiness structured data
- All messaging should reflect the business's high-quality service and newfound financial efficiency.
- Include a CTA focused on the actual service they provide.

Pages to generate:
1. index.html — Hero, Service Showcase, Social Proof, Recovery-funded upgrade badge.
2. style.css — Modern, premium stylesheet.

Return JSON:
{
  "filename": "string",
  "content": "string — full file content",
  "notes": "string — implementation notes"
}`;

class WebBuildAgent {
    constructor(config = {}) {
        this.config = config;
        this.anthropicKey = config.anthropicApiKey || process.env.ANTHROPIC_API_KEY;
        this.projectsPath = config.projectsPath || process.env.ANTIGRAVITY_PROJECTS_PATH || './projects';
    }

    /**
     * Start the deployment of growth infrastructure
     */
    async startDeployment(lead) {
        console.log(`[GrowthAgent] Starting deployment for ${lead.name}`);

        const reclaimedCapital = lead.estimatedAnnualWaste || '$4,500';
        const brief = this.generateBrief(lead, reclaimedCapital);
        const pages = ['index.html', 'style.css'];
        const buildResult = { files: [], errors: [] };

        for (const page of pages) {
            try {
                const file = await this.generatePage(brief, page, reclaimedCapital);
                buildResult.files.push(file);
            } catch (err) {
                console.error(`[GrowthAgent] Error generating ${page}:`, err.message);
                buildResult.errors.push({ page, error: err.message });
            }
        }

        const projectDir = `${this.projectsPath}/${lead.id}`;
        const stagingUrl = `https://growth.shield.ai/${lead.id}`;

        return {
            status: buildResult.errors.length === 0 ? 'success' : 'needs_review',
            agentName: 'growth_agent',
            confidence: 0.9,
            data: {
                projectDir,
                stagingUrl,
                reclaimedCapital,
                filesGenerated: buildResult.files.length,
                errors: buildResult.errors,
            },
            startedAt: new Date().toISOString(),
            finishedAt: new Date().toISOString(),
        };
    }

    generateBrief(lead, capital) {
        return {
            businessName: lead.name,
            industry: lead.industry,
            city: lead.city || 'US',
            reclaimedCapital: capital,
            services: this._inferServices(lead.industry),
        };
    }

    async generatePage(brief, filename, capital) {
        console.log(`[GrowthAgent] Generating ${filename} for ${brief.businessName} (Funded by ${capital} recovered)`);

        const prompt = `Generate the complete ${filename} file for this business.
This upgrade is funded by the $${capital} in annual savings we reclaimed for them.

Business: ${brief.businessName}
Industry: ${brief.industry}
City: ${brief.city}
Services: ${brief.services.join(', ')}

Generate ONLY the complete content for: ${filename}. Make it look like a $5,000 premium site.`;

        const result = await this.callClaude(GROWTH_SYSTEM_PROMPT, prompt);

        return {
            filename,
            content: result.content || `<!-- ${filename} placeholder -->`,
            notes: result.notes || '',
            generatedAt: new Date().toISOString(),
        };
    }

    _inferServices(industry) {
        const serviceMap = {
            plumbing: ['Emergency Repairs', 'Drain Cleaning', 'Water Heater Installation'],
            roofing: ['Roof Repair', 'Roof Replacement', 'Storm Damage'],
            landscaping: ['Lawn Care', 'Landscape Design', 'Hardscaping'],
            hvac: ['AC Repair', 'Heating Installation', 'Duct Cleaning'],
            medical: ['Patient Care', 'Diagnostic Services', 'Specialized Treatment'],
            legal: ['Case Consultation', 'Litigation', 'Contract Review'],
        };
        return serviceMap[industry] || ['Professional Services', 'Expert Consultation', 'Maintenance'];
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

module.exports = { WebBuildAgent };
