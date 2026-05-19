-- Assign missing department_id values for publications of category 'success_story'
-- 2026-05-18
--
-- Strategy:
-- 1) Set department_id when publication.tag_label exactly matches a program_categories.label (case-insensitive).
-- 2) Apply simple heuristics mapping common tag_label tokens to known pillar slugs.
-- Only targets publications whose publication_category slug = 'success_story' to avoid accidental reassignments.

-- 1) Exact label match (case-insensitive)
UPDATE public.publications p
SET department_id = pc.id
FROM public.program_categories pc,
     public.publication_categories pcat
WHERE p.department_id IS NULL
  AND p.category_id = pcat.id
  AND pcat.slug = 'success_story'
  AND NULLIF(trim(p.tag_label), '') IS NOT NULL
  AND lower(trim(p.tag_label)) = lower(trim(pc.label));

-- 2) Heuristic token mapping for common tag_label values
-- Map tokens like 'health', 'development', 'social', 'finance' to the appropriate pillar
UPDATE public.publications p
SET department_id = pc.id
FROM public.program_categories pc,
     public.publication_categories pcat
WHERE p.department_id IS NULL
  AND p.category_id = pcat.id
  AND pcat.slug = 'success_story'
  AND (
    (lower(p.tag_label) LIKE '%health%' AND pc.slug = 'health') OR
    (lower(p.tag_label) LIKE '%develop%' AND pc.slug = 'development') OR
    (lower(p.tag_label) LIKE '%social%' AND pc.slug = 'social-welfare') OR
    (lower(p.tag_label) LIKE '%finance%' AND pc.slug = 'finance-administration')
  );

-- 3) OPTIONAL: manual fixes may still be required for remaining rows. List remaining success_story rows without department_id
-- SELECT p.id, p.title, p.slug, p.tag_label FROM public.publications p
-- JOIN public.publication_categories pc ON pc.id = p.category_id
-- WHERE pc.slug = 'success_story' AND p.department_id IS NULL;
