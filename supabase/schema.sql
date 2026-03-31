-- ============================================================
-- Farms Directory — Supabase Schema
-- ============================================================
-- Run this in the Supabase SQL Editor to set up your database.
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- Coffee Farms (source of truth: data/coffee-farms.json)
-- This table mirrors what is in the JSON file committed to git.
-- Records are added automatically when a PR is merged.
-- ============================================================
CREATE TABLE IF NOT EXISTS coffee_farms (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  state         TEXT NOT NULL,
  city          TEXT NOT NULL,
  address       TEXT,
  pincode       TEXT,
  lat           DECIMAL(10, 8),
  lng           DECIMAL(11, 8),
  url           TEXT,
  description   TEXT,
  elevation_meters INTEGER,
  varieties     TEXT[]  DEFAULT '{}',
  processing_methods TEXT[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  active        BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS coffee_farms_state_idx ON coffee_farms (state);
CREATE INDEX IF NOT EXISTS coffee_farms_city_idx  ON coffee_farms (city);
CREATE INDEX IF NOT EXISTS coffee_farms_active_idx ON coffee_farms (active);

-- ============================================================
-- Tea Farms (source of truth: data/tea-farms.json)
-- ============================================================
CREATE TABLE IF NOT EXISTS tea_farms (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  state         TEXT NOT NULL,
  city          TEXT NOT NULL,
  address       TEXT,
  pincode       TEXT,
  lat           DECIMAL(10, 8),
  lng           DECIMAL(11, 8),
  url           TEXT,
  description   TEXT,
  elevation_meters INTEGER,
  tea_types     TEXT[]  DEFAULT '{}',
  processing_methods TEXT[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  active        BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tea_farms_state_idx ON tea_farms (state);
CREATE INDEX IF NOT EXISTS tea_farms_city_idx  ON tea_farms (city);
CREATE INDEX IF NOT EXISTS tea_farms_active_idx ON tea_farms (active);

-- ============================================================
-- Submissions — pending review by admins
-- When approved, the admin panel opens a GitHub PR to add the
-- farm to the relevant JSON data file.
-- ============================================================
CREATE TABLE IF NOT EXISTS submissions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Farm type
  farm_type         TEXT NOT NULL CHECK (farm_type IN ('coffee', 'tea')),

  -- Core fields
  name              TEXT NOT NULL,
  state             TEXT NOT NULL,
  city              TEXT NOT NULL,
  address           TEXT,
  pincode           TEXT,
  url               TEXT,
  description       TEXT,

  -- Geocoded coordinates (fetched via Nominatim on form submit)
  lat               DECIMAL(10, 8),
  lng               DECIMAL(11, 8),

  -- Coffee-specific
  elevation_meters  INTEGER,
  varieties         TEXT[] DEFAULT '{}',    -- Coffee varieties (Arabica, Robusta, etc.)
  processing_methods TEXT[] DEFAULT '{}',   -- Washed, Natural, Honey, etc.
  certifications    TEXT[] DEFAULT '{}',    -- Organic, Fair Trade, RFA, etc.

  -- Tea-specific (reuse varieties column for tea_types when farm_type='tea')
  tea_types         TEXT[] DEFAULT '{}',    -- Green, Black, White, Oolong, etc.

  -- Submission metadata
  submitter_name    TEXT,
  submitter_email   TEXT,
  submitter_notes   TEXT,

  -- Review workflow
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'rejected', 'pr_created')),
  github_pr_url     TEXT,
  github_branch     TEXT,
  reviewer_notes    TEXT,

  -- Timestamps
  submitted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at       TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS submissions_status_idx    ON submissions (status);
CREATE INDEX IF NOT EXISTS submissions_farm_type_idx ON submissions (farm_type);
CREATE INDEX IF NOT EXISTS submissions_submitted_idx ON submissions (submitted_at DESC);

-- ============================================================
-- Farm Contacts — phone/email stored here, never in the JSON repo
-- ============================================================
CREATE TABLE IF NOT EXISTS farm_contacts (
  farm_id     TEXT PRIMARY KEY,
  farm_type   TEXT NOT NULL CHECK (farm_type IN ('coffee', 'tea')),
  phone       TEXT,
  email       TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER farm_contacts_updated_at
  BEFORE UPDATE ON farm_contacts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================

-- Coffee farms: public read, no write from client
ALTER TABLE coffee_farms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_coffee" ON coffee_farms
  FOR SELECT USING (active = true);

-- Tea farms: public read, no write from client
ALTER TABLE tea_farms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_tea" ON tea_farms
  FOR SELECT USING (active = true);

-- Submissions: anyone can insert, only service role can read/update
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_insert_submissions" ON submissions
  FOR INSERT WITH CHECK (true);
-- Admins use the service role key which bypasses RLS.

-- Farm contacts: service role only (no public access)
ALTER TABLE farm_contacts ENABLE ROW LEVEL SECURITY;
-- No public policies — all access via service role key only.

-- ============================================================
-- updated_at trigger helper
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER coffee_farms_updated_at
  BEFORE UPDATE ON coffee_farms
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER tea_farms_updated_at
  BEFORE UPDATE ON tea_farms
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
