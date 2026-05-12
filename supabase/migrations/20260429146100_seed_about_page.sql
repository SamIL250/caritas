-- Seed published About page, hero row, and sections for /about.
-- Depends on enum + section_templates migrations. No ON CONFLICT — works without those unique indexes.
-- Idempotent: UPDATE then INSERT-if-missing for each piece.

insert into public.pages (title, slug, status, meta)
select
  'About Us',
  'about',
  'published'::public.page_status,
  jsonb_build_object(
    'seo_title',
    'About Us — Caritas Rwanda',
    'seo_description',
    'Learn about Caritas Rwanda''s history, mission, values, nationwide network of dioceses, and leadership.'
  )
where not exists (select 1 from public.pages p where p.slug = 'about');
update public.pages
set
  title = 'About Us',
  status = 'published'::public.page_status,
  meta = jsonb_build_object(
    'seo_title',
    'About Us — Caritas Rwanda',
    'seo_description',
    'Learn about Caritas Rwanda''s history, mission, values, nationwide network of dioceses, and leadership.'
  ),
  updated_at = now()
where slug = 'about';
insert into public.hero_content (
  page_id,
  heading,
  subheading,
  cta_text,
  cta_url,
  image_url,
  options
)
select
  p.id,
  '66 Years of Faith, Hope & Compassionate Service',
  'From a small charity established by Rwanda''s Catholic Bishops to a nationwide humanitarian network — discover the story, mission, and people behind Caritas Rwanda.',
  '',
  '',
  '/img/slide1.png',
  $hero$
  {
    "align": "center",
    "overlay_opacity": 0.82,
    "text_color": "#ffffff",
    "badge_text": "About Caritas Rwanda",
    "heading_accent": "Faith, Hope",
    "quick_nav": [
      { "label": "Our History", "href": "#history", "icon": "clock-rotate-left" },
      { "label": "Mission & Vision", "href": "#mission", "icon": "bullseye" },
      { "label": "Our Values", "href": "#values", "icon": "star" },
      { "label": "Our Network", "href": "#network", "icon": "network-wired" },
      { "label": "Leadership", "href": "#leadership", "icon": "user-tie" }
    ]
  }
  $hero$::jsonb
from public.pages p
where p.slug = 'about'
  and not exists (
    select 1 from public.hero_content h where h.page_id = p.id
  );
update public.hero_content hc
set
  heading = '66 Years of Faith, Hope & Compassionate Service',
  subheading =
    'From a small charity established by Rwanda''s Catholic Bishops to a nationwide humanitarian network — discover the story, mission, and people behind Caritas Rwanda.',
  cta_text = '',
  cta_url = '',
  image_url = '/img/slide1.png',
  options = $hero$
  {
    "align": "center",
    "overlay_opacity": 0.82,
    "text_color": "#ffffff",
    "badge_text": "About Caritas Rwanda",
    "heading_accent": "Faith, Hope",
    "quick_nav": [
      { "label": "Our History", "href": "#history", "icon": "clock-rotate-left" },
      { "label": "Mission & Vision", "href": "#mission", "icon": "bullseye" },
      { "label": "Our Values", "href": "#values", "icon": "star" },
      { "label": "Our Network", "href": "#network", "icon": "network-wired" },
      { "label": "Leadership", "href": "#leadership", "icon": "user-tie" }
    ]
  }
  $hero$::jsonb,
  updated_at = now()
from public.pages p
where p.slug = 'about'
  and hc.page_id = p.id;
-- Sections: INSERT when missing per section_key; UPDATE payload when present (dashboard edits preserved if you strip UPDATE blocks later).

