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
    generateSequence(lead: any, sequenceType?: string): Promise<any>;
    sendEmail(to: string, subject: string, body: string, options?: any): Promise<any>;
    sendInitialEmail(lead: any): Promise<any>;
    classifyReply(replyContent: string, lead: any): Promise<any>;
}

export class DesignPreviewAgent {
    constructor(config?: any);
    generate(lead: any): Promise<any>;
    captureScreenshot(url: string): Promise<string>;
}
export class SalesCloseAgent {
    constructor(config?: any);
    handleReply(lead: any, replyContent: string, classification?: any): Promise<any>;
    sendDemo(lead: any): Promise<any>;
    generateProposal(lead: any, packageTier?: string): Promise<any>;
    createInvoice(lead: any, proposal: any): Promise<any>;
}
export class WebBuildAgent {
    constructor(config?: any);
    startBuild(lead: any): Promise<any>;
    generatePage(brief: any, filename: string): Promise<any>;
}
export class ClientSuccessAgent {
    constructor(config?: any);
    onboard(lead: any): Promise<any>;
    sendProgressUpdate(client: any, project: any, progressDetails: string): Promise<any>;
    deliver(lead: any): Promise<any>;
    handleClientMessage(client: any, message: string, channel: string): Promise<any>;
}
export class ContentAgent {
    constructor(config?: any);
    generateContent(brief: any, assetType: string): Promise<any>;
    generateContentChecklist(brief: any): Promise<any>;
    generateBlogPost(brief: any, topic: string): Promise<any>;
}
export class ErrorAgent { }
export class CodeAgent { }
export class EmailWritingAgent { }
export class OnboardingAgent { }
export class FinanceAgent { }
export class AuditAgent {
    constructor(config?: any);
    performAudit(url: string): Promise<any>;
    generateProblemReport(audit: any): Promise<any>;
}
export class NurtureAgent {
    constructor(config?: any);
    findNurtureTargets(leads: any[]): Promise<any[]>;
    generateValueDrop(lead: any): Promise<any>;
}

export const WEBSITE_QUALITY_HEURISTICS: any;
export const EMAIL_SEQUENCES: any;
export const SOCIAL_CHANNELS: any;
export const PRICING: any;
export const RETRY_POLICY: any;
export const ERROR_CLASSIFICATIONS: any;
