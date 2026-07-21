-- Testimonies: standalone content shown under Publications (not a publication category).

create type public.testimony_status as enum ('draft', 'published');

create table public.testimonies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null,
  excerpt text not null default '',
  body text not null default '',
  cover_image_url text not null default '',
  cover_image_alt text not null default '',
  status public.testimony_status not null default 'draft',
  published_at timestamptz,
  sort_order int not null default 0,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint testimonies_slug_unique unique (slug)
);

create index testimonies_status_sort_idx
  on public.testimonies (status, sort_order, published_at desc nulls last);

create or replace function public.testimonies_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger testimonies_updated_at
  before update on public.testimonies
  for each row execute function public.testimonies_set_updated_at();

alter table public.testimonies enable row level security;

create policy "testimonies_select_published"
  on public.testimonies
  for select
  using (status = 'published'::public.testimony_status);

create policy "testimonies_staff_all"
  on public.testimonies
  for all
  using (public.is_authenticated_staff())
  with check (public.is_authenticated_staff());

-- Seed starter testimonies (published) for /publications#testimonies
insert into public.testimonies (
  title,
  slug,
  excerpt,
  body,
  cover_image_url,
  status,
  published_at,
  sort_order
)
values
  (
    'From Despair to Dignity: Yvette''s Inspiring Journey',
    'from-despair-to-dignity-yvettes-inspiring-journey',
    'A young woman in the welding sector shares how vocational training and Caritas support restored her confidence and livelihood.',
    '<p>In Butamwa Vocational Training Center, Yvette discovered welding — a trade that gave her skills, income, and renewed hope. With guidance from Caritas Kigali, she moved from uncertainty to dignified work that supports her family.</p><p>Her story reflects how targeted vocational support helps young people build sustainable futures across Rwanda.</p>',
    '/img/bg_1.webp',
    'published'::public.testimony_status,
    now() - interval '90 days',
    10
  ),
  (
    'How Savings Sparked a Shoemaking Dream',
    'how-savings-sparked-a-shoemaking-dream',
    'In Zinga Cell, Munyaga Sector, Rwamagana District, savings groups helped turn a small idea into a thriving shoemaking enterprise.',
    '<p>Through the Gera Ku Ntego Youth Project, members learned to save consistently and invest in tools and materials. What began as shared learning became a cooperative shoemaking venture serving the local community.</p><p>Watch how disciplined saving, peer support, and entrepreneurship opened a path to self-reliance.</p>',
    '/img/bg_2.webp',
    'published'::public.testimony_status,
    now() - interval '60 days',
    20
  ),
  (
    'From Small Savings to Big Dreams: The Success Story of Duterimbere Rubyiruko Group',
    'from-small-savings-to-big-dreams-duterimbere-rubyiruko-group',
    'The Terimbere Rubyiruko group in Ngoma District shows how youth empowerment and agriculture investments create lasting rural change.',
    '<p>Starting with modest savings, the group invested in cabbages, onions, and potatoes — crops that now sustain households and strengthen community resilience.</p><p>The story of Terimbere Rubyiruko demonstrates how youth empowerment, combined with savings and entrepreneurship, can create lasting change in rural communities.</p>',
    '/img/health.webp',
    'published'::public.testimony_status,
    now() - interval '30 days',
    30
  )
on conflict (slug) do nothing;
