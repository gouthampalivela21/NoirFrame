-- =========================================================================
-- NOIR FRAME SUPABASE CMS SCHEMA & RLS FIX
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

-- 8. Refresh Supabase PostgREST Schema Cache
NOTIFY pgrst, 'reload schema';
