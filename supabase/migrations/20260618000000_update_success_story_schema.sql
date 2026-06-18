-- Adds custom field schema to success stories to support the legacy "outcome" ribbon

UPDATE public.publication_categories
SET field_schema = jsonb_build_array(
  jsonb_build_object(
    'key', 'outcome',
    'label', 'Outcome / Result',
    'type', 'text',
    'required', false,
    'helper', 'Short text shown on the card with a trend arrow (e.g. "Started a self-sustaining business").'
  )
)
WHERE slug = 'success_story';
