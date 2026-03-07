/**
 * Autonomous Web Agency — Event Bus
 * Lightweight domain event system backed by Redis Pub/Sub.
 */

export type EventHandler<T = unknown> = (event: {
  eventType: string;
  timestamp: string;
  correlationId: string;
  actorId?: string;
  actorType?: 'USER' | 'AGENT' | 'SYSTEM';
  payload: T;
}) => Promise<void>;

// Event type constants
export const EVENTS = {
  LEAD_STATUS_CHANGED: 'lead.status.changed',
  LEAD_CREATED: 'lead.created',
  APPROVAL_REQUESTED: 'approval.requested',
  APPROVAL_COMPLETED: 'approval.completed',
  AGENT_RUN_STARTED: 'agent.run.started',
  AGENT_RUN_FINISHED: 'agent.run.finished',
  AGENT_RUN_FAILED: 'agent.run.failed',
  OUTREACH_SENT: 'outreach.sent',
  REPLY_RECEIVED: 'reply.received',
  INVOICE_PAID: 'invoice.paid',
  PROJECT_STATUS_CHANGED: 'project.status.changed',
  INCIDENT_OPENED: 'incident.opened',
  INCIDENT_RESOLVED: 'incident.resolved',
  BACKUP_COMPLETED: 'backup.completed',
  BACKUP_FAILED: 'backup.failed',
  MAINTENANCE_COMPLETED: 'maintenance.completed',
} as const;

export type EventType = (typeof EVENTS)[keyof typeof EVENTS];
