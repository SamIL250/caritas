-- Our History: vertical timeline content + section background image field
-- Updates about_timeline section with the six milestones and background_image support.

update public.sections s
set
  name = 'History',
  type = 'timeline'::public.section_type,
  content = $tl$
  {
    "eyebrow": "Our History",
    "eyebrow_icon": "fa-clock-rotate-left",
    "title": "Seven Decades of Faith & Service",
    "subtitle": "From a small charity established by Catholic Bishops to a nationwide humanitarian network — our journey spans over 66 years of unwavering service to the most vulnerable Rwandans.",
    "anchor_id": "history",
    "background_image": "",
    "items": [
      {
        "year": "1959",
        "title": "Establishment",
        "body": "Established by the Catholic Bishops of Rwanda as \"Secours Catholique Rwandais\""
      },
      {
        "year": "1962",
        "title": "Legal Registration",
        "body": "Legally Registered as Non-For-Profit Organization, by the Prime Minister's Order No. 488/08, with registration No.75/08"
      },
      {
        "year": "1963",
        "title": "Name Transition",
        "body": "Transition from \"Secours Catholique Rwandais\" into Caritas Rwanda"
      },
      {
        "year": "1965",
        "title": "International Membership",
        "body": "Member of Caritas Internationalis Confederation now 162 members"
      },
      {
        "year": "1994+",
        "title": "Post-Genocide Expansion",
        "body": "Suffered Genocide against Tutsi, and extended services to Health and Development interventions"
      },
      {
        "year": "2012",
        "title": "NGO Status",
        "body": "Becomes Non-Governmental Organization (NGO), in compliance with Law No. 04/2012"
      }
    ]
  }
  $tl$::jsonb,
  "order" = 30,
  visible = true,
  updated_at = now()
from public.pages p
where p.slug = 'about'
  and s.page_id = p.id
  and s.section_key = 'about_timeline';

insert into public.sections (page_id, name, type, content, "order", visible, section_key)
select
  p.id,
  'History',
  'timeline'::public.section_type,
  $tl$
  {
    "eyebrow": "Our History",
    "eyebrow_icon": "fa-clock-rotate-left",
    "title": "Seven Decades of Faith & Service",
    "subtitle": "From a small charity established by Catholic Bishops to a nationwide humanitarian network — our journey spans over 66 years of unwavering service to the most vulnerable Rwandans.",
    "anchor_id": "history",
    "background_image": "",
    "items": [
      {
        "year": "1959",
        "title": "Establishment",
        "body": "Established by the Catholic Bishops of Rwanda as \"Secours Catholique Rwandais\""
      },
      {
        "year": "1962",
        "title": "Legal Registration",
        "body": "Legally Registered as Non-For-Profit Organization, by the Prime Minister's Order No. 488/08, with registration No.75/08"
      },
      {
        "year": "1963",
        "title": "Name Transition",
        "body": "Transition from \"Secours Catholique Rwandais\" into Caritas Rwanda"
      },
      {
        "year": "1965",
        "title": "International Membership",
        "body": "Member of Caritas Internationalis Confederation now 162 members"
      },
      {
        "year": "1994+",
        "title": "Post-Genocide Expansion",
        "body": "Suffered Genocide against Tutsi, and extended services to Health and Development interventions"
      },
      {
        "year": "2012",
        "title": "NGO Status",
        "body": "Becomes Non-Governmental Organization (NGO), in compliance with Law No. 04/2012"
      }
    ]
  }
  $tl$::jsonb,
  30,
  true,
  'about_timeline'
from public.pages p
where p.slug = 'about'
  and not exists (
    select 1
    from public.sections s
    where s.page_id = p.id
      and s.section_key = 'about_timeline'
  );
