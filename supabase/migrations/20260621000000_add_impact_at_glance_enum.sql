-- Add impact_at_glance to section_type enum (standalone — no usage, to avoid PG enum tx issue)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'impact_at_glance'
      AND enumtypid = 'section_type'::regtype
  ) THEN
    ALTER TYPE section_type ADD VALUE 'impact_at_glance';
  END IF;
END$$;
