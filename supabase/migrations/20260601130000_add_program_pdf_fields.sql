-- Add new fields to programs table for the redesigned layout based on the PDF

do $$ begin
  alter table public.programs add column if not exists subtitle text not null default '';
  alter table public.programs add column if not exists location text not null default '';
  alter table public.programs add column if not exists contact_phone text not null default '';
exception when others then null;
end $$;
