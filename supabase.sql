-- ============================================================
-- Online-Coach Supabase schema (RUNNABLE — paste in SQL Editor)
-- ============================================================
-- What this fixes vs the old context-only dump:
--  1. `coach.stats / certifications / ...` used bare `ARRAY`
--     (invalid SQL) -> now JSONB.
--  2. `packages.price` / `supplements.price` were DOUBLE PRECISION
--     but the site uses strings like '1500 EGP' -> now TEXT.
--  3. `packages.features` was TEXT (array came back as a string)
--     -> now JSONB arrays.
--  4. Missing `transformations` table (client results) -> added.
--  5. `users` had a composite PK (id, username, email) -> fixed.
--  6. No RLS policies -> added public read + anon write so the
--     frontend admin dashboard + seeder work with the publishable key.
--
-- HOW TO USE:
--  1. Supabase Dashboard -> SQL Editor -> paste this whole file -> Run.
--  2. Then run the seeder:  npm run seed
--     (reads src/data/site.json and pushes it into these tables)
-- ============================================================

-- ---------- users (optional / future auth) ----------
CREATE TABLE IF NOT EXISTS public.users (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  name varchar NOT NULL,
  username varchar NOT NULL UNIQUE,
  password varchar NOT NULL,
  email varchar NOT NULL UNIQUE,
  is_admin boolean NOT NULL DEFAULT false
);

-- ---------- coach (single-row table) ----------
CREATE TABLE IF NOT EXISTS public.coach (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  name text,
  name_ar text,
  "firstName" text,
  "firstName_ar" text,
  title text,
  title_ar text,
  tagline text,
  tagline_ar text,
  location text,
  location_ar text,
  avatar text,
  cover text,
  bio text,
  bio_ar text,
  "whatsappNumber" text,
  "whatsappDisplay" text,
  stats jsonb NOT NULL DEFAULT '[]'::jsonb,
  certifications jsonb NOT NULL DEFAULT '[]'::jsonb,
  certifications_ar jsonb NOT NULL DEFAULT '[]'::jsonb,
  specializations jsonb NOT NULL DEFAULT '[]'::jsonb,
  specializations_ar jsonb NOT NULL DEFAULT '[]'::jsonb,
  approach jsonb NOT NULL DEFAULT '[]'::jsonb
);

-- ---------- packages ----------
CREATE TABLE IF NOT EXISTS public.packages (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  name_ar text NOT NULL DEFAULT '',
  price text NOT NULL DEFAULT '',
  period text NOT NULL DEFAULT '/month',
  period_ar text NOT NULL DEFAULT '/شهر',
  tag text,
  tag_ar text,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  features_ar jsonb NOT NULL DEFAULT '[]'::jsonb,
  "whatsappText" text,
  "whatsappText_ar" text,
  highlight boolean NOT NULL DEFAULT false
);

-- ---------- transformations (client results / before-after) ----------
CREATE TABLE IF NOT EXISTS public.transformations (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  name_ar text,
  result text NOT NULL DEFAULT '',
  result_ar text,
  goal text,
  goal_ar text,
  image text,
  text text,
  text_ar text
);

-- ---------- testimonials ----------
CREATE TABLE IF NOT EXISTS public.testimonials (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  name_ar text,
  role text NOT NULL DEFAULT 'Client',
  role_ar text NOT NULL DEFAULT 'عميل',
  avatar text NOT NULL DEFAULT 'https://i.pravatar.cc/100?img=11',
  text text NOT NULL,
  text_ar text NOT NULL DEFAULT ''
);

-- ---------- services ----------
CREATE TABLE IF NOT EXISTS public.services (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  title text NOT NULL,
  title_ar text NOT NULL DEFAULT '',
  "desc" text NOT NULL DEFAULT '',
  desc_ar text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'flame'
);

-- ---------- supplements ----------
CREATE TABLE IF NOT EXISTS public.supplements (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  name_ar text NOT NULL DEFAULT '',
  price text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  category_ar text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  description_ar text NOT NULL DEFAULT '',
  image text NOT NULL DEFAULT ''
);

-- ---------- blogs (articles / tips) ----------
CREATE TABLE IF NOT EXISTS public.blogs (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  title_ar text NOT NULL DEFAULT '',
  excerpt text NOT NULL DEFAULT '',
  excerpt_ar text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  content_ar text NOT NULL DEFAULT '',
  cover text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  category_ar text NOT NULL DEFAULT '',
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  published boolean NOT NULL DEFAULT true,
  featured boolean NOT NULL DEFAULT false
);

-- ============================================================
-- MIGRATION: fix old column types from the first schema dump.
-- Safe to run on empty tables AND on tables with data.
-- ============================================================

-- packages.price: double precision -> text
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='packages'
      AND column_name='price' AND data_type='double precision'
  ) THEN
    ALTER TABLE public.packages ALTER COLUMN price TYPE text USING price::text;
  END IF;
