/**
 * SCOUT AGENT
 * Finds service businesses in the US with low-quality websites
 * Uses: Google Places API, PageSpeed Insights API, heuristic scoring
 * 
 * SETUP REQUIRED:
 *   GOOGLE_PLACES_API_KEY
 *   GOOGLE_PAGESPEED_API_KEY
 *   HUNTER_API_KEY (email finder)
 */

const SCOUT_SYSTEM_PROMPT = `You are a lead research agent for a web design agency.
Your job is to evaluate whether a local service business has a poor website that would benefit from a redesign.

  "contactApproach": "recommended tone for outreach",
  "categories": ["list of business categories"],
  "services": ["list of specific services offered"],
  "gbpLink": "URL to Google Business Profile (if found)"
}

Score factors (each 0-20 points, LOWER total = better lead):
- Mobile responsiveness (0=not responsive, 20=fully responsive)  
- Page load speed (0=very slow, 20=fast)
- Visual design quality (0=very outdated, 20=modern)
- Content clarity (0=confusing, 20=clear)
- Trust signals: reviews, SSL, contact info (0=none, 20=all present)`;

const WEBSITE_QUALITY_HEURISTICS = {
    // Red flags that indicate a bad website (each adds to "bad score")
    badSignals: [
        { check: 'built_before_2018', points: 25, description: 'Site appears over 6 years old' },
        { check: 'no_ssl', points: 20, description: 'No HTTPS/SSL certificate' },
        { check: 'not_mobile_responsive', points: 25, description: 'Not mobile friendly' },
        { check: 'pagespeed_below_50', points: 20, description: 'PageSpeed score below 50' },
        { check: 'flash_or_tables', points: 30, description: 'Uses Flash or table-based layout' },
        { check: 'no_google_analytics', points: 10, description: 'No tracking set up' },
        { check: 'broken_images', points: 15, description: 'Has broken images or links' },
        { check: 'no_cta', points: 15, description: 'No clear call to action' },
        { check: 'stock_template_obvious', points: 10, description: 'Obvious free template, unbranded' },
    ],
};

class ScoutAgent {
    constructor(config = {}) {
        this.config = config;
        this.anthropicKey = config.anthropicApiKey || process.env.ANTHROPIC_API_KEY;
        this.placesKey = config.googlePlacesKey || process.env.GOOGLE_PLACES_API_KEY;
        this.pagespeedKey = config.googlePagespeedKey || process.env.GOOGLE_PAGESPEED_API_KEY;
        this.hunterKey = config.hunterKey || process.env.HUNTER_API_KEY;
        this.gtmetrixKey = config.gtmetrixApiKey || process.env.GTMETRIX_API_KEY;
        this.pingdomKey = config.pingdomApiKey || process.env.PINGDOM_API_KEY;
    }

    /**
     * Main entry: find leads in target industries + locations
     */
    async findLeads({ industries, location, minLeads = 20 }) {
        console.log(`[Scout] Searching for leads | Industries: ${industries.join(', ')} | Location: ${location}`);
        const allLeads = [];

        for (const industry of industries) {
            const businesses = await this.searchBusinesses(industry, location);
            for (const biz of businesses) {
                if (biz.website) {
                    const lead = await this.evaluateBusiness(biz);
                    if (lead.qualityScore < 65) { // Only pursue genuinely bad websites
                        allLeads.push(lead);
                    }
                }
                if (allLeads.length >= minLeads) break;
            }
            if (allLeads.length >= minLeads) break;
        }

        console.log(`[Scout] Found ${allLeads.length} qualified leads`);
        return allLeads;
    }