insert into public.sections (page_id, name, type, content, "order", visible, section_key)
select
  p.id,
  'Key stats',
  'stats_banner'::public.section_type,
  $s1$
  {
    "layout": "strip",
    "badge": "FY 2025",
    "title_lead": "OUR",
    "title_accent": "RESOURCES",
    "subtitle": "Program Impacts",
    "cta_label": "Explore our programs",
    "cta_href": "#programs",
    "items": [
      { "number_core": "66", "number_suffix": "+", "label": "Years of Service", "variant": "red", "strip_icon": "clock" },
      { "number_core": "7", "number_suffix": "M+", "label": "People Served", "variant": "blue", "strip_icon": "people" },
      { "number_core": "10", "number_suffix": "", "label": "Diocesan Caritas", "variant": "teal", "strip_icon": "church" },
      { "number_core": "56", "number_suffix": "K+", "label": "Active Volunteers", "variant": "red", "strip_icon": "hands-heart" },
      { "number_core": "120", "number_suffix": "", "label": "Catholic Health Facilities", "variant": "blue", "strip_icon": "heart-pulse" },
      { "number_core": "$72", "number_suffix": "M", "label": "Budget Mobilized (2015–2024)", "variant": "teal", "strip_icon": "money" }
    ]
  }
  $s1$::jsonb,
  10,
  true,
  'about_stats'
from public.pages p
where p.slug = 'about'
  and not exists (
    select 1
    from public.sections s
    where s.page_id = p.id
      and s.section_key = 'about_stats'
  );
update public.sections s
set
  name = 'Key stats',
  type = 'stats_banner'::public.section_type,
  content = $s1$
  {
    "layout": "strip",
    "badge": "FY 2025",
    "title_lead": "OUR",
    "title_accent": "RESOURCES",
    "subtitle": "Program Impacts",
    "cta_label": "Explore our programs",
    "cta_href": "#programs",
    "items": [
      { "number_core": "66", "number_suffix": "+", "label": "Years of Service", "variant": "red", "strip_icon": "clock" },
      { "number_core": "7", "number_suffix": "M+", "label": "People Served", "variant": "blue", "strip_icon": "people" },
      { "number_core": "10", "number_suffix": "", "label": "Diocesan Caritas", "variant": "teal", "strip_icon": "church" },
      { "number_core": "56", "number_suffix": "K+", "label": "Active Volunteers", "variant": "red", "strip_icon": "hands-heart" },
      { "number_core": "120", "number_suffix": "", "label": "Catholic Health Facilities", "variant": "blue", "strip_icon": "heart-pulse" },
      { "number_core": "$72", "number_suffix": "M", "label": "Budget Mobilized (2015–2024)", "variant": "teal", "strip_icon": "money" }
    ]
  }
  $s1$::jsonb,
  "order" = 10,
  visible = true,
  updated_at = now()
from public.pages p
where p.slug = 'about'
  and s.page_id = p.id
  and s.section_key = 'about_stats';
insert into public.sections (page_id, name, type, content, "order", visible, section_key)
select
  p.id,
  'Chairperson quote',
  'featured_quote'::public.section_type,
  $quote$
  {
    "tone": "dark",
    "name": "H.E. Mgr. Anaclet Mwumvaneza",
    "subtitle": "Bishop of Nyundo Diocese<br/>Chairperson, Caritas Rwanda",
    "quote": "Catholic Church is proud of Caritas Rwanda's **66 years of services** to Rwandans, especially its contribution to socio-economic development, health promotion, paying particular attention to the poor, the sick, the elderly, people living with disabilities, refugees — as well as building a just and resilient society.\n\nMay this be not only a reminder of the past, but above all an invitation to continue the mission of charity and service to the poor, so that the Gospel may continue to be **Good News for every Rwandan**.",
    "meta": "Chairperson's Statement — 125th Jubilee of Evangelization, 2025",
    "photo_url": ""
  }
  $quote$::jsonb,
  20,
  true,
  'about_chair_quote'
from public.pages p
where p.slug = 'about'
  and not exists (
    select 1
    from public.sections s
    where s.page_id = p.id
      and s.section_key = 'about_chair_quote'
  );
