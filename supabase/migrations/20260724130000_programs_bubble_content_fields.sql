-- Fixed bubble circle content: project period and implementing partner line.

alter table public.programs
  add column if not exists project_period text not null default '',
  add column if not exists carried_by text not null default '';
