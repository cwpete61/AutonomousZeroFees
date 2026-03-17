/**
 * ORCHESTRATOR AGENT
 * Central coordinator for the Web Agency Pipeline
 * Routes leads through the full funnel: Scout → Outreach → Preview → Close → Build → Success
 */

const PIPELINE_STAGES = {
    DISCOVERED: 'discovered',
    SCORED: 'scored',
    OUTREACH_QUEUED: 'outreach_queued',
    OUTREACH_SENT: 'outreach_sent',
    PREVIEW_GENERATED: 'preview_generated',
    REPLIED: 'replied',
    DEMO_SENT: 'audit_sent',
    INVOICED: 'invoiced',
    PAID: 'paid',
    BUILD_STARTED: 'build_started',
    BUILD_COMPLETE: 'build_complete',
    ONBOARDED: 'onboarded',
};

const AGENT_REGISTRY = {
    scout: {
        id: 'scout',
        name: 'Scout Agent',
        description: 'Finds businesses with high processing fee recovery potential',
        triggers: ['cron:daily', 'manual'],
        inputs: ['industry', 'location', 'min_leads'],
        outputs: ['lead_list'],
    },
    outreach: {
        id: 'outreach',
        name: 'Outreach Agent',
        description: 'Sends cold email sequences, manages follow-ups',
        triggers: ['lead:scored', 'manual'],
        inputs: ['lead', 'email_template', 'sequence'],
        outputs: ['email_status', 'reply_detected'],
    },
    profit_audit: {
        id: 'profit_audit',
        name: 'Profit Audit Agent',
        description: 'Audits processing fee waste and generates a recovery report',
        triggers: ['lead:outreach_queued'],
        inputs: ['business_name', 'industry', 'processing_signals'],
        outputs: ['annual_waste', 'recovery_audit_report'],
    },
    sales_close: {
        id: 'sales_close',
        name: 'Sales Close Agent',
        description: 'Handles activation responses, addresses switch concerns, and issues recovery agreements',
        triggers: ['lead:replied'],
        inputs: ['lead', 'audit_report', 'pricing_tier'],
        outputs: ['agreement_sent', 'shield_activated', 'deal_lost'],
    },
    web_build: {
        id: 'web_build',
        name: 'Growth Agent',
        description: 'Deploys growth infrastructure (landing pages, local SEO) funded by reclaimed fees',
        triggers: ['lead:shield_activated'],
        inputs: ['brief', 'reclaimed_budget', 'conversion_goals'],
        outputs: ['growth_assets_deployed', 'build_files'],
    },
    client_success: {
        id: 'client_success',
        name: 'Client Success Agent',
        description: 'Communicates with client via preferred channel',
        triggers: ['lead:build_started', 'lead:build_complete', 'client:message'],
        inputs: ['lead', 'channel_preference', 'message_type'],
        outputs: ['message_sent', 'feedback_collected'],
    },
};

class Orchestrator {
    constructor(config = {}) {
        this.config = {
            anthropicApiKey: config.anthropicApiKey || process.env.ANTHROPIC_API_KEY,
            model: 'claude-sonnet-4-20250514',
            leadDatabase: config.leadDatabase || new InMemoryLeadDB(),
            eventBus: config.eventBus || new EventBus(),
            ...config,
        };
        this.agents = {};
        this.registerAgents();
    }

    registerAgents() {
        Object.values(AGENT_REGISTRY).forEach(agentDef => {
            this.agents[agentDef.id] = new AgentRunner(agentDef, this.config);
        });
    }

