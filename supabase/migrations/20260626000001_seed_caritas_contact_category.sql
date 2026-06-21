-- Seed Caritas Contact category (uses 'file' kind added by previous migration)

insert into public.publication_categories
  (slug, label, plural_label, description, icon, accent, kind, behavior, field_schema, is_system, sort_order)
values
  (
    'caritas_contact',
    'Caritas Contact',
    'Caritas Contact',
    'File repository for the Caritas Contact publication series. Upload files for public download.',
    'fa-solid fa-download',
    '#1a5276',
    'file'::public.publication_category_kind,
    '{}'::jsonb,
    '[]'::jsonb,
    true,
    45
  );
