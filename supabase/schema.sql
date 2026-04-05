-- ============================================================
-- Farms Directory — Supabase Schema
-- ============================================================
-- Paste this in the Supabase SQL Editor and run it.
-- All client access uses the publishable (anon) key — RLS
-- policies below control exactly what each role can do.
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- updated_at trigger helper
-- (defined first so triggers below can reference it)
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================================
-- Coffee Farms
-- Source of truth is data/coffee-farms.json in git.
-- This table is a mirror used for contact lookups only.
-- ============================================================
CREATE TABLE IF NOT EXISTS coffee_farms (
  id                 TEXT PRIMARY KEY,
  name               TEXT NOT NULL,
  state              TEXT NOT NULL,
  city               TEXT NOT NULL,
  address            TEXT,
  pincode            TEXT,
  lat                DECIMAL(10, 8),
  lng                DECIMAL(11, 8),
  url                TEXT,
  description        TEXT,
  elevation_meters   INTEGER,
  varieties          TEXT[]  DEFAULT '{}',
  processing_methods TEXT[]  DEFAULT '{}',
  certifications     TEXT[]  DEFAULT '{}',
  active             BOOLEAN NOT NULL DEFAULT true,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS coffee_farms_state_idx  ON coffee_farms (state);
CREATE INDEX IF NOT EXISTS coffee_farms_active_idx ON coffee_farms (active);

CREATE OR REPLACE TRIGGER coffee_farms_updated_at
  BEFORE UPDATE ON coffee_farms
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- Tea Farms
-- ============================================================
CREATE TABLE IF NOT EXISTS tea_farms (
  id                 TEXT PRIMARY KEY,
  name               TEXT NOT NULL,
  state              TEXT NOT NULL,
  city               TEXT NOT NULL,
  address            TEXT,
  pincode            TEXT,
  lat                DECIMAL(10, 8),
  lng                DECIMAL(11, 8),
  url                TEXT,
  description        TEXT,
  elevation_meters   INTEGER,
  tea_types          TEXT[]  DEFAULT '{}',
  processing_methods TEXT[]  DEFAULT '{}',
  certifications     TEXT[]  DEFAULT '{}',
  active             BOOLEAN NOT NULL DEFAULT true,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tea_farms_state_idx  ON tea_farms (state);
CREATE INDEX IF NOT EXISTS tea_farms_active_idx ON tea_farms (active);

CREATE OR REPLACE TRIGGER tea_farms_updated_at
  BEFORE UPDATE ON tea_farms
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- Submissions
-- Anyone can submit; admin reviews via the admin panel.
-- ============================================================
CREATE TABLE IF NOT EXISTS submissions (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_type          TEXT NOT NULL CHECK (farm_type IN ('coffee', 'tea')),

  -- Core fields
  name               TEXT NOT NULL,
  state              TEXT NOT NULL,
  city               TEXT NOT NULL,
  address            TEXT,
  pincode            TEXT,
  url                TEXT,
  description        TEXT,

  -- Coordinates
  lat                DECIMAL(10, 8),
  lng                DECIMAL(11, 8),

  -- Coffee-specific
  elevation_meters   INTEGER,
  varieties          TEXT[] DEFAULT '{}',
  processing_methods TEXT[] DEFAULT '{}',
  certifications     TEXT[] DEFAULT '{}',

  -- Tea-specific
  tea_types          TEXT[] DEFAULT '{}',

  -- Submitter info
  submitter_name     TEXT,
  submitter_email    TEXT,
  submitter_notes    TEXT,

  -- Review workflow
  status             TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'approved', 'rejected', 'pr_created')),
  github_pr_url      TEXT,
  github_branch      TEXT,
  reviewer_notes     TEXT,

  -- Timestamps
  submitted_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at        TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS submissions_status_idx    ON submissions (status);
CREATE INDEX IF NOT EXISTS submissions_farm_type_idx ON submissions (farm_type);
CREATE INDEX IF NOT EXISTS submissions_submitted_idx ON submissions (submitted_at DESC);

-- ============================================================
-- Farm Contacts
-- Phone/email stored here, never committed to the git repo.
-- ============================================================
CREATE TABLE IF NOT EXISTS farm_contacts (
  farm_id    TEXT PRIMARY KEY,
  farm_type  TEXT NOT NULL CHECK (farm_type IN ('coffee', 'tea')),
  phone      TEXT,
  email      TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER farm_contacts_updated_at
  BEFORE UPDATE ON farm_contacts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- Row Level Security
-- All access goes through the publishable (anon) key.
-- ============================================================

-- ── coffee_farms ─────────────────────────────────────────────
ALTER TABLE coffee_farms ENABLE ROW LEVEL SECURITY;

-- Public: read active farms only
CREATE POLICY "anon_select_active_coffee" ON coffee_farms
  FOR SELECT TO anon
  USING (active = true);

-- ── tea_farms ─────────────────────────────────────────────────
ALTER TABLE tea_farms ENABLE ROW LEVEL SECURITY;

-- Public: read active farms only
CREATE POLICY "anon_select_active_tea" ON tea_farms
  FOR SELECT TO anon
  USING (active = true);

-- ── submissions ───────────────────────────────────────────────
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Public: anyone can submit a farm
CREATE POLICY "anon_insert_submissions" ON submissions
  FOR INSERT TO anon
  WITH CHECK (true);

-- Admin (server-side, publishable key): read all submissions
CREATE POLICY "anon_select_submissions" ON submissions
  FOR SELECT TO anon
  USING (true);

-- Admin: update status / reviewer notes
CREATE POLICY "anon_update_submissions" ON submissions
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

-- ── farm_contacts ─────────────────────────────────────────────
ALTER TABLE farm_contacts ENABLE ROW LEVEL SECURITY;

-- Web app: read contacts (after Turnstile verification server-side)
CREATE POLICY "anon_select_farm_contacts" ON farm_contacts
  FOR SELECT TO anon
  USING (true);

-- Admin: create or update contact info
CREATE POLICY "anon_insert_farm_contacts" ON farm_contacts
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "anon_update_farm_contacts" ON farm_contacts
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);