END $$;

-- supplements.price: double precision -> text
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='supplements'
      AND column_name='price' AND data_type='double precision'
  ) THEN
    ALTER TABLE public.supplements ALTER COLUMN price TYPE text USING price::text;
  END IF;
END $$;

-- packages.features: text -> jsonb (stringify plain text into arrays)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='packages'
      AND column_name='features' AND data_type='text'
  ) THEN
    ALTER TABLE public.packages ALTER COLUMN features TYPE jsonb USING
      CASE
        WHEN features IS NULL OR btrim(features) = '' THEN '[]'::jsonb
        WHEN btrim(features) LIKE '[%' THEN features::jsonb
        ELSE to_jsonb(string_to_array(features, E'\n'))
      END;
    ALTER TABLE public.packages ALTER COLUMN features SET DEFAULT '[]'::jsonb;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='packages'
      AND column_name='features_ar' AND data_type='text'
  ) THEN
    ALTER TABLE public.packages ALTER COLUMN features_ar TYPE jsonb USING
      CASE
        WHEN features_ar IS NULL OR btrim(features_ar) = '' THEN '[]'::jsonb
        WHEN btrim(features_ar) LIKE '[%' THEN features_ar::jsonb
        ELSE to_jsonb(string_to_array(features_ar, E'\n'))
      END;
    ALTER TABLE public.packages ALTER COLUMN features_ar SET DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- users: composite PK (id, username, email) -> single PK on id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema='public' AND table_name='users'
      AND constraint_name='users_pkey'
  ) THEN
    -- only rebuild if the PK covers more than just id
    IF (SELECT count(*) FROM information_schema.key_column_usage
        WHERE table_schema='public' AND table_name='users'
          AND constraint_name='users_pkey') > 1 THEN
      ALTER TABLE public.users DROP CONSTRAINT users_pkey;
      ALTER TABLE public.users ADD CONSTRAINT users_pkey PRIMARY KEY (id);
      ALTER TABLE public.users ADD CONSTRAINT users_username_key UNIQUE (username);
      ALTER TABLE public.users ADD CONSTRAINT users_email_key UNIQUE (email);
    END IF;
  END IF;
EXCEPTION WHEN others THEN
  -- constraints may already exist with different names; ignore
  NULL;
END $$;

-- Ensure new columns exist if the tables were created by the old dump
ALTER TABLE public.coach      ADD COLUMN IF NOT EXISTS name_ar text;
ALTER TABLE public.coach      ADD COLUMN IF NOT EXISTS "firstName" text;
ALTER TABLE public.coach      ADD COLUMN IF NOT EXISTS "firstName_ar" text;
ALTER TABLE public.coach      ADD COLUMN IF NOT EXISTS title_ar text;
ALTER TABLE public.coach      ADD COLUMN IF NOT EXISTS tagline_ar text;
ALTER TABLE public.coach      ADD COLUMN IF NOT EXISTS location_ar text;
ALTER TABLE public.coach      ADD COLUMN IF NOT EXISTS bio_ar text;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS name_ar text;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS role_ar text DEFAULT 'عميل';
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS text_ar text DEFAULT '';
ALTER TABLE public.services   ADD COLUMN IF NOT EXISTS title_ar text DEFAULT '';
ALTER TABLE public.services   ADD COLUMN IF NOT EXISTS desc_ar text DEFAULT '';
ALTER TABLE public.packages   ADD COLUMN IF NOT EXISTS name_ar text DEFAULT '';
ALTER TABLE public.packages   ADD COLUMN IF NOT EXISTS period_ar text DEFAULT '/شهر';
ALTER TABLE public.packages   ADD COLUMN IF NOT EXISTS tag_ar text;
ALTER TABLE public.packages   ADD COLUMN IF NOT EXISTS "whatsappText_ar" text;
ALTER TABLE public.supplements ADD COLUMN IF NOT EXISTS name_ar text DEFAULT '';
ALTER TABLE public.supplements ADD COLUMN IF NOT EXISTS category_ar text DEFAULT '';
ALTER TABLE public.supplements ADD COLUMN IF NOT EXISTS description_ar text DEFAULT '';
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS title_ar text DEFAULT '';
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS excerpt text DEFAULT '';
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS excerpt_ar text DEFAULT '';
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS content text DEFAULT '';
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS content_ar text DEFAULT '';
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS cover text DEFAULT '';
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS category text DEFAULT '';
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS category_ar text DEFAULT '';
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS tags jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS published boolean DEFAULT true;
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false;
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- ============================================================
-- RLS: public site needs read access; the frontend-only admin
-- dashboard writes with the publishable (anon) key, so allow
-- anon insert/update/delete. Tighten later when you add auth.
-- ============================================================
ALTER TABLE public.users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transformations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplements     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs           ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read" ON public.users;
DROP POLICY IF EXISTS "Public read" ON public.coach;
DROP POLICY IF EXISTS "Public read" ON public.packages;
DROP POLICY IF EXISTS "Public read" ON public.transformations;
DROP POLICY IF EXISTS "Public read" ON public.testimonials;
DROP POLICY IF EXISTS "Public read" ON public.services;
DROP POLICY IF EXISTS "Public read" ON public.supplements;
DROP POLICY IF EXISTS "Public read" ON public.blogs;

