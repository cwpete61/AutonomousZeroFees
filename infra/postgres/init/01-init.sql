-- Autonomous Web Agency — PostgreSQL Init Script
-- Runs on first container creation

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create logical schemas
CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS ops;
CREATE SCHEMA IF NOT EXISTS backup;
CREATE SCHEMA IF NOT EXISTS vector;

-- Grant usage
GRANT USAGE ON SCHEMA core TO agency;
GRANT USAGE ON SCHEMA auth TO agency;
GRANT USAGE ON SCHEMA ops TO agency;
GRANT USAGE ON SCHEMA backup TO agency;
GRANT USAGE ON SCHEMA vector TO agency;

-- Grant create (for Prisma migrations)
GRANT CREATE ON SCHEMA core TO agency;
GRANT CREATE ON SCHEMA auth TO agency;
GRANT CREATE ON SCHEMA ops TO agency;
GRANT CREATE ON SCHEMA backup TO agency;
GRANT CREATE ON SCHEMA vector TO agency;
