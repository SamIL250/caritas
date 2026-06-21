-- Atomic upsert + increment for page_views

create or replace function public.increment_page_view(
  p_page_type text,
  p_page_id uuid,
  p_view_date date default current_date
)
returns void
language plpgsql
as $$
begin
  insert into public.page_views (page_type, page_id, view_date, count)
  values (p_page_type, p_page_id, p_view_date, 1)
  on conflict (page_type, page_id, view_date)
  do update set count = page_views.count + 1;
end;
$$;
