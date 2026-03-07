/**
 * WEB BUILD AGENT
 * Generates production-ready website files in Antigravity IDE
 * Uses: Claude for code generation, file system for output
 *
 * SETUP REQUIRED:
 *   ANTHROPIC_API_KEY
 *   ANTIGRAVITY_PROJECTS_PATH
 */

const BUILD_SYSTEM_PROMPT = `You are a senior front-end developer building production websites for local service businesses.
Given a business brief and design direction, generate complete HTML/CSS for each page.

Technical requirements:
- Semantic HTML5
- Mobile-first responsive CSS (no frameworks)
- Google Fonts (Inter or similar)
- Optimized for Core Web Vitals
- Include schema.org LocalBusiness structured data
- Include Open Graph meta tags
- All images use placeholder URLs (to be replaced)
- Phone numbers wrapped in tel: links
- Include a sticky header with mobile hamburger menu

Pages to generate for each site:
1. index.html — Hero, services overview, reviews, CTA
2. services.html — Detailed service descriptions
3. about.html — Company story, team, certifications
4. contact.html — Contact form, map embed placeholder, hours
5. style.css — Complete responsive stylesheet

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
     * Start a full website build for a paid lead
     */
    async startBuild(lead) {
        console.log(`[WebBuild] Starting build for ${lead.name}`);

        const brief = this.generateBrief(lead);
        const pages = ['index.html', 'services.html', 'about.html', 'contact.html', 'style.css'];
        const buildResult = { files: [], errors: [] };

        for (const page of pages) {
            try {
                const file = await this.generatePage(brief, page);
                buildResult.files.push(file);
            } catch (err) {
                console.error(`[WebBuild] Error generating ${page}:`, err.message);
                buildResult.errors.push({ page, error: err.message });
            }
        }

        const projectDir = `${this.projectsPath}/${lead.id}`;
        const stagingUrl = `https://staging.agency/${lead.id}`;

        return {
            status: buildResult.errors.length === 0 ? 'success' : 'needs_review',
            agentName: 'web_build',
            confidence: buildResult.errors.length === 0 ? 0.9 : 0.5,
            data: {
                projectDir,
                stagingUrl,
                filesGenerated: buildResult.files.length,
                totalPages: pages.length,
                errors: buildResult.errors,
            },
            startedAt: new Date().toISOString(),
            finishedAt: new Date().toISOString(),
        };
    }

    generateBrief(lead) {
        return {
            businessName: lead.name,
            industry: lead.industry,
            city: lead.city || 'US',
            phone: lead.phone || '555-000-0000',
            email: lead.email || `info@${lead.website?.replace(/https?:\/\/(www\.)?/, '').split('/')[0]}`,
            googleRating: lead.googleRating,
            googleReviews: lead.googleReviews,
            services: this._inferServices(lead.industry),
            currentIssues: lead.issues || [],
            packageTier: lead.estimatedBudgetTier || 'professional',
        };
    }

    async generatePage(brief, filename) {
        console.log(`[WebBuild] Generating ${filename} for ${brief.businessName}`);

        const prompt = `Generate the complete ${filename} file for this business website:

Business: ${brief.businessName}
Industry: ${brief.industry}
City: ${brief.city}
Phone: ${brief.phone}
Email: ${brief.email}
Google Rating: ${brief.googleRating}/5 (${brief.googleReviews} reviews)
Services: ${brief.services.join(', ')}

Generate ONLY the complete content for: ${filename}
Make it production-ready, modern, and optimized for conversions.`;

        const result = await this.callClaude(BUILD_SYSTEM_PROMPT, prompt);

        return {
            filename,
            content: result.content || `<!-- ${filename} placeholder -->`,
            notes: result.notes || '',
            generatedAt: new Date().toISOString(),
        };
    }

    /**
     * Write generated files to the project directory
     */
    async writeFiles(projectDir, files) {
        // PRODUCTION: Use fs.writeFile
        // const fs = require('fs/promises');
        // await fs.mkdir(projectDir, { recursive: true });
        // for (const file of files) {
        //     await fs.writeFile(`${projectDir}/${file.filename}`, file.content);
        // }

        console.log(`[WebBuild] STUB — Would write ${files.length} files to ${projectDir}`);
        return { written: files.length, projectDir };
    }

    _inferServices(industry) {
        const serviceMap = {
            plumbing: ['Emergency Repairs', 'Drain Cleaning', 'Water Heater Installation', 'Pipe Repair', 'Bathroom Remodeling'],
            roofing: ['Roof Repair', 'Roof Replacement', 'Storm Damage', 'Inspections', 'Gutter Installation'],
            landscaping: ['Lawn Care', 'Landscape Design', 'Tree Trimming', 'Irrigation', 'Hardscaping'],
            hvac: ['AC Repair', 'Heating Installation', 'Duct Cleaning', 'Maintenance Plans', 'Emergency Service'],
            cleaning: ['Residential Cleaning', 'Commercial Cleaning', 'Deep Cleaning', 'Move-In/Out', 'Window Cleaning'],
            electrical: ['Wiring Repair', 'Panel Upgrades', 'Lighting Installation', 'Generator Install', 'Safety Inspections'],
            painting: ['Interior Painting', 'Exterior Painting', 'Cabinet Refinishing', 'Drywall Repair', 'Color Consultation'],
        };
        return serviceMap[industry] || ['General Services', 'Consultations', 'Emergency Service', 'Maintenance'];
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

module.exports = { WebBuildAgent };
