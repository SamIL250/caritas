-- Link news + publications to program pillars (program_categories).
-- Enables cross-listing on the site and get_department_related_content() for hubs / future detail pages.

ALTER TABLE public.news_articles
  ADD COLUMN IF NOT EXISTS department_id uuid REFERENCES public.program_categories (id) ON DELETE SET NULL;

ALTER TABLE public.publications
  ADD COLUMN IF NOT EXISTS department_id uuid REFERENCES public.program_categories (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS news_articles_department_status_pub_idx
  ON public.news_articles (department_id, status, published_at DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS publications_department_status_pub_idx
  ON public.publications (department_id, status, published_at DESC NULLS LAST);

-- Map legacy newsArticle enum → pillar slug (international → NULL / HQ-wide)
UPDATE public.news_articles AS n
SET department_id = pc.id
FROM public.program_categories AS pc
WHERE n.department_id IS NULL
  AND (
    (n.category::text = 'development' AND pc.slug = 'development')
    OR (n.category::text = 'health' AND pc.slug = 'health')
    OR (n.category::text = 'social' AND pc.slug = 'social-welfare')
    OR (n.category::text = 'organizational' AND pc.slug = 'finance-administration')
  );

-- Optional: infer publications pillar from tag_label when it matches a pillar label
UPDATE public.publications AS p
SET department_id = pc.id
FROM public.program_categories AS pc
WHERE p.department_id IS NULL
  AND NULLIF(trim(p.tag_label), '') IS NOT NULL
  AND lower(trim(p.tag_label)) = lower(trim(pc.label));

DROP FUNCTION IF EXISTS public.get_department_related_content(uuid, uuid, uuid, uuid, integer, text[]);

CREATE OR REPLACE FUNCTION public.get_department_related_content(
  p_department_id uuid,
  p_exclude_news_id uuid DEFAULT NULL,
  p_exclude_program_id uuid DEFAULT NULL,
  p_exclude_publication_id uuid DEFAULT NULL,
  p_limit integer DEFAULT 18,
  p_publication_category_slugs text[] DEFAULT ARRAY['success_story', 'recent_update']::text[]
)
RETURNS TABLE (
  source_kind text,
  entity_id uuid,
  title text,
  slug text,
  excerpt text,
  thumb_url text,
  published_at timestamptz,
  link_external text,
  link_path text,
  link_anchor text,
  meta_label text
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT *
  FROM (
    SELECT
      'news'::text AS source_kind,
      n.id AS entity_id,
      n.title,
      n.slug,
      n.excerpt,
      NULLIF(trim(n.image_url), '') AS thumb_url,
      n.published_at,
      NULLIF(trim(n.external_url), '') AS link_external,
      '/news'::text AS link_path,
      NULL::text AS link_anchor,
      n.category::text AS meta_label
    FROM public.news_articles AS n
    WHERE n.status = 'published'::news_article_status
      AND n.department_id = p_department_id
      AND (p_exclude_news_id IS NULL OR n.id <> p_exclude_news_id)

    UNION ALL

    SELECT
      'program'::text,
      p.id,
      p.title,
      p.slug,
      p.excerpt,
      NULLIF(trim(p.cover_image_url), ''),
      p.published_at,
      NULLIF(trim(p.external_url), ''),
      '/programs/' || p.slug,
      NULL::text,
      p.category
    FROM public.programs AS p
    WHERE p.status = 'published'::program_status
      AND p.category_id = p_department_id
      AND (p_exclude_program_id IS NULL OR p.id <> p_exclude_program_id)

    UNION ALL

    SELECT
      'publication'::text,
      pub.id,
      pub.title,
      pub.slug,
      pub.excerpt,
      NULLIF(trim(pub.cover_image_url), ''),
      pub.published_at,
      NULLIF(trim(pub.external_url), ''),
      '/publications'::text,
      NULLIF(trim(pc.behavior->>'site_anchor'), ''),
      pc.slug
    FROM public.publications AS pub
    INNER JOIN public.publication_categories AS pc ON pc.id = pub.category_id
    WHERE pub.status = 'published'::publication_status
      AND pub.department_id = p_department_id
      AND (p_exclude_publication_id IS NULL OR pub.id <> p_exclude_publication_id)
      AND pc.slug = ANY (p_publication_category_slugs)
  ) AS sub
  ORDER BY published_at DESC NULLS LAST
  LIMIT p_limit;
$$;

COMMENT ON FUNCTION public.get_department_related_content IS
  'Published news, programs, and selected publication types sharing a program pillar (department).';

GRANT EXECUTE ON FUNCTION public.get_department_related_content(uuid, uuid, uuid, uuid, integer, text[])
  TO anon;
GRANT EXECUTE ON FUNCTION public.get_department_related_content(uuid, uuid, uuid, uuid, integer, text[])
  TO authenticated;
