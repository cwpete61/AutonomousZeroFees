/**
 * SPECIALIST AGENTS — Barrel Export
 * Re-exports all specialist agent classes from their individual packages
 */

const { ScoutAgent, WEBSITE_QUALITY_HEURISTICS } = require('./scout-agent/scout-agent');
const { OutreachAgent, EMAIL_SEQUENCES, SOCIAL_CHANNELS } = require('./outreach-agent/outreach-agent');
const { DesignPreviewAgent } = require('./design-preview-agent/design-preview-agent');
const { SalesCloseAgent, PRICING } = require('./sales-close-agent/sales-close-agent');
const { WebBuildAgent } = require('./web-build-agent/web-build-agent');
const { ClientSuccessAgent } = require('./client-success-agent/client-success-agent');
const { ContentAgent } = require('./content-agent/content-agent');
const { ErrorAgent, RETRY_POLICY, ERROR_CLASSIFICATIONS } = require('./error-agent/error-agent');
const { CodeAgent } = require('./code-agent/code-agent');
const { EmailWritingAgent } = require('./email-writing-agent/email-writing-agent');

// NEW AGENTS
const { OnboardingAgent } = require('./onboarding-agent/onboarding-agent');
const { FinanceAgent } = require('./finance-agent/finance-agent');
const { AuditAgent } = require('./audit-agent/audit-agent');
const { NurtureAgent } = require('./nurture-agent/nurture-agent');

module.exports = {
    ScoutAgent,
    OutreachAgent,
    DesignPreviewAgent,
    SalesCloseAgent,
    WebBuildAgent,
    ClientSuccessAgent,
    ContentAgent,
    ErrorAgent,
    CodeAgent,
    EmailWritingAgent,
    OnboardingAgent,
    FinanceAgent,
    AuditAgent,
    NurtureAgent,
    WEBSITE_QUALITY_HEURISTICS,
    EMAIL_SEQUENCES,
    SOCIAL_CHANNELS,
    PRICING,
    RETRY_POLICY,
    ERROR_CLASSIFICATIONS,
};