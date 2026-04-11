-- ============================================================
-- Fix: hearing_sessions GRANT permissions
-- ============================================================
-- service_role bypasses RLS but still needs GRANT on the table.
-- Run this in Supabase SQL Editor.
-- ============================================================

-- Grant schema usage
GRANT USAGE ON SCHEMA dnaos TO anon, authenticated, service_role;

-- Grant table access
GRANT ALL ON dnaos.hearing_sessions TO anon, authenticated, service_role;

-- Grant sequence access (for gen_random_uuid default)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA dnaos TO anon, authenticated, service_role;

-- Also fix clinic_data in dnaos schema if it exists
GRANT ALL ON dnaos.clinic_data TO anon, authenticated, service_role;

-- Expose dnaos schema to PostgREST
-- (This may already be set, but ensure it)
ALTER ROLE authenticator SET pgrst.db_schemas TO 'public, dnaos';
NOTIFY pgrst, 'reload config';

-- ============================================================
-- Fix: hearing_raw upsert constraint on dnaos.clinic_data
-- ============================================================
-- The upsert uses ON CONFLICT (client_id, category, title)
-- but the constraint only exists where category = 'hearing_raw'
-- which is a partial unique index. PostgREST can't use partial
-- indexes for ON CONFLICT. Create a regular constraint instead.
-- ============================================================

-- Drop the partial index
DROP INDEX IF EXISTS dnaos.idx_clinic_data_upsert;

-- Create a full unique constraint for upsert support
CREATE UNIQUE INDEX IF NOT EXISTS idx_clinic_data_client_cat_title
  ON dnaos.clinic_data(client_id, category, title);