    /**
     * Main pipeline router — called whenever a lead's stage changes
     */
    async routeLead(lead) {
        console.log(`[Orchestrator] Routing lead ${lead.id} | Stage: ${lead.stage}`);

        const routingMap = {
            [PIPELINE_STAGES.DISCOVERED]: () => this.agents.scout.score(lead),
            [PIPELINE_STAGES.SCORED]: () => this.triggerOutreachPrep(lead),
            [PIPELINE_STAGES.OUTREACH_QUEUED]: () => Promise.all([
                this.agents.profit_audit.generate(lead),
                this.agents.outreach.sendInitialEmail(lead),
            ]),
            [PIPELINE_STAGES.REPLIED]: () => this.agents.sales_close.handleReply(lead),
            [PIPELINE_STAGES.INVOICED]: () => this.waitForPayment(lead),
            [PIPELINE_STAGES.PAID]: () => this.agents.web_build.startDeployment(lead),
            [PIPELINE_STAGES.BUILD_STARTED]: () => this.agents.client_success.onboard(lead),
            [PIPELINE_STAGES.BUILD_COMPLETE]: () => this.agents.client_success.deliver(lead),
        };

        const handler = routingMap[lead.stage];
        if (!handler) {
            console.warn(`[Orchestrator] No handler for stage: ${lead.stage}`);
            return;
        }

        try {
            const result = await handler();
            await this.config.leadDatabase.updateLead(lead.id, { lastAction: result });
            this.config.eventBus.emit('lead:updated', lead);
        } catch (err) {
            console.error(`[Orchestrator] Error routing lead ${lead.id}:`, err);
            await this.config.leadDatabase.updateLead(lead.id, {
                error: err.message,
                stage: `${lead.stage}:error`
            });
        }
    }

    async triggerOutreachPrep(lead) {
        // Only outreach leads above quality threshold
        if (lead.qualityScore < 60) {
            console.log(`[Orchestrator] Lead ${lead.id} below threshold (${lead.qualityScore}), skipping`);
            return { action: 'skipped', reason: 'low_quality_score' };
        }
        await this.updateLeadStage(lead.id, PIPELINE_STAGES.OUTREACH_QUEUED);
        return { action: 'queued_for_outreach' };
    }

    async waitForPayment(lead) {
        // Payment webhooks handled externally (Stripe) — just log
        console.log(`[Orchestrator] Awaiting payment for lead ${lead.id}`);
        return { action: 'awaiting_payment', invoiceId: lead.invoiceId };
    }

    async updateLeadStage(leadId, newStage) {
        await this.config.leadDatabase.updateLead(leadId, { stage: newStage });
        this.config.eventBus.emit('stage:changed', { leadId, newStage });
    }

    async runScoutCycle(params = {}) {
        console.log('[Orchestrator] Starting scout cycle...');
        const leads = await this.agents.scout.findLeads({
            industries: params.industries || ['plumbing', 'roofing', 'landscaping', 'hvac', 'cleaning'],
            location: params.location || 'United States',
            minLeads: params.minLeads || 20,
        });

        for (const lead of leads) {
            await this.config.leadDatabase.saveLead(lead);
            await this.routeLead(lead);
        }

        return { leadsFound: leads.length };
    }

    getStatus() {
        return {
            agents: Object.keys(this.agents),
            pipeline: PIPELINE_STAGES,
            registry: AGENT_REGISTRY,
        };
    }
}

/**
 * Agent Runner — wraps each agent with Claude API calls
 */
class AgentRunner {
    constructor(definition, config) {
        this.def = definition;
        this.config = config;
    }

    async callClaude(systemPrompt, userMessage, tools = []) {
        const body = {
            model: this.config.model,
            max_tokens: 1000,
            system: systemPrompt,
            messages: [{ role: 'user', content: userMessage }],
        };
        if (tools.length) body.tools = tools;

        const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.config.anthropicApiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify(body),
        });
        return res.json();
    }
}

/**
 * Minimal in-memory lead store (replace with Supabase/Postgres in prod)
 */
class InMemoryLeadDB {
    constructor() { this.leads = new Map(); }
    async saveLead(lead) { this.leads.set(lead.id, lead); return lead; }
    async getLead(id) { return this.leads.get(id); }
    async updateLead(id, updates) {
        const lead = this.leads.get(id) || {};
        const updated = { ...lead, ...updates, updatedAt: new Date().toISOString() };
        this.leads.set(id, updated);
        return updated;
    }
    async getAllLeads() { return Array.from(this.leads.values()); }
}

class EventBus {
    constructor() { this.listeners = {}; }
    on(event, fn) { (this.listeners[event] = this.listeners[event] || []).push(fn); }
    emit(event, data) { (this.listeners[event] || []).forEach(fn => fn(data)); }
}

module.exports = { Orchestrator, PIPELINE_STAGES, AGENT_REGISTRY, InMemoryLeadDB, EventBus };