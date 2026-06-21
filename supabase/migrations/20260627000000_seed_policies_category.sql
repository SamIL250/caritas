-- Seed Policies category (uses 'file' kind)

insert into public.publication_categories
  (slug, label, plural_label, description, icon, accent, kind, behavior, field_schema, is_system, sort_order)
values
  (
    'policies',
    'Policy',
    'Policies',
    'Repository for Caritas policy documents. Upload policy files for public download.',
    'fa-solid fa-file-lines',
    '#8B4513',
    'file'::public.publication_category_kind,
    '{}'::jsonb,
    '[]'::jsonb,
    true,
    50
  );
