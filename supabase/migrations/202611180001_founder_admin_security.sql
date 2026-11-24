-- =========================================================================
-- PHANTOM LABS MIGRATION: 202611180001_founder_admin_security.sql
-- Founder-Only Google OAuth, Strict RLS Policies, Private Storage Bucket,
-- and Server-Only Security Verification RPC.
-- =========================================================================
-- Safe to run multiple times (idempotent).
-- Zero personal emails or credentials are hardcoded in this migration.
-- After applying this migration, run `npm run sync:founder` (or insert your
-- Founder Google email into public.team_members) to bind Founder RLS to FOUNDER_EMAIL.
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. TEAM ACCESS TABLE (SOLE FOUNDER NOW; EXTENSIBLE FOR FUTURE ROLES)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.team_members (
  id text PRIMARY KEY,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('Founder', 'Admin', 'Viewer')),
  status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Invited', 'Revoked')),
  is_primary_founder boolean NOT NULL DEFAULT false,
  invited_by jsonb,
  invited_at timestamp with time zone,
  invite_expires_at timestamp with time zone,
  accepted_at timestamp with time zone,
  last_login_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enforce at most one primary Founder row at the database level
CREATE UNIQUE INDEX IF NOT EXISTS team_members_single_primary_founder_idx
  ON public.team_members (is_primary_founder)
  WHERE is_primary_founder = true;

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Disable any non-Founder accounts while in sole-Founder mode
UPDATE public.team_members
SET status = 'Revoked', updated_at = timezone('utc'::text, now())
WHERE is_primary_founder = false AND status <> 'Revoked';

