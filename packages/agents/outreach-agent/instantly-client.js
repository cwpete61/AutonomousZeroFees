/**
 * INSTANTLY INTEGRATION
 * Connects Orbis Outreach - BPS to Instantly.ai for cold email delivery
 *
 * FLOW:
 *   1. Outreach Agent composes emails in-app (subject, body, follow-ups)
 *   2. This module pushes them to Instantly via API V2
 *   3. Instantly handles warm-up, throttling, deliverability, and sending
 *
 * API V2 BASE: https://api.instantly.ai/api/v2
 *
 * SETUP:
 *   INSTANTLY_API_KEY   — from Instantly dashboard → Settings → API
 *   INSTANTLY_ORG_ID    — (optional) for multi-org setups
 */

const INSTANTLY_BASE = 'https://api.instantly.ai/api/v2';

class InstantlyClient {
    constructor(config = {}) {
        this.apiKey = config.apiKey || process.env.INSTANTLY_API_KEY;
        if (!this.apiKey) {
            console.warn('[Instantly] No API key set — running in stub mode');
        }
    }

    // ─── HTTP Helper ────────────────────────────────────────────────

    async _request(method, path, body = null) {
        const url = `${INSTANTLY_BASE}${path}`;
        const headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
        };

        try {
            const res = await fetch(url, {
                method,
                headers,
                body: body ? JSON.stringify(body) : undefined,
            });

            if (!res.ok) {
                const errText = await res.text();
                console.error(`[Instantly] ${method} ${path} → ${res.status}: ${errText}`);
                return { error: true, status: res.status, message: errText };
            }

            return await res.json();
        } catch (err) {
            console.error(`[Instantly] Network error on ${method} ${path}:`, err.message);
            return { error: true, message: err.message };
        }
    }

    // ─── Campaigns ──────────────────────────────────────────────────

    /**
     * Create a new campaign in Instantly
     * @param {Object} opts
     * @param {string} opts.name - Campaign name
     * @param {Array} opts.emailAccounts - Sending email accounts (IDs)
     * @returns Campaign object with id
     */
    async createCampaign({ name, emailAccounts = [] }) {
        console.log(`[Instantly] Creating campaign: ${name}`);
        return this._request('POST', '/campaigns', {
            name,
            email_accounts: emailAccounts,
        });
    }

    /**
     * List all campaigns
     */
    async listCampaigns(limit = 50, skip = 0) {
        return this._request('GET', `/campaigns?limit=${limit}&skip=${skip}`);
    }

    /**
     * Get campaign by ID
     */
    async getCampaign(campaignId) {
        return this._request('GET', `/campaigns/${campaignId}`);
    }

    /**
     * Update campaign sequences (email steps)
     * This is how we push the emails composed in-app to Instantly
     *
     * @param {string} campaignId
     * @param {Array} sequences - Array of sequence steps:
     *   [{ subject, body, delay_in_days }]
     */
    async setCampaignSequences(campaignId, sequences) {
        console.log(`[Instantly] Setting ${sequences.length} email steps for campaign ${campaignId}`);
        return this._request('PATCH', `/campaigns/${campaignId}`, {
            sequences: [{
                steps: sequences.map((seq, i) => ({
                    subject: seq.subject,
                    body: seq.body,
                    type: 'email',
                    delay: i === 0 ? 0 : (seq.delay_in_days || 3),
                    variants: seq.variants || [],
                })),
            }],
        });
    }

    /**
     * Activate a campaign (start sending)
     */
    async activateCampaign(campaignId) {
        console.log(`[Instantly] Activating campaign ${campaignId}`);
        return this._request('POST', `/campaigns/${campaignId}/activate`);
    }

    /**
     * Pause a campaign
     */
    async pauseCampaign(campaignId) {
        return this._request('POST', `/campaigns/${campaignId}/pause`);
    }

    /**
     * Get campaign analytics
     */
    async getCampaignAnalytics(campaignId) {
        return this._request('GET', `/campaigns/${campaignId}/analytics`);
    }

    // ─── Leads ──────────────────────────────────────────────────────

    /**
     * Add leads to a campaign
     * @param {string} campaignId
     * @param {Array} leads - Array of lead objects:
     *   [{ email, first_name, last_name, company_name, website, custom_variables }]
     */
    async addLeadsToCampaign(campaignId, leads) {
        console.log(`[Instantly] Adding ${leads.length} leads to campaign ${campaignId}`);
        return this._request('POST', '/leads', {
            campaign_id: campaignId,
            leads: leads.map(lead => ({
                email: lead.email,
                first_name: lead.firstName || lead.first_name || '',
                last_name: lead.lastName || lead.last_name || '',
                company_name: lead.companyName || lead.company_name || lead.name || '',
                website: lead.website || '',
                custom_variables: {
                    industry: lead.industry || '',
                    city: lead.city || '',
                    google_rating: lead.googleRating || '',
                    google_reviews: lead.googleReviews || '',
                    score: lead.score || '',
                    redesign_pitch: lead.redesignPitch || '',
                    ...(lead.customVariables || {}),
                },
            })),
        });
    }

    /**
     * List leads in a campaign
     */
    async listLeads(campaignId, limit = 100, skip = 0) {
        return this._request('GET', `/leads?campaign_id=${campaignId}&limit=${limit}&skip=${skip}`);
    }

    /**
     * Get lead by email
     */
    async getLeadByEmail(email) {
        return this._request('GET', `/leads?email=${encodeURIComponent(email)}`);
    }

    /**
     * Update lead interest status
     */
    async updateLeadStatus(leadId, status) {
        // status: 'interested', 'not_interested', 'wrong_person', 'meeting_booked', etc.
        return this._request('PATCH', `/leads/${leadId}`, {
            interest_status: status,
        });
    }

    // ─── Email Accounts ─────────────────────────────────────────────

    /**
     * List connected email sending accounts
     */
    async listEmailAccounts(limit = 50) {
        return this._request('GET', `/email-accounts?limit=${limit}`);
    }

    // ─── High-Level Workflows ───────────────────────────────────────

    /**
     * MAIN WORKFLOW: Compose in app → push to Instantly
     *
     * Takes a lead + emails generated by the Outreach Agent,
     * creates/uses a campaign, adds the lead, sets the sequences,
     * and optionally activates.
     *
     * @param {Object} opts
     * @param {Object} opts.lead - Lead data from Scout Agent
     * @param {Object} opts.emailSequence - Output from OutreachAgent.generateSequence()
     * @param {string} opts.campaignId - Existing campaign ID (or null to create new)
     * @param {string} opts.campaignName - Name for new campaign
     * @param {boolean} opts.autoActivate - Start sending immediately
     * @param {Array} opts.emailAccounts - Sending account IDs
     */
    async pushOutreachToInstantly({
        lead,
        emailSequence,
        campaignId = null,
        campaignName = null,
        autoActivate = false,
        emailAccounts = [],
    }) {
        console.log(`[Instantly] Pushing outreach for ${lead.name} to Instantly`);

        // Step 1: Create campaign if no ID provided
        if (!campaignId) {
            const name = campaignName || `Orbis → ${lead.industry} – ${lead.city || 'US'} – ${new Date().toISOString().slice(0, 10)}`;
            const campaign = await this.createCampaign({ name, emailAccounts });
            if (campaign.error) return campaign;
            campaignId = campaign.id;
        }

        // Step 2: Set email sequences (composed in-app by Outreach Agent)
        const sequences = [];

        // Initial email
        if (emailSequence.subjectLine && emailSequence.firstEmail) {
            sequences.push({
                subject: emailSequence.subjectLine,
                body: emailSequence.firstEmail,
                delay_in_days: 0,
            });
        }

        // Follow-up 1
        if (emailSequence.followupOne) {
            sequences.push({
                subject: `Re: ${emailSequence.subjectLine}`,
                body: emailSequence.followupOne,
                delay_in_days: emailSequence.schedule?.[1]?.sendAfterDays || 3,
            });
        }

        // Follow-up 2
        if (emailSequence.followupTwo) {
            sequences.push({
                subject: `Re: ${emailSequence.subjectLine}`,
                body: emailSequence.followupTwo,
                delay_in_days: emailSequence.schedule?.[2]?.sendAfterDays || 7,
            });
        }

        if (sequences.length > 0) {
            const seqResult = await this.setCampaignSequences(campaignId, sequences);
            if (seqResult.error) return seqResult;
        }

        // Step 3: Add lead to campaign
        const leadResult = await this.addLeadsToCampaign(campaignId, [lead]);
        if (leadResult.error) return leadResult;

        // Step 4: Optionally activate
        if (autoActivate) {
            await this.activateCampaign(campaignId);
        }

        return {
            success: true,
            campaignId,
            leadsAdded: 1,
            emailSteps: sequences.length,
            activated: autoActivate,
        };
    }

    /**
     * Push a batch of leads with their sequences to a single campaign
     */
    async pushBatchToInstantly({
        leads,
        emailSequences,
        campaignName,
        emailAccounts = [],
        autoActivate = false,
    }) {
        console.log(`[Instantly] Pushing batch of ${leads.length} leads`);

        // Create one campaign for the batch
        const campaign = await this.createCampaign({
            name: campaignName || `Orbis Batch – ${new Date().toISOString().slice(0, 10)}`,
            emailAccounts,
        });
        if (campaign.error) return campaign;

        // Use the first lead's sequence as the campaign template
        // (Instantly personalizes with {{variables}} per lead)
        if (emailSequences[0]) {
            const seq = emailSequences[0];
            const steps = [];
            if (seq.subjectLine) steps.push({ subject: seq.subjectLine, body: seq.firstEmail, delay_in_days: 0 });
            if (seq.followupOne) steps.push({ subject: `Re: ${seq.subjectLine}`, body: seq.followupOne, delay_in_days: 3 });
            if (seq.followupTwo) steps.push({ subject: `Re: ${seq.subjectLine}`, body: seq.followupTwo, delay_in_days: 7 });
            await this.setCampaignSequences(campaign.id, steps);
        }

        // Add all leads
        const result = await this.addLeadsToCampaign(campaign.id, leads);

        if (autoActivate) {
            await this.activateCampaign(campaign.id);
        }

        return {
            success: !result.error,
            campaignId: campaign.id,
            leadsAdded: leads.length,
            activated: autoActivate,
        };
    }
}

module.exports = { InstantlyClient };
