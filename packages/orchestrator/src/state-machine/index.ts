/**
 * Autonomous Web Agency — Orchestrator Engine
 * State machine and workflow controller.
 */

import { LeadStatus } from '@agency/db';

/**
 * Valid state transitions for the lead pipeline.
 * The orchestrator MUST reject any transition not defined here.
 */
export const VALID_TRANSITIONS: Record<string, string[]> = {
  DISCOVERED: ['RESEARCHED'],
  RESEARCHED: ['AUDITED'],
  AUDITED: ['QUALIFIED', 'DISQUALIFIED'],
  QUALIFIED: ['ENRICHED', 'ENRICHMENT_FAILED'],
  DISQUALIFIED: ['RE_ENGAGE'],
  ENRICHED: ['OUTREACH_PENDING'],
  ENRICHMENT_FAILED: ['ENRICHED'],
  OUTREACH_PENDING: ['OUTREACH_APPROVED'],
  OUTREACH_APPROVED: ['OUTREACH_SENT'],
  OUTREACH_SENT: ['REPLIED', 'OUTREACH_FAILED'],
  OUTREACH_FAILED: ['OUTREACH_PENDING'],
  REPLIED: ['DEMO_PENDING'],
  DEMO_PENDING: ['DEMO_SENT', 'DEMO_FAILED'],
  DEMO_SENT: ['PROPOSAL_SENT'],
  DEMO_FAILED: ['DEMO_PENDING'],
  PROPOSAL_SENT: ['INVOICE_SENT'],
  INVOICE_SENT: ['PAID'],
  PAID: ['BUILD_STARTED'],
  BUILD_STARTED: ['REVIEW_PENDING', 'BUILD_FAILED'],
  BUILD_FAILED: ['BUILD_STARTED'],
  REVIEW_PENDING: ['DELIVERED'],
  DELIVERED: ['CLOSED_WON'],
  CLOSED_WON: [],
  CLOSED_LOST: ['RE_ENGAGE'],
  RE_ENGAGE: ['DISCOVERED'],
};

/**
 * Validates whether a state transition is allowed.
 */
export function isValidTransition(from: string, to: string): boolean {
  const allowed = VALID_TRANSITIONS[from];
  if (!allowed) return false;
  return allowed.includes(to);
}

/**
 * States that require human approval before the transition can proceed.
 */
export const APPROVAL_REQUIRED_STATES: string[] = [
  'OUTREACH_APPROVED', // requires approval before sending
  'DEMO_SENT',         // requires approval before demo release
  'INVOICE_SENT',      // requires approval before invoice send
  'DELIVERED',         // requires approval before final delivery
];
