-- ============================================================
-- dnaos.hearing_sessions — Ponko Hearing Staging Table
-- ============================================================
-- Run this in Supabase SQL Editor
-- ============================================================

-- Ensure dnaos schema exists
create schema if not exists dnaos;

-- Create hearing_sessions table
create table if not exists dnaos.hearing_sessions (
  id                uuid primary key default gen_random_uuid(),
  client_id         uuid not null unique,
  form_data         jsonb not null default '{}',
  mission_draft     jsonb not null default '{}',
  onboarding_done   boolean not null default false,
  last_section_id   text,
  progress          smallint not null default 0
                    constraint chk_progress check (progress >= 0 and progress <= 100),
  status            text not null default 'editing'
                    constraint chk_status check (status in ('editing', 'completed', 'submitted')),
  submitted_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Status index for admin queries
create index if not exists idx_hearing_sessions_status
  on dnaos.hearing_sessions(status);

-- RLS (permissive, same pattern as clinic_data)
alter table dnaos.hearing_sessions enable row level security;

create policy "Authenticated full access on hearing_sessions"
  on dnaos.hearing_sessions for all
  to authenticated
  using (true)
  with check (true);

create policy "Anon full access on hearing_sessions"
  on dnaos.hearing_sessions for all
  to anon
  using (true)
  with check (true);

-- updated_at auto-trigger
create or replace function dnaos.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger hearing_sessions_updated_at
  before update on dnaos.hearing_sessions
  for each row execute function dnaos.update_updated_at();

-- ============================================================
-- Add hearing_password to client_master
-- ============================================================

alter table public.client_master
  add column if not exists hearing_password text;
