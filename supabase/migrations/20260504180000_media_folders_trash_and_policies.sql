-- Media library: folders, soft-delete (recycler), staff-wide update/delete policies.

create table public.media_folders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  parent_id uuid references public.media_folders (id) on delete cascade,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint media_folders_name_nonempty check (char_length(trim(name)) >= 1)
);

create unique index media_folders_root_name_lower on public.media_folders (lower(trim(name)))
  where parent_id is null;

create unique index media_folders_nested_name_lower on public.media_folders (parent_id, lower(trim(name)))
  where parent_id is not null;

create index media_folders_parent_idx on public.media_folders (parent_id);

create or replace function public.media_folders_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger media_folders_updated_at
  before update on public.media_folders
  for each row execute function public.media_folders_set_updated_at();

alter table public.media
  add column if not exists folder_id uuid references public.media_folders (id) on delete restrict,
  add column if not exists deleted_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists media_folder_id_idx on public.media (folder_id)
  where deleted_at is null;

create index if not exists media_deleted_at_idx on public.media (deleted_at)
  where deleted_at is not null;

create or replace function public.media_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists media_updated_at on public.media;

create trigger media_updated_at
  before update on public.media
  for each row execute function public.media_set_updated_at();

alter table public.media_folders enable row level security;

create policy "media_folders: staff all"
  on public.media_folders for all
  using (public.is_authenticated_staff())
  with check (public.is_authenticated_staff());

-- Replace legacy media SELECT so anonymous API cannot enumerate trashed rows.
drop policy if exists "media: public read all" on public.media;

create policy "media: public read active"
  on public.media for select
  to anon
  using (deleted_at is null);

create policy "media: staff select all rows"
  on public.media for select
  using (public.is_authenticated_staff());

drop policy if exists "media: uploader or admin can update" on public.media;

create policy "media: staff update"
  on public.media for update
  using (public.is_authenticated_staff())
  with check (public.is_authenticated_staff());

drop policy if exists "media: admin delete" on public.media;

create policy "media: staff delete"
  on public.media for delete
  using (public.is_authenticated_staff());
