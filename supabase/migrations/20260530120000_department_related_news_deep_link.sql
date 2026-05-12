-- News rows in get_department_related_content: expose slug as link_anchor for /news#story-{slug} deep links.

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
      NULLIF(trim(n.slug), '') AS link_anchor,
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

COMMENT ON FUNCTION public.get_department_related_content(uuid, uuid, uuid, uuid, integer, text[]) IS
  'Published news, programs, and selected publication types sharing a program pillar. News rows include slug in link_anchor for /news deep linking.';