CREATE POLICY "Public read" ON public.users           FOR SELECT USING (true);
CREATE POLICY "Public read" ON public.coach           FOR SELECT USING (true);
CREATE POLICY "Public read" ON public.packages        FOR SELECT USING (true);
CREATE POLICY "Public read" ON public.transformations FOR SELECT USING (true);
CREATE POLICY "Public read" ON public.testimonials    FOR SELECT USING (true);
CREATE POLICY "Public read" ON public.services        FOR SELECT USING (true);
CREATE POLICY "Public read" ON public.supplements     FOR SELECT USING (true);
CREATE POLICY "Public read" ON public.blogs           FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public write" ON public.users;
DROP POLICY IF EXISTS "Public write" ON public.coach;
DROP POLICY IF EXISTS "Public write" ON public.packages;
DROP POLICY IF EXISTS "Public write" ON public.transformations;
DROP POLICY IF EXISTS "Public write" ON public.testimonials;
DROP POLICY IF EXISTS "Public write" ON public.services;
DROP POLICY IF EXISTS "Public write" ON public.supplements;
DROP POLICY IF EXISTS "Public write" ON public.blogs;

CREATE POLICY "Public write" ON public.users           FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public write" ON public.coach           FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public write" ON public.packages        FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public write" ON public.transformations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public write" ON public.testimonials    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public write" ON public.services        FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public write" ON public.supplements     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public write" ON public.blogs           FOR ALL USING (true) WITH CHECK (true);

-- Helpful ordering indexes
CREATE INDEX IF NOT EXISTS packages_created_idx        ON public.packages (created_at);
CREATE INDEX IF NOT EXISTS transformations_created_idx ON public.transformations (created_at);
CREATE INDEX IF NOT EXISTS testimonials_created_idx   ON public.testimonials (created_at);
CREATE INDEX IF NOT EXISTS services_created_idx       ON public.services (created_at);
CREATE INDEX IF NOT EXISTS supplements_created_idx    ON public.supplements (created_at);
CREATE INDEX IF NOT EXISTS blogs_created_idx          ON public.blogs (created_at);
CREATE INDEX IF NOT EXISTS blogs_slug_idx             ON public.blogs (slug);

-- ============================================================
-- ADMIN AUTH (dashboard login + change password)
-- Passwords are stored as SHA-256 hex (64 chars), hashed in the
-- browser — the server never sees plaintext. Login and password
-- changes go through SECURITY DEFINER functions, so the users
-- table itself is locked down (no public read/write policies).
-- Re-running this block is safe: it never resets an existing
-- admin password (ON CONFLICT DO NOTHING below).
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Lock the users table: only the RPC functions below may touch it.
DROP POLICY IF EXISTS "Public read" ON public.users;
DROP POLICY IF EXISTS "Public write" ON public.users;

-- Verify admin credentials. Returns true only for is_admin accounts.
CREATE OR REPLACE FUNCTION public.verify_admin(p_username text, p_password_hash text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE username = p_username
      AND password = p_password_hash
      AND is_admin = true
  );
$$;

-- Change an admin password (verifies the old hash first).
-- Returns true on success, false when the old password is wrong.
CREATE OR REPLACE FUNCTION public.change_admin_password(p_username text, p_old_hash text, p_new_hash text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- new value must look like a SHA-256 hex digest (never plaintext)
  IF p_new_hash IS NULL OR p_new_hash !~ '^[0-9a-f]{64}$' THEN
    RETURN false;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.users
    WHERE username = p_username
      AND password = p_old_hash
      AND is_admin = true
  ) THEN
    RETURN false;
  END IF;
  UPDATE public.users SET password = p_new_hash WHERE username = p_username;
  RETURN true;
END;
$$;

-- The dashboard login calls these with the publishable (anon) key.
GRANT EXECUTE ON FUNCTION public.verify_admin(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.change_admin_password(text, text, text) TO anon, authenticated;

-- Default admin (username: admin / password: elsum123).
-- DO NOTHING on conflict: re-running this file never overwrites
-- a password you changed from the dashboard.
INSERT INTO public.users (name, username, password, email, is_admin)
VALUES (
  'Site Admin',
  'admin',
  encode(digest('elsum123', 'sha256'), 'hex'),
  'admin@example.com',
  true
)
ON CONFLICT (username) DO NOTHING;
