/**
 * Autonomous Web Agency — Agents Package
 * TypeScript entry point for specialist agents.
 */

// Import the JS agents (bridge)
const specialistAgents = require('./specialist-agents');

export const ScoutAgent = specialistAgents.ScoutAgent;
export const OutreachAgent = specialistAgents.OutreachAgent;
export const DesignPreviewAgent = specialistAgents.DesignPreviewAgent;
export const SalesCloseAgent = specialistAgents.SalesCloseAgent;
export const WebBuildAgent = specialistAgents.WebBuildAgent;
export const ClientSuccessAgent = specialistAgents.ClientSuccessAgent;
export const ContentAgent = specialistAgents.ContentAgent;
export const ErrorAgent = specialistAgents.ErrorAgent;
export const CodeAgent = specialistAgents.CodeAgent;
export const EmailWritingAgent = specialistAgents.EmailWritingAgent;
export const OnboardingAgent = specialistAgents.OnboardingAgent;
export const FinanceAgent = specialistAgents.FinanceAgent;
export const AuditAgent = specialistAgents.AuditAgent;
export const NurtureAgent = specialistAgents.NurtureAgent;

export const WEBSITE_QUALITY_HEURISTICS = specialistAgents.WEBSITE_QUALITY_HEURISTICS;
export const EMAIL_SEQUENCES = specialistAgents.EMAIL_SEQUENCES;
export const SOCIAL_CHANNELS = specialistAgents.SOCIAL_CHANNELS;
export const PRICING = specialistAgents.PRICING;
export const RETRY_POLICY = specialistAgents.RETRY_POLICY;
export const ERROR_CLASSIFICATIONS = specialistAgents.ERROR_CLASSIFICATIONS;
