/**
 * Autonomous Web Agency — Shared Types
 * Central type definitions used across all apps and packages.
 */

// ─── Agent Contract ─────────────────────────────────────────────────

export type AgentResult<T = unknown> = {
  status: 'success' | 'failed' | 'needs_review';
  agentName: string;
  confidence: number;
  nextRecommendedAction?: string;
  data?: T;
  errors?: AgentError[];
  startedAt: string;
  finishedAt: string;
};

export type AgentError = {
  code: string;
  message: string;
  retryable: boolean;
};

// ─── Application Error ──────────────────────────────────────────────

export type AppError = {
  code: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  retryable: boolean;
  context?: Record<string, unknown>;
  correlationId: string;
};

// ─── Domain Events ──────────────────────────────────────────────────

export type DomainEvent<T = unknown> = {
  eventType: string;
  timestamp: string;
  correlationId: string;
  actorId?: string;
  actorType?: 'USER' | 'AGENT' | 'SYSTEM';
  payload: T;
};

// Re-export Prisma enums when generated
// export * from '@agency/db';
