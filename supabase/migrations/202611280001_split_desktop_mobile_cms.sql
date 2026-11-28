-- Split CMS storage by device while keeping the existing site_content table.
-- Row 1 remains the desktop document. Row 2 stores mobile overrides only.
BEGIN;

INSERT INTO public.site_content (id, data, content, updated_at)
SELECT 2, COALESCE(data->'mobileContent', '{}'::jsonb), '{}'::jsonb, now()
FROM public.site_content
WHERE id = 1 AND jsonb_typeof(data->'mobileContent') = 'object'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.site_content (id, data, content, updated_at)
VALUES (2, '{}'::jsonb, '{}'::jsonb, now())
ON CONFLICT (id) DO NOTHING;

UPDATE public.site_content
SET data = data - 'mobileContent', updated_at = now()
WHERE id = 1 AND data ? 'mobileContent';

COMMIT;