    /**
     * Google Places API search
     * Swap this for Apollo.io / Outscraper / Google Maps scraping in prod
     */
    /**
     * Google Places API search
     */
    async searchBusinesses(industry, location) {
        if (!this.placesKey) {
            console.warn('[Scout] Google Places API key missing — using mock data');
            return this._mockBusinessSearch(industry, location);
        }

        try {
            const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(industry + ' in ' + location)}&key=${this.placesKey}`;
            const res = await fetch(url);
            const data = await res.json();
            
            if (data.status !== 'OK') {
                console.error('[Scout] Google Places error:', data.status, data.error_message);
                return this._mockBusinessSearch(industry, location);
            }

            return data.results.map(place => ({
                name: place.name,
                industry,
                address: place.formatted_address,
                phone: null, // textsearch doesn't return phone, requires place details API
                rating: place.rating,
                reviewCount: place.user_ratings_total,
                website: null, // Requires place details API or separate lookup
                placeId: place.place_id
            }));
        } catch (error) {
            console.error('[Scout] Google Places fetch error:', error.message);
            return this._mockBusinessSearch(industry, location);
        }
    }

    async evaluateBusiness(business) {
        // 1. Fetch technical metrics and emails in parallel
        const [pageSpeedData, gtMetrixData, pingdomData, emailData] = await Promise.allSettled([
            this.checkPageSpeed(business.website),
            this.checkGTMetrix(business.website),
            this.checkPingdom(business.website),
            this.findEmail(business),
        ]);

        const pagespeed = pageSpeedData.status === 'fulfilled' ? pageSpeedData.value : null;
        const gtmetrix = gtMetrixData.status === 'fulfilled' ? gtMetrixData.value : null;
        const pingdom = pingdomData.status === 'fulfilled' ? pingdomData.value : null;
        const email = emailData.status === 'fulfilled' ? emailData.value : null;

        // 2. Enrich business object with technical data for Claude's analysis
        const businessWithMetrics = {
            ...business,
            pagespeedScore: pagespeed?.score,
            gtmetrixScore: gtmetrix?.score,
            pingdomScore: pingdom?.score,
        };

        // 3. Run Claude analysis informed by real metrics
        const claudeAnalysis = await this.analyzeWithClaude(businessWithMetrics);
        const analysis = claudeAnalysis || {};

        const qualityScore = this.computeQualityScore(business, pagespeed, analysis, gtmetrix, pingdom);

        return {
            id: `lead_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            stage: 'discovered',
            discoveredAt: new Date().toISOString(),

            // Business info
            name: business.name,
            industry: business.industry,
            website: business.website,
            address: business.address,
            phone: business.phone,
            googleRating: business.rating,
            googleReviews: business.reviewCount,

            // Contact
            email: email?.email || null,
            emailConfidence: email?.confidence || 0,

            // Assessment
            qualityScore,
            issues: analysis.issues || [],
            redesignPitch: analysis.redesignOpportunity || '',
            estimatedBudgetTier: analysis.estimatedBudgetTier || 'professional',
            contactApproach: analysis.contactApproach || 'friendly',

            // New fields
            categories: analysis.categories || [business.industry],
            services: analysis.services || [],
            gbpLink: business.gbpLink || analysis.gbpLink || null,

            // Raw data
            pagespeedScore: pagespeed?.score || null,
            pagespeedMetrics: pagespeed?.metrics || null,
            gtmetrixScore: gtmetrix?.score || null,
            pingdomScore: pingdom?.score || null,
        };
    }

    async checkPageSpeed(url) {
        if (!url) return null;
        if (!this.pagespeedKey) {
            console.warn('[Scout] Google PageSpeed API key missing — using mock data');
            return {
                score: Math.floor(Math.random() * 60) + 10,
                metrics: { fcp: '4.2s', lcp: '7.8s', cls: 0.34, tti: '9.1s' },
            };
        }

        try {
            const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&key=${this.pagespeedKey}`;
            const res = await fetch(apiUrl);
            const data = await res.json();

            const score = data.lighthouseResult?.categories?.performance?.score * 100;
            const audits = data.lighthouseResult?.audits || {};

            return {
                score: Math.round(score || 50),
                metrics: {
                    fcp: audits['first-contentful-paint']?.displayValue || 'N/A',
                    lcp: audits['largest-contentful-paint']?.displayValue || 'N/A',
                    cls: audits['cumulative-layout-shift']?.numericValue || 0,
                    tti: audits['interactive']?.displayValue || 'N/A',
                },
            };
        } catch (error) {
            console.error('[Scout] PageSpeed error:', error.message);
            return null;
        }
    }

    async checkGTMetrix(url) {
        if (!url) return null;
        if (!this.gtmetrixKey) {
            console.warn('[Scout] GTMetrix API key missing — using mock data');
            return { score: Math.floor(Math.random() * 40) + 30 };
        }
        try {
            // Placeholder for GTMetrix v2 API integration
            return { score: 65 }; 
        } catch (error) {
            console.error('[Scout] GTMetrix error:', error.message);
            return null;
        }
    }

    async checkPingdom(url) {
        if (!url) return null;
        if (!this.pingdomKey) {
            console.warn('[Scout] Pingdom API key missing — using mock data');
            return { score: Math.floor(Math.random() * 50) + 40 };
        }
        try {
            // Placeholder for Pingdom API integration
            return { score: 75 };
        } catch (error) {
            console.error('[Scout] Pingdom error:', error.message);
            return null;
        }
    }

    async findEmail(business) {
        if (!business.website) return null;
        if (!this.hunterKey) {
            console.warn('[Scout] Hunter.io API key missing — using mock data');
            const domain = business.website?.replace(/https?:\/\/(www\.)?/, '').split('/')[0];
            return { email: `info@${domain}`, confidence: 72, firstName: null };
        }

        try {
            const domain = new URL(business.website).hostname;
            const url = `https://api.hunter.io/v2/domain-search?domain=${domain}&api_key=${this.hunterKey}`;
            const res = await fetch(url);
            const data = await res.json();

            const primaryEmail = data.data?.emails?.[0];
            return {
                email: primaryEmail?.value || null,
                confidence: primaryEmail?.confidence || 0,
                firstName: primaryEmail?.first_name || null,
            };
        } catch (error) {
            console.error('[Scout] Hunter error:', error.message);
            return null;
        }
    }

    async analyzeWithClaude(business) {
        const prompt = `Analyze this local service business and their website:

Business: ${business.name}
Industry: ${business.industry}  
Website: ${business.website}
Google Rating: ${business.rating}/5 (${business.reviewCount} reviews)
Location: ${business.address}

Technical Metrics:
- PageSpeed Score: ${business.pagespeedScore || 'N/A'}/100
- GTMetrix Score: ${business.gtmetrixScore || 'N/A'}/100
- Pingdom Score: ${business.pingdomScore || 'N/A'}/100

Based on these technical metrics and typical patterns for this type of ${business.industry} business, assess their website quality and provide a compelling redesign pitch.
LOWER qualityScore (0-60) means the site is a GOOD lead for us (bad website).
HIGHER qualityScore (70-100) means the site is ALREADY GOOD (bad lead for us).
Return a JSON object with: qualityScore, issues (array), redesignOpportunity (string), and contactApproach.
`;

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
                system: SCOUT_SYSTEM_PROMPT,
                messages: [{ role: 'user', content: prompt }],
            }),
        });

        const data = await res.json();
        const text = data.content?.[0]?.text || '{}';
        try {
            return JSON.parse(text.replace(/```json|```/g, '').trim());
        } catch {
            return {};
        }
    }

    computeQualityScore(business, pagespeed, analysis, gtmetrix, pingdom) {
        let score = analysis.qualityScore || 50;
        let technicalScores = [];
        
        if (pagespeed?.score) technicalScores.push(100 - pagespeed.score);
        if (gtmetrix?.score) technicalScores.push(100 - gtmetrix.score);
        if (pingdom?.score) technicalScores.push(100 - pingdom.score);
        
        if (technicalScores.length > 0) {
            const avgTechBadness = technicalScores.reduce((a, b) => a + b, 0) / technicalScores.length;
            score = Math.round((score + avgTechBadness) / 2);
        }
        
        return Math.min(100, Math.max(0, score));
    }

    // MOCK DATA — replace with real APIs in production
    _mockBusinessSearch(industry, location) {
        const templates = [
            { name: `${location} Pro ${industry}`, website: `https://proloc${industry.slice(0, 4)}.com` },
            { name: `Best ${industry} Services`, website: `https://best${industry.slice(0, 5)}svc.net` },
            { name: `${industry.charAt(0).toUpperCase() + industry.slice(1)} Masters LLC`, website: `https://${industry}masters.biz` },
        ];
        return templates.map((t, i) => ({
            ...t,
            industry,
            address: `${123 + i * 10} Main St, ${location}, US`,
            phone: `(555) ${100 + i}-${2000 + i}`,
            rating: (3.5 + Math.random() * 1.5).toFixed(1),
            reviewCount: Math.floor(Math.random() * 80) + 5,
            ownerName: ['Mike Johnson', 'Sarah Williams', 'Dave Martinez'][i % 3],
            gbpLink: `https://www.google.com/maps/place/${t.name.replace(/ /g, '+')}`,
        }));
    }
}

module.exports = { ScoutAgent, WEBSITE_QUALITY_HEURISTICS };