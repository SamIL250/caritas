-- Add 'file' kind to publication_category_kind enum
-- (must be alone in its migration — ALTER TYPE ADD VALUE cannot share a transaction
--  with statements that reference the new value)

alter type public.publication_category_kind add value 'file';