-- -------------------------------------------------------------------------
-- 2. CENTRALIZED FOUNDER GOOGLE-OAUTH AUTHORIZATION HELPER
--    Requires: authenticated JWT + Google OAuth provider + active primary Founder
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_authorized_founder()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    auth.role() = 'authenticated'
    AND lower(coalesce(auth.jwt() -> 'app_metadata' ->> 'provider', '')) = 'google'
    AND EXISTS (
      SELECT 1
      FROM public.team_members tm
      WHERE lower(tm.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
        AND tm.role = 'Founder'
        AND tm.status = 'Active'
        AND tm.is_primary_founder = true
    );
$$;

REVOKE ALL ON FUNCTION public.is_authorized_founder() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_authorized_founder() TO authenticated;

-- RLS policies for team_members
DROP POLICY IF EXISTS "Founder Can Manage Team Members" ON public.team_members;
DROP POLICY IF EXISTS "Founder Can Read Team Members" ON public.team_members;
DROP POLICY IF EXISTS "Founder Protected Mutations" ON public.team_members;

CREATE POLICY "Founder Can Read Team Members"
  ON public.team_members
  FOR SELECT
  TO authenticated
  USING (public.is_authorized_founder());

CREATE POLICY "Founder Protected Mutations"
  ON public.team_members
  FOR UPDATE
  TO authenticated
  USING (public.is_authorized_founder() AND is_primary_founder = false)
  WITH CHECK (public.is_authorized_founder() AND is_primary_founder = false);

-- -------------------------------------------------------------------------
-- 3. SITE CONTENT TABLE (PUBLIC READ; FOUNDER-ONLY WRITE)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_content (
  id integer PRIMARY KEY DEFAULT 1,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  content jsonb DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.site_content ADD COLUMN IF NOT EXISTS data jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.site_content ADD COLUMN IF NOT EXISTS content jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.site_content ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Drop any legacy overly-permissive policies
DROP POLICY IF EXISTS "Permissive CMS Upsert Access" ON public.site_content;
DROP POLICY IF EXISTS "Authenticated Admin Full Access" ON public.site_content;
DROP POLICY IF EXISTS "Public Read Access" ON public.site_content;
DROP POLICY IF EXISTS "Founder Can Manage Site Content" ON public.site_content;

CREATE POLICY "Public Read Access"
  ON public.site_content
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Founder Can Manage Site Content"
  ON public.site_content
  FOR ALL
  TO authenticated
  USING (public.is_authorized_founder())
  WITH CHECK (public.is_authorized_founder());

INSERT INTO public.site_content (id, data, content, updated_at)
VALUES (1, '{}'::jsonb, '{}'::jsonb, now())
ON CONFLICT (id) DO UPDATE SET updated_at = now();

-- -------------------------------------------------------------------------
-- 4. BOOKING REQUESTS TABLE (STRICT FOUNDER-ONLY RLS)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.booking_requests (
  id text PRIMARY KEY,
  category text NOT NULL,
  kicker text,
  sub_category text,
  contact jsonb NOT NULL DEFAULT '{}'::jsonb,
  schedule jsonb NOT NULL DEFAULT '{}'::jsonb,
  brief jsonb NOT NULL DEFAULT '{}'::jsonb,
  references_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  client_message text,
  budget text DEFAULT 'Bespoke Creative Brief',
  status text NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'In progress', 'Responded', 'Closed')),
  is_read boolean NOT NULL DEFAULT false,
  notes jsonb NOT NULL DEFAULT '[]'::jsonb,
  audit_log jsonb NOT NULL DEFAULT '[]'::jsonb,
  last_edited_by jsonb,
  last_edited_at timestamp with time zone,
  source text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.booking_requests ADD COLUMN IF NOT EXISTS audit_log jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.booking_requests ADD COLUMN IF NOT EXISTS last_edited_by jsonb;
ALTER TABLE public.booking_requests ADD COLUMN IF NOT EXISTS last_edited_at timestamp with time zone;

ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Can Submit Booking Requests" ON public.booking_requests;
DROP POLICY IF EXISTS "Admins Can Manage Booking Requests" ON public.booking_requests;
DROP POLICY IF EXISTS "Team Members Can Read Booking Requests" ON public.booking_requests;
DROP POLICY IF EXISTS "Founder And Admin Can Modify Booking Requests" ON public.booking_requests;
DROP POLICY IF EXISTS "Founder And Admin Can Delete Booking Requests" ON public.booking_requests;
DROP POLICY IF EXISTS "Founder Only Manage Booking Requests" ON public.booking_requests;

-- Public brief submissions are validated and written server-side via POST /api/bookings.
-- Direct database access is restricted strictly to the authorized Google Founder.
CREATE POLICY "Founder Only Manage Booking Requests"
  ON public.booking_requests
  FOR ALL
  TO authenticated
  USING (public.is_authorized_founder())
  WITH CHECK (public.is_authorized_founder());

-- -------------------------------------------------------------------------
-- 5. CLIENTS TABLE (STRICT FOUNDER-ONLY RLS)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.clients (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text,
  phone text,
  organization text,
  status text NOT NULL DEFAULT 'Active',
  notes text,
  source_booking_id text REFERENCES public.booking_requests(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Founder Only Manage Clients" ON public.clients;
CREATE POLICY "Founder Only Manage Clients"
  ON public.clients
  FOR ALL
  TO authenticated
  USING (public.is_authorized_founder())
  WITH CHECK (public.is_authorized_founder());

-- -------------------------------------------------------------------------
-- 6. UPLOADED FILE METADATA TABLE (STRICT FOUNDER-ONLY RLS)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.booking_attachments (
  id text PRIMARY KEY,
  booking_id text REFERENCES public.booking_requests(id) ON DELETE CASCADE,
  storage_path text NOT NULL UNIQUE,
  file_name text NOT NULL,
  mime_type text NOT NULL,
  size_bytes bigint NOT NULL DEFAULT 0,
  uploaded_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.booking_attachments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Founder Only Manage Booking Attachments" ON public.booking_attachments;
CREATE POLICY "Founder Only Manage Booking Attachments"
  ON public.booking_attachments
  FOR ALL
  TO authenticated
  USING (public.is_authorized_founder())
  WITH CHECK (public.is_authorized_founder());

-- -------------------------------------------------------------------------
-- 7. PRIVATE SUPABASE STORAGE BUCKET & FOUNDER-ONLY STORAGE POLICIES
-- -------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('booking-attachments', 'booking-attachments', false, 15728640)
ON CONFLICT (id) DO UPDATE
SET
  public = false,
  file_size_limit = 15728640;

-- Public website photography is served directly by Supabase Storage. The
-- server issues signed upload URLs; the bucket itself has no per-bucket cap.
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('public-media', 'public-media', true, NULL)
ON CONFLICT (id) DO UPDATE
SET
  public = true,
  file_size_limit = NULL;

DROP POLICY IF EXISTS "Founder Can Read Private Booking Attachments" ON storage.objects;
CREATE POLICY "Founder Can Read Private Booking Attachments"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'booking-attachments'
    AND public.is_authorized_founder()
  );

DROP POLICY IF EXISTS "Founder Can Delete Private Booking Attachments" ON storage.objects;
CREATE POLICY "Founder Can Delete Private Booking Attachments"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'booking-attachments'
    AND public.is_authorized_founder()
  );

-- -------------------------------------------------------------------------
-- 8. SERVER-ONLY SECURITY VERIFICATION RPC (SERVICE_ROLE ONLY)
--    Inspects live Postgres system catalogs (pg_class, pg_policies, pg_proc,
--    storage.buckets) to prove tables, RLS, Founder policies, and private
--    storage are genuinely enforced. Returns booleans only (zero PII/secrets).
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.verify_admin_security_state(expected_founder_email text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog, storage
AS $$
DECLARE
  v_tables_exist boolean;
  v_rls_enabled_all boolean;
  v_founder_helper_exists boolean;
  v_policies_present boolean;
  v_no_permissive_policies boolean;
  v_founder_row_synced boolean;
  v_no_other_active_accounts boolean;
  v_bucket_private boolean;
  v_public_media_ready boolean;
  v_storage_rls_ready boolean;
BEGIN
  -- 1. All 5 required tables exist in public schema
  SELECT count(*) = 5 INTO v_tables_exist
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relkind = 'r'
    AND c.relname IN ('team_members', 'booking_requests', 'clients', 'booking_attachments', 'site_content');

  -- 2. Row Level Security is ACTUALLY enabled on all 5 tables
  SELECT count(*) = 5 INTO v_rls_enabled_all
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relkind = 'r'
    AND c.relrowsecurity = true
    AND c.relname IN ('team_members', 'booking_requests', 'clients', 'booking_attachments', 'site_content');

  -- 3. public.is_authorized_founder() helper exists
  SELECT EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'is_authorized_founder'
  ) INTO v_founder_helper_exists;

  -- 4. Founder-only policies exist on all 5 tables
  SELECT (
    EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'team_members' AND policyname = 'Founder Can Read Team Members')
    AND EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'booking_requests' AND policyname = 'Founder Only Manage Booking Requests')
    AND EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'clients' AND policyname = 'Founder Only Manage Clients')
    AND EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'booking_attachments' AND policyname = 'Founder Only Manage Booking Attachments')
    AND EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'site_content' AND policyname = 'Founder Can Manage Site Content')
  ) INTO v_policies_present;

  -- 5. Confirm legacy permissive policies are NOT present
  SELECT NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND policyname IN (
        'Permissive CMS Upsert Access',
        'Authenticated Admin Full Access',
        'Public Can Submit Booking Requests'
      )
  ) INTO v_no_permissive_policies;

  -- 6. Primary Founder row exists, is Active, and matches server FOUNDER_EMAIL
  SELECT EXISTS (
    SELECT 1
    FROM public.team_members tm
    WHERE lower(tm.email) = lower(coalesce(expected_founder_email, ''))
      AND tm.role = 'Founder'
      AND tm.status = 'Active'
      AND tm.is_primary_founder = true
  ) INTO v_founder_row_synced;

  -- 7. No other active accounts exist while in Founder-only mode
  SELECT NOT EXISTS (
    SELECT 1
    FROM public.team_members tm
    WHERE tm.is_primary_founder = false
      AND tm.status = 'Active'
  ) INTO v_no_other_active_accounts;

  -- 8. Private Storage bucket 'booking-attachments' exists with public = false
  SELECT EXISTS (
    SELECT 1
    FROM storage.buckets b
    WHERE b.id = 'booking-attachments'
      AND b.public = false
  ) INTO v_bucket_private;

  -- 9. Public website media bucket exists for originals and CMS image sync
  SELECT EXISTS (
    SELECT 1
    FROM storage.buckets b
    WHERE b.id = 'public-media'
      AND b.public = true
  ) INTO v_public_media_ready;

  -- 10. storage.objects has RLS enabled and Founder-only bucket policy exists
  SELECT (
    EXISTS (
      SELECT 1
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'storage'
        AND c.relname = 'objects'
        AND c.relrowsecurity = true
    )
    AND EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'storage'
        AND tablename = 'objects'
        AND policyname = 'Founder Can Read Private Booking Attachments'
    )
  ) INTO v_storage_rls_ready;

  RETURN jsonb_build_object(
    'tables_exist', v_tables_exist,
    'rls_enabled_all', v_rls_enabled_all,
    'founder_helper_exists', v_founder_helper_exists,
    'policies_present', v_policies_present,
    'no_permissive_policies', v_no_permissive_policies,
    'founder_row_synced', v_founder_row_synced,
    'no_other_active_accounts', v_no_other_active_accounts,
    'bucket_private', v_bucket_private,
    'public_media_ready', v_public_media_ready,
    'storage_rls_ready', v_storage_rls_ready
  );
END;
$$;

REVOKE ALL ON FUNCTION public.verify_admin_security_state(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.verify_admin_security_state(text) FROM anon;
REVOKE ALL ON FUNCTION public.verify_admin_security_state(text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.verify_admin_security_state(text) TO service_role;

-- -------------------------------------------------------------------------
-- 9. REFRESH POSTGREST SCHEMA CACHE
-- -------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';

-- Keep live CMS changes visible immediately to subscribed local and production
-- clients. Add the table only when it is not already in the publication.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
    AND NOT EXISTS (
      SELECT 1
      FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'site_content'
    ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.site_content';
  END IF;
END
$$;
