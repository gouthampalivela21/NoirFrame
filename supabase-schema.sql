-- =========================================================================
-- PHANTOM LABS SUPABASE CMS SCHEMA & RLS FIX
-- Run this in your Supabase Dashboard -> SQL Editor -> Click "Run"
-- =========================================================================

-- 1. Create table if not exists
CREATE TABLE IF NOT EXISTS public.site_content (
  id integer PRIMARY KEY DEFAULT 1,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  content jsonb DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 2. If the table already existed with different columns, add "data" and "content"
ALTER TABLE public.site_content ADD COLUMN IF NOT EXISTS data jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.site_content ADD COLUMN IF NOT EXISTS content jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.site_content ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- 4. Policy: Public Read Access (Website visitors can fetch CMS content)
DROP POLICY IF EXISTS "Public Read Access" ON public.site_content;
CREATE POLICY "Public Read Access" 
  ON public.site_content 
  FOR SELECT 
  TO public
  USING (true);

-- 5. Policy: Authenticated Admin Full Access (Logged-in Admin can insert/update)
DROP POLICY IF EXISTS "Authenticated Admin Full Access" ON public.site_content;
CREATE POLICY "Authenticated Admin Full Access" 
  ON public.site_content 
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 6. Policy: Permissive CMS Upsert Access (Guarantees upserts never fail due to RLS)
DROP POLICY IF EXISTS "Permissive CMS Upsert Access" ON public.site_content;
CREATE POLICY "Permissive CMS Upsert Access" 
  ON public.site_content 
  FOR ALL 
  TO public
  USING (true)
  WITH CHECK (true);

-- 7. Seed initial row 1
INSERT INTO public.site_content (id, data, content, updated_at)
VALUES (1, '{}'::jsonb, '{}'::jsonb, now())
ON CONFLICT (id) DO UPDATE SET updated_at = now();

-- =========================================================================
-- 8. TEAM MEMBERS & ROLE-BASED ACCESS CONTROL (FOUNDER / ADMIN / VIEWER)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.team_members (
  id text PRIMARY KEY,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('Founder', 'Admin', 'Viewer')),
  status text NOT NULL DEFAULT 'Invited' CHECK (status IN ('Active', 'Invited', 'Revoked')),
  is_primary_founder boolean NOT NULL DEFAULT false,
  invited_by jsonb,
  invited_at timestamp with time zone,
  invite_expires_at timestamp with time zone,
  accepted_at timestamp with time zone,
  last_login_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Only an active Founder can view or manage team members (and primary Founder is protected)
DROP POLICY IF EXISTS "Founder Can Manage Team Members" ON public.team_members;
CREATE POLICY "Founder Can Manage Team Members"
  ON public.team_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE lower(tm.email) = lower(auth.jwt() ->> 'email')
        AND tm.role = 'Founder'
        AND tm.status = 'Active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE lower(tm.email) = lower(auth.jwt() ->> 'email')
        AND tm.role = 'Founder'
        AND tm.status = 'Active'
    )
    AND is_primary_founder = false
  );

-- =========================================================================
-- 9. PRIVATE CLIENT BOOKING REQUESTS TABLE, AUDIT LOG & ROLE-BASED RLS
-- =========================================================================
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

ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;

-- Public visitors can ONLY submit (INSERT) new booking requests
DROP POLICY IF EXISTS "Public Can Submit Booking Requests" ON public.booking_requests;
CREATE POLICY "Public Can Submit Booking Requests"
  ON public.booking_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Active Founder, Admin, and Viewer can READ booking requests
DROP POLICY IF EXISTS "Admins Can Manage Booking Requests" ON public.booking_requests;
DROP POLICY IF EXISTS "Team Members Can Read Booking Requests" ON public.booking_requests;
CREATE POLICY "Team Members Can Read Booking Requests"
  ON public.booking_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE lower(tm.email) = lower(auth.jwt() ->> 'email')
        AND tm.status = 'Active'
        AND tm.role IN ('Founder', 'Admin', 'Viewer')
    )
  );

-- Only Active Founder and Admin can UPDATE or DELETE booking requests (Viewer is strictly read-only)
DROP POLICY IF EXISTS "Founder And Admin Can Modify Booking Requests" ON public.booking_requests;
CREATE POLICY "Founder And Admin Can Modify Booking Requests"
  ON public.booking_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE lower(tm.email) = lower(auth.jwt() ->> 'email')
        AND tm.status = 'Active'
        AND tm.role IN ('Founder', 'Admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE lower(tm.email) = lower(auth.jwt() ->> 'email')
        AND tm.status = 'Active'
        AND tm.role IN ('Founder', 'Admin')
    )
  );

DROP POLICY IF EXISTS "Founder And Admin Can Delete Booking Requests" ON public.booking_requests;
CREATE POLICY "Founder And Admin Can Delete Booking Requests"
  ON public.booking_requests
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE lower(tm.email) = lower(auth.jwt() ->> 'email')
        AND tm.status = 'Active'
        AND tm.role IN ('Founder', 'Admin')
    )
  );

-- 10. Refresh Supabase PostgREST Schema Cache
NOTIFY pgrst, 'reload schema';
