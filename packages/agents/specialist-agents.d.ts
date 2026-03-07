/**
 * Autonomous Web Agency — Agents Type Declarations
 */

export class ScoutAgent {
    constructor(config?: any);
    findLeads(params: { industries: string[], location: string, minLeads?: number }): Promise<any[]>;
    evaluateBusiness(business: any): Promise<any>;
}

export class OutreachAgent {
    constructor(config?: any);
}

export class DesignPreviewAgent { }
export class SalesCloseAgent { }
export class WebBuildAgent { }
export class ClientSuccessAgent { }
export class ContentAgent { }
export class ErrorAgent { }
export class CodeAgent { }
export class EmailWritingAgent { }
export class OnboardingAgent { }
export class FinanceAgent { }
export class AuditAgent { }
export class NurtureAgent { }

export const WEBSITE_QUALITY_HEURISTICS: any;
export const EMAIL_SEQUENCES: any;
export const SOCIAL_CHANNELS: any;
export const PRICING: any;
export const RETRY_POLICY: any;
export const ERROR_CLASSIFICATIONS: any;
