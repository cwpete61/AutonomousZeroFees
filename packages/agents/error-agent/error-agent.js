/**
 * ERROR AGENT
 * Handles error classification, escalation, retry decisions, and incident creation
 * Central error handling for all agents in the pipeline
 *
 * SETUP REQUIRED:
 *   ANTHROPIC_API_KEY (optional — can run without)
 */

const RETRY_POLICY = {
    default: { maxRetries: 3, backoffMs: [1000, 5000, 15000], strategy: 'exponential' },
    scout: { maxRetries: 2, backoffMs: [2000, 10000], strategy: 'exponential' },
    outreach: { maxRetries: 3, backoffMs: [5000, 30000, 60000], strategy: 'exponential' },
    design_preview: { maxRetries: 2, backoffMs: [3000, 15000], strategy: 'exponential' },
    sales_close: { maxRetries: 1, backoffMs: [5000], strategy: 'fixed' },
    web_build: { maxRetries: 2, backoffMs: [10000, 30000], strategy: 'exponential' },
    client_success: { maxRetries: 3, backoffMs: [2000, 5000, 10000], strategy: 'exponential' },
};

const ERROR_CLASSIFICATIONS = {
    TRANSIENT: { retryable: true, severity: 'low', description: 'Temporary failure, retry should work' },
    API_LIMIT: { retryable: true, severity: 'medium', description: 'Rate limit or quota exceeded' },
    AUTH_FAILURE: { retryable: false, severity: 'high', description: 'Authentication or authorization failure' },
    DATA_INVALID: { retryable: false, severity: 'medium', description: 'Invalid input data' },
    EXTERNAL_DOWN: { retryable: true, severity: 'high', description: 'External service unavailable' },
    INTERNAL_BUG: { retryable: false, severity: 'critical', description: 'Internal logic error' },
    TIMEOUT: { retryable: true, severity: 'medium', description: 'Operation timed out' },
    UNKNOWN: { retryable: false, severity: 'high', description: 'Unclassified error' },
};

class ErrorAgent {
    constructor(config = {}) {
        this.config = config;
        this.retryCounters = new Map(); // key: `${agentName}:${targetId}` → count
    }

    /**
     * Classify an error and determine the appropriate action
     */
    classifyError(error, agentName, context = {}) {
        const message = (error?.message || error || '').toLowerCase();

        let classification = 'UNKNOWN';

        if (message.includes('timeout') || message.includes('timed out') || message.includes('ETIMEDOUT')) {
            classification = 'TIMEOUT';
        } else if (message.includes('429') || message.includes('rate limit') || message.includes('quota')) {
            classification = 'API_LIMIT';
        } else if (message.includes('401') || message.includes('403') || message.includes('unauthorized') || message.includes('forbidden')) {
            classification = 'AUTH_FAILURE';
        } else if (message.includes('ECONNREFUSED') || message.includes('ENOTFOUND') || message.includes('503') || message.includes('502')) {
            classification = 'EXTERNAL_DOWN';
        } else if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
            classification = 'DATA_INVALID';
        } else if (message.includes('ECONNRESET') || message.includes('socket') || message.includes('network')) {
            classification = 'TRANSIENT';
        } else if (message.includes('TypeError') || message.includes('ReferenceError') || message.includes('cannot read')) {
            classification = 'INTERNAL_BUG';
        }

        const classInfo = ERROR_CLASSIFICATIONS[classification];

        return {
            classification,
            ...classInfo,
            agentName,
            originalError: error?.message || String(error),
            context,
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * Determine whether to retry, escalate, or dead-letter
     */
    getRetryDecision(classifiedError, targetId) {
        const key = `${classifiedError.agentName}:${targetId}`;
        const currentCount = this.retryCounters.get(key) || 0;
        const policy = RETRY_POLICY[classifiedError.agentName] || RETRY_POLICY.default;

        if (!classifiedError.retryable) {
            return {
                action: 'dead_letter',
                reason: `Non-retryable error: ${classifiedError.classification}`,
                retryCount: currentCount,
                maxRetries: policy.maxRetries,
            };
        }

        if (currentCount >= policy.maxRetries) {
            return {
                action: 'dead_letter',
                reason: `Max retries (${policy.maxRetries}) exhausted`,
                retryCount: currentCount,
                maxRetries: policy.maxRetries,
            };
        }

        const backoffMs = policy.backoffMs[currentCount] || policy.backoffMs[policy.backoffMs.length - 1];
        this.retryCounters.set(key, currentCount + 1);

        return {
            action: 'retry',
            retryCount: currentCount + 1,
            maxRetries: policy.maxRetries,
            backoffMs,
            retryAt: new Date(Date.now() + backoffMs).toISOString(),
        };
    }

    /**
     * Create an incident record for critical errors
     */
    createIncident(classifiedError, additionalContext = {}) {
        const shouldCreateIncident =
            classifiedError.severity === 'critical' ||
            (classifiedError.severity === 'high' && !classifiedError.retryable);

        if (!shouldCreateIncident) return null;

        return {
            id: `inc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            title: `[${classifiedError.agentName}] ${classifiedError.classification}: ${classifiedError.originalError.slice(0, 100)}`,
            severity: classifiedError.severity.toUpperCase(),
            status: 'OPEN',
            rootCause: classifiedError.originalError,
            context: { ...classifiedError.context, ...additionalContext },
            openedAt: new Date().toISOString(),
        };
    }

    /**
     * Full error handling pipeline: classify → retry decision → incident
     */
    async handleError(error, agentName, targetId, context = {}) {
        console.log(`[ErrorAgent] Handling error from ${agentName}: ${error?.message || error}`);

        const classified = this.classifyError(error, agentName, context);
        const retryDecision = this.getRetryDecision(classified, targetId);
        const incident = this.createIncident(classified, context);

        console.log(`[ErrorAgent] Classification: ${classified.classification} | Action: ${retryDecision.action}`);

        return {
            classified,
            retryDecision,
            incident,
            summary: {
                agentName,
                targetId,
                errorType: classified.classification,
                severity: classified.severity,
                action: retryDecision.action,
                hasIncident: !!incident,
            },
        };
    }

    /**
     * Reset retry counter for a target
     */
    resetRetries(agentName, targetId) {
        this.retryCounters.delete(`${agentName}:${targetId}`);
    }
}

module.exports = { ErrorAgent, RETRY_POLICY, ERROR_CLASSIFICATIONS };
