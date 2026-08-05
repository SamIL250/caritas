-- Default publications page hero background (Caritas Rwanda resource centre)

update public.hero_content hc
set
  image_url = '/img/publications-hero.jpg',
  updated_at = now()
from public.pages p
where hc.page_id = p.id
  and p.slug = 'publications'
  and coalesce(trim(hc.image_url), '') = '';