update public.sections s
set
  name = 'Chairperson quote',
  type = 'featured_quote'::public.section_type,
  content = $quote$
  {
    "tone": "dark",
    "name": "H.E. Mgr. Anaclet Mwumvaneza",
    "subtitle": "Bishop of Nyundo Diocese<br/>Chairperson, Caritas Rwanda",
    "quote": "Catholic Church is proud of Caritas Rwanda's **66 years of services** to Rwandans, especially its contribution to socio-economic development, health promotion, paying particular attention to the poor, the sick, the elderly, people living with disabilities, refugees — as well as building a just and resilient society.\n\nMay this be not only a reminder of the past, but above all an invitation to continue the mission of charity and service to the poor, so that the Gospel may continue to be **Good News for every Rwandan**.",
    "meta": "Chairperson's Statement — 125th Jubilee of Evangelization, 2025",
    "photo_url": ""
  }
  $quote$::jsonb,
  "order" = 20,
  visible = true,
  updated_at = now()
from public.pages p
where p.slug = 'about'
  and s.page_id = p.id
  and s.section_key = 'about_chair_quote';
insert into public.sections (page_id, name, type, content, "order", visible, section_key)
select
  p.id,
  'History',
  'timeline'::public.section_type,
  $tl$
  {
    "eyebrow": "Our History",
    "eyebrow_icon": "fa-clock-rotate-left",
    "title": "Six Decades of Faith & Service",
    "subtitle": "From a small charity established by Catholic Bishops to a nationwide humanitarian network — our journey spans over 66 years of unwavering service to the most vulnerable Rwandans.",
    "anchor_id": "history",
    "items": [
      {
        "year": "1959",
        "badge": "Founding",
        "title": "Creation",
        "body": "**Secours Catholique Rwandais** established by the Catholic Bishops of Rwanda — a Gospel-rooted response to humanitarian hardship and the call to serve the poor without discrimination."
      },
      {
        "year": "1960",
        "badge": "Legal",
        "title": "Legal Registration",
        "body": "Officially registered as a **non-profit organization** by Prime Minister's Order No. 488/08, granting the organization formal legal standing to operate nationally."
      },
      {
        "year": "1963",
        "badge": "Rename",
        "title": "Name Change",
        "body": "Renamed from Secours Catholique Rwandais to **Caritas Rwanda** by Prime Minister's Order No. 75/08."
      },
      {
        "year": "1965",
        "badge": "Global",
        "title": "International Membership",
        "body": "Became a member of **Caritas Internationalis** — a confederation of 162 national Caritas members worldwide."
      },
      {
        "year": "1994+",
        "badge": "Recovery",
        "title": "Post-Genocide Expansion",
        "body": "Following the 1994 Genocide against the Tutsi, Caritas Rwanda expanded programmes to cover **health, development**, and strengthened administration across the organisation."
      },
      {
        "year": "2012",
        "badge": "Registration",
        "title": "National NGO Status",
        "body": "Formally registered as a **National Non-Governmental Organisation** under Law No. 04/2012."
      },
      {
        "year": "2025",
        "badge": "Jubilee",
        "title": "125th Jubilee Celebration",
        "body": "Celebrating 125 years of evangelization in Rwanda and **66 years of Caritas service** — millions of Rwandans supported through faith-driven solidarity."
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
update public.sections s
set
  name = 'History',
  type = 'timeline'::public.section_type,
  content = $tl$
  {
    "eyebrow": "Our History",
    "eyebrow_icon": "fa-clock-rotate-left",
    "title": "Six Decades of Faith & Service",
    "subtitle": "From a small charity established by Catholic Bishops to a nationwide humanitarian network — our journey spans over 66 years of unwavering service to the most vulnerable Rwandans.",
    "anchor_id": "history",
    "items": [
      {
        "year": "1959",
        "badge": "Founding",
        "title": "Creation",
        "body": "**Secours Catholique Rwandais** established by the Catholic Bishops of Rwanda — a Gospel-rooted response to humanitarian hardship and the call to serve the poor without discrimination."
      },
      {
        "year": "1960",
        "badge": "Legal",
        "title": "Legal Registration",
        "body": "Officially registered as a **non-profit organization** by Prime Minister's Order No. 488/08, granting the organization formal legal standing to operate nationally."
      },
      {
        "year": "1963",
        "badge": "Rename",
        "title": "Name Change",
        "body": "Renamed from Secours Catholique Rwandais to **Caritas Rwanda** by Prime Minister's Order No. 75/08."
      },
      {
        "year": "1965",
        "badge": "Global",
        "title": "International Membership",
        "body": "Became a member of **Caritas Internationalis** — a confederation of 162 national Caritas members worldwide."
      },
      {
        "year": "1994+",
        "badge": "Recovery",
        "title": "Post-Genocide Expansion",
        "body": "Following the 1994 Genocide against the Tutsi, Caritas Rwanda expanded programmes to cover **health, development**, and strengthened administration across the organisation."
      },
      {
        "year": "2012",
        "badge": "Registration",
        "title": "National NGO Status",
        "body": "Formally registered as a **National Non-Governmental Organisation** under Law No. 04/2012."
      },
      {
        "year": "2025",
        "badge": "Jubilee",
        "title": "125th Jubilee Celebration",
        "body": "Celebrating 125 years of evangelization in Rwanda and **66 years of Caritas service** — millions of Rwandans supported through faith-driven solidarity."
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
  'Mission & vision',
  'pillar_cards'::public.section_type,
  $pill$
  {
    "eyebrow": "Who We Are",
    "eyebrow_icon": "fa-bullseye",
    "title": "Mission, Vision & Values",
    "subtitle": "Guided by the Word of God and the principles of Catholic Social Teaching — dignity, solidarity, and justice steer every intervention.",
    "anchor_id": "mission",
    "pillars": [
      {
        "variant": "mission",
        "label": "Our Mission",
        "title": "Serve & Develop",
        "icon": "fa-bullseye",
        "body": "To assist people in need and promote their **integral human development**, drawing on charity rooted in scripture — prioritising people who are poorest and most marginalised across Rwanda."
      },
      {
        "variant": "vision",
        "label": "Our Vision",
        "title": "Promoting Human Dignity for All",
        "icon": "fa-eye",
        "body": "A Rwanda where every person enjoys dignity and equal opportunity—where communities can rebuild, heal, and hope together."
      },
      {
        "variant": "values",
        "label": "Our Values",
        "title": "Principles We Live By",
        "icon": "fa-star",
        "body": "Advocacy · compassion · equity · stewardship · solidarity · accountability — informing every programme partnership."
      }
    ]
  }
  $pill$::jsonb,
  40,
  true,
  'about_mv'
from public.pages p
where p.slug = 'about'
  and not exists (
    select 1
    from public.sections s
    where s.page_id = p.id
      and s.section_key = 'about_mv'
  );
update public.sections s
set
  name = 'Mission & vision',
  type = 'pillar_cards'::public.section_type,
  content = $pill$
  {
    "eyebrow": "Who We Are",
    "eyebrow_icon": "fa-bullseye",
    "title": "Mission, Vision & Values",
    "subtitle": "Guided by the Word of God and the principles of Catholic Social Teaching — dignity, solidarity, and justice steer every intervention.",
    "anchor_id": "mission",
    "pillars": [
      {
        "variant": "mission",
        "label": "Our Mission",
        "title": "Serve & Develop",
        "icon": "fa-bullseye",
        "body": "To assist people in need and promote their **integral human development**, drawing on charity rooted in scripture — prioritising people who are poorest and most marginalised across Rwanda."
      },
      {
        "variant": "vision",
        "label": "Our Vision",
        "title": "Promoting Human Dignity for All",
        "icon": "fa-eye",
        "body": "A Rwanda where every person enjoys dignity and equal opportunity—where communities can rebuild, heal, and hope together."
      },
      {
        "variant": "values",
        "label": "Our Values",
        "title": "Principles We Live By",
        "icon": "fa-star",
        "body": "Advocacy · compassion · equity · stewardship · solidarity · accountability — informing every programme partnership."
      }
    ]
  }
  $pill$::jsonb,
  "order" = 40,
  visible = true,
  updated_at = now()
from public.pages p
where p.slug = 'about'
  and s.page_id = p.id
  and s.section_key = 'about_mv';
insert into public.sections (page_id, name, type, content, "order", visible, section_key)
select
  p.id,
  'Values grid',
  'values_grid'::public.section_type,
  $vals$
  {
    "eyebrow": "Core Values",
    "eyebrow_icon": "fa-star",
    "title": "What We Stand For",
    "subtitle": "Eleven principles drawn from Gospel values and Catholic Social Teaching inform every initiative.",
    "anchor_id": "values",
    "items": [
      { "icon": "fa-megaphone", "name": "Advocacy" },
      { "icon": "fa-heart", "name": "Compassion" },
      { "icon": "fa-scale-balanced", "name": "Equity" },
      { "icon": "fa-leaf", "name": "Environment Protection" },
      { "icon": "fa-sun", "name": "Hope" },
      { "icon": "fa-person-rays", "name": "Human Dignity" },
      { "icon": "fa-gavel", "name": "Justice" },
      { "icon": "fa-hand-holding-heart", "name": "Service" },
      { "icon": "fa-handshake", "name": "Solidarity" },
      { "icon": "fa-shield-halved", "name": "Stewardship & Accountability" },
      { "icon": "fa-people-group", "name": "Subsidiarity & Partnership" }
    ]
  }
  $vals$::jsonb,
  50,
  true,
  'about_values'
from public.pages p
where p.slug = 'about'
  and not exists (
    select 1
    from public.sections s
    where s.page_id = p.id
      and s.section_key = 'about_values'
  );
update public.sections s
set
  name = 'Values grid',
  type = 'values_grid'::public.section_type,
  content = $vals$
  {
    "eyebrow": "Core Values",
    "eyebrow_icon": "fa-star",
    "title": "What We Stand For",
    "subtitle": "Eleven principles drawn from Gospel values and Catholic Social Teaching inform every initiative.",
    "anchor_id": "values",
    "items": [
      { "icon": "fa-megaphone", "name": "Advocacy" },
      { "icon": "fa-heart", "name": "Compassion" },
      { "icon": "fa-scale-balanced", "name": "Equity" },
      { "icon": "fa-leaf", "name": "Environment Protection" },
      { "icon": "fa-sun", "name": "Hope" },
      { "icon": "fa-person-rays", "name": "Human Dignity" },
      { "icon": "fa-gavel", "name": "Justice" },
      { "icon": "fa-hand-holding-heart", "name": "Service" },
      { "icon": "fa-handshake", "name": "Solidarity" },
      { "icon": "fa-shield-halved", "name": "Stewardship & Accountability" },
      { "icon": "fa-people-group", "name": "Subsidiarity & Partnership" }
    ]
  }
  $vals$::jsonb,
  "order" = 50,
  visible = true,
  updated_at = now()
from public.pages p
where p.slug = 'about'
  and s.page_id = p.id
  and s.section_key = 'about_values';
insert into public.sections (page_id, name, type, content, "order", visible, section_key)
select
  p.id,
  'Network',
  'network_section'::public.section_type,
  $net$
  {
    "eyebrow": "Our Network",
    "eyebrow_icon": "fa-network-wired",
    "title": "Reaching Every Corner of Rwanda",
    "subtitle": "From 2 founding dioceses in 1959 to a network of 10 Diocesan Caritas spanning the entire country — our reach grows deeper every year.",
    "anchor_id": "network",
    "stats": [
      { "number": "10", "label": "Diocesan Caritas" },
      { "number": "236", "label": "Parish Caritas" },
      { "number": "1,016", "label": "Sub-Parish Caritas" },
      { "number": "34,080", "label": "Basic Christian Communities" },
      { "number": "56,345+", "label": "Active Volunteers" }
    ],
    "dioceses": [
      { "name": "Kabgayi Diocese", "date_line": "Est. February 1952", "image": "/img/Diocese/Kabgayi_Basilica_Catholic_Church.jpg", "icon": "fa-church", "number": "01" },
      { "name": "Nyundo Diocese", "date_line": "Est. November 1959", "image": "/img/Diocese/WhatsApp%20Image%202025-10-16%20at%2012.47.37_785f3d99.jpg", "icon": "fa-church", "number": "02" },
      { "name": "Butare Diocese", "date_line": "Est. December 1960", "image": "/img/Diocese/caption.jpg", "icon": "fa-church", "number": "03", "accent_wash": true },
      { "name": "Ruhengeri Diocese", "date_line": "Est. September 1961", "image": "/img/Diocese/Cathedrale_Fatima_Ruhengeri.jpg", "icon": "fa-church", "number": "04" },
      { "name": "Kibungo Diocese", "date_line": "Est. September 1968", "image": "/img/Diocese/Capture.PNG", "icon": "fa-church", "number": "05" },
      { "name": "Kigali Archdiocese", "date_line": "Est. April 1976", "image": "/img/Diocese/Kabgayi_Basilica_Catholic_Church.jpg", "icon": "fa-church", "number": "06" },
      { "name": "Byumba Diocese", "date_line": "Est. November 1981", "image": "/img/Diocese/BYumba.jpg", "icon": "fa-church", "number": "07" },
      { "name": "Cyangugu Diocese", "date_line": "Est. November 1981", "image": "/img/Diocese/cyangugu.jpg", "icon": "fa-church", "number": "08" },
      { "name": "Gikongoro Diocese", "date_line": "Est. March 1992", "image": "/img/Diocese/cropped-Cathedrale-Diocese-Gikongoro-BG-1-scaled-7.jpg", "icon": "fa-church", "number": "09" },
      {
        "name": "Nyundo — 2 Zones",
        "date_line": "Gisenyi & Kibuye",
        "icon": "fa-star",
        "special": true
      }
    ]
  }
  $net$::jsonb,
  60,
  true,
  'about_network'
from public.pages p
where p.slug = 'about'
  and not exists (
    select 1
    from public.sections s
    where s.page_id = p.id
      and s.section_key = 'about_network'
  );
update public.sections s
set
  name = 'Network',
  type = 'network_section'::public.section_type,
  content = $net$
  {
    "eyebrow": "Our Network",
    "eyebrow_icon": "fa-network-wired",
    "title": "Reaching Every Corner of Rwanda",
    "subtitle": "From 2 founding dioceses in 1959 to a network of 10 Diocesan Caritas spanning the entire country — our reach grows deeper every year.",
    "anchor_id": "network",
    "stats": [
      { "number": "10", "label": "Diocesan Caritas" },
      { "number": "236", "label": "Parish Caritas" },
      { "number": "1,016", "label": "Sub-Parish Caritas" },
      { "number": "34,080", "label": "Basic Christian Communities" },
      { "number": "56,345+", "label": "Active Volunteers" }
    ],
    "dioceses": [
      { "name": "Kabgayi Diocese", "date_line": "Est. February 1952", "image": "/img/Diocese/Kabgayi_Basilica_Catholic_Church.jpg", "icon": "fa-church", "number": "01" },
      { "name": "Nyundo Diocese", "date_line": "Est. November 1959", "image": "/img/Diocese/WhatsApp%20Image%202025-10-16%20at%2012.47.37_785f3d99.jpg", "icon": "fa-church", "number": "02" },
      { "name": "Butare Diocese", "date_line": "Est. December 1960", "image": "/img/Diocese/caption.jpg", "icon": "fa-church", "number": "03", "accent_wash": true },
      { "name": "Ruhengeri Diocese", "date_line": "Est. September 1961", "image": "/img/Diocese/Cathedrale_Fatima_Ruhengeri.jpg", "icon": "fa-church", "number": "04" },
      { "name": "Kibungo Diocese", "date_line": "Est. September 1968", "image": "/img/Diocese/Capture.PNG", "icon": "fa-church", "number": "05" },
      { "name": "Kigali Archdiocese", "date_line": "Est. April 1976", "image": "/img/Diocese/Kabgayi_Basilica_Catholic_Church.jpg", "icon": "fa-church", "number": "06" },
      { "name": "Byumba Diocese", "date_line": "Est. November 1981", "image": "/img/Diocese/BYumba.jpg", "icon": "fa-church", "number": "07" },
      { "name": "Cyangugu Diocese", "date_line": "Est. November 1981", "image": "/img/Diocese/cyangugu.jpg", "icon": "fa-church", "number": "08" },
      { "name": "Gikongoro Diocese", "date_line": "Est. March 1992", "image": "/img/Diocese/cropped-Cathedrale-Diocese-Gikongoro-BG-1-scaled-7.jpg", "icon": "fa-church", "number": "09" },
      {
        "name": "Nyundo — 2 Zones",
        "date_line": "Gisenyi & Kibuye",
        "icon": "fa-star",
        "special": true
      }
    ]
  }
  $net$::jsonb,
  "order" = 60,
  visible = true,
  updated_at = now()
from public.pages p
where p.slug = 'about'
  and s.page_id = p.id
  and s.section_key = 'about_network';
insert into public.sections (page_id, name, type, content, "order", visible, section_key)
select
  p.id,
  'Leadership',
  'leadership_grid'::public.section_type,
  $lead$
{"eyebrow": "Leadership Chronicle", "eyebrow_icon": "fa-scroll", "title": "A Legacy of Faithful Service", "subtitle": "Since 1959, faithful shepherds have guided Caritas Rwanda through decades of challenge, growth, and transformation — each era leaving a lasting mark on our mission.", "anchor_id": "leadership", "watermark_text": "SINCE 1959", "groups": [{"subgroup_label": "Chairpersons", "subgroup_icon": "fa-crown", "era_span": "1959 — Present", "members": [{"year": "1959", "name": "Archbishop Perraudin", "role": "Founding Chairperson", "photo_url": "/img/Chairperson/perraudin.jpg"}, {"year": "1972", "name": "H.E. Mgr. Jean Baptiste Gahamanyi", "role": "Chairperson", "photo_url": "/img/Chairperson/gahamanyi.png"}, {"year": "1997", "name": "H.E. Mgr. Thaddée Ntihinyurwa", "role": "Chairperson", "photo_url": ""}, {"year": "2022", "name": "H.E. Mgr. Anaclet Mwumvaneza", "role": "Chairperson — Nyundo Diocese", "photo_url": "/img/Chairperson/anaclet.jpg", "featured": true}]}, {"subgroup_label": "Secretary Generals", "subgroup_icon": "fa-person-chalkboard", "era_span": "1961 — Present", "members": [{"year": "1961", "name": "Father Arthur Dejemeppe", "role": "Secretary General", "photo_url": "/img/Secretary Generals/Arthur Dejemeppe.jpg"}, {"era_gap": true, "era_label": "Founding\nEra"}, {"year": "1972", "name": "Father Roger Pien", "role": "Secretary General", "photo_url": "/img/Secretary Generals/Roger Pien.jpg"}, {"year": "1973", "name": "Father Cyriaque Munyansanga", "role": "Secretary General", "photo_url": "/img/Secretary Generals/Cyriaque Munyansanga.png"}, {"year": "1977", "name": "Father Carles Maria Giol", "role": "Secretary General", "photo_url": "/img/Secretary Generals/Carles Maria Giol.png"}, {"year": "1978", "name": "Father Michel Descombes", "role": "Secretary General", "photo_url": "/img/Secretary Generals/Descombers.jpg"}, {"era_gap": true, "era_label": "Modern\nEra"}, {"year": "1995", "name": "Father Callixte Twagirayezu", "role": "Secretary General", "photo_url": "/img/Secretary Generals/Callixte Twagirayezu.jpg"}, {"year": "1996", "name": "Msgr. Oreste Incimatata", "role": "Secretary General", "photo_url": "/img/Secretary Generals/Mgr. ORESTE INCIMATATA.jpg"}, {"year": "2013", "name": "H.E. Mgr. Anaclet Mwumvaneza", "role": "Secretary General", "photo_url": "/img/Secretary Generals/anaclet.jpg"}, {"year": "2016", "name": "H.E. Mgr. JMV Twagirayezu", "role": "Secretary General", "photo_url": "/img/Secretary Generals/JMV Twagirayezu.jpg"}, {"year": "2023", "name": "Father Oscar Kagimbura", "role": "Secretary General", "photo_url": "/img/Secretary Generals/Oscar Kagimbura.png", "featured": true}]}]}
  $lead$::jsonb,
  70,
  true,
  'about_leadership'
from public.pages p
where p.slug = 'about'
  and not exists (
    select 1
    from public.sections s
    where s.page_id = p.id
      and s.section_key = 'about_leadership'
  );
update public.sections s
set
  name = 'Leadership',
  type = 'leadership_grid'::public.section_type,
  content = $lead$
{"eyebrow": "Leadership Chronicle", "eyebrow_icon": "fa-scroll", "title": "A Legacy of Faithful Service", "subtitle": "Since 1959, faithful shepherds have guided Caritas Rwanda through decades of challenge, growth, and transformation — each era leaving a lasting mark on our mission.", "anchor_id": "leadership", "watermark_text": "SINCE 1959", "groups": [{"subgroup_label": "Chairpersons", "subgroup_icon": "fa-crown", "era_span": "1959 — Present", "members": [{"year": "1959", "name": "Archbishop Perraudin", "role": "Founding Chairperson", "photo_url": "/img/Chairperson/perraudin.jpg"}, {"year": "1972", "name": "H.E. Mgr. Jean Baptiste Gahamanyi", "role": "Chairperson", "photo_url": "/img/Chairperson/gahamanyi.png"}, {"year": "1997", "name": "H.E. Mgr. Thaddée Ntihinyurwa", "role": "Chairperson", "photo_url": ""}, {"year": "2022", "name": "H.E. Mgr. Anaclet Mwumvaneza", "role": "Chairperson — Nyundo Diocese", "photo_url": "/img/Chairperson/anaclet.jpg", "featured": true}]}, {"subgroup_label": "Secretary Generals", "subgroup_icon": "fa-person-chalkboard", "era_span": "1961 — Present", "members": [{"year": "1961", "name": "Father Arthur Dejemeppe", "role": "Secretary General", "photo_url": "/img/Secretary Generals/Arthur Dejemeppe.jpg"}, {"era_gap": true, "era_label": "Founding\nEra"}, {"year": "1972", "name": "Father Roger Pien", "role": "Secretary General", "photo_url": "/img/Secretary Generals/Roger Pien.jpg"}, {"year": "1973", "name": "Father Cyriaque Munyansanga", "role": "Secretary General", "photo_url": "/img/Secretary Generals/Cyriaque Munyansanga.png"}, {"year": "1977", "name": "Father Carles Maria Giol", "role": "Secretary General", "photo_url": "/img/Secretary Generals/Carles Maria Giol.png"}, {"year": "1978", "name": "Father Michel Descombes", "role": "Secretary General", "photo_url": "/img/Secretary Generals/Descombers.jpg"}, {"era_gap": true, "era_label": "Modern\nEra"}, {"year": "1995", "name": "Father Callixte Twagirayezu", "role": "Secretary General", "photo_url": "/img/Secretary Generals/Callixte Twagirayezu.jpg"}, {"year": "1996", "name": "Msgr. Oreste Incimatata", "role": "Secretary General", "photo_url": "/img/Secretary Generals/Mgr. ORESTE INCIMATATA.jpg"}, {"year": "2013", "name": "H.E. Mgr. Anaclet Mwumvaneza", "role": "Secretary General", "photo_url": "/img/Secretary Generals/anaclet.jpg"}, {"year": "2016", "name": "H.E. Mgr. JMV Twagirayezu", "role": "Secretary General", "photo_url": "/img/Secretary Generals/JMV Twagirayezu.jpg"}, {"year": "2023", "name": "Father Oscar Kagimbura", "role": "Secretary General", "photo_url": "/img/Secretary Generals/Oscar Kagimbura.png", "featured": true}]}]}
  $lead$::jsonb,
  "order" = 70,
  visible = true,
  updated_at = now()
from public.pages p
where p.slug = 'about'
  and s.page_id = p.id
  and s.section_key = 'about_leadership';
