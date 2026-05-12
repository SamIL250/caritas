-- Diocese map section (Leaflet): template + migrate About `about_network` from card grid to map.
-- Enum value is added in 20260511232959_section_type_diocese_map_enum.sql (separate transaction).
-- Reference: `index.html` diocese map block.

insert into public.section_templates (type, label, description, icon, default_content)
values (
  'diocese_map_section',
  'Diocese network map',
  'Interactive Rwanda map with diocese list, synced markers, and detail strip (Leaflet + OpenStreetMap/CARTO). Reusable on home or inner pages.',
  'Compass',
  $dm${"eyebrow": "Diocesan Network", "title_prefix": "Our", "title_highlight": "9 Dioceses", "title_suffix": "Across Rwanda", "description": "Caritas Rwanda operates through 9 Diocesan Caritas, covering every corner of the country with faith-driven humanitarian service.", "anchor_id": "network", "map_center_lat": -1.94, "map_center_lng": 29.87, "map_zoom": 8, "empty_hint": "Click a marker on the map or select a diocese from the list", "dioceses": [{"id": "kigali", "name": "Archdiocese of Kigali", "city": "Kigali", "lat": -1.9441, "lng": 30.0619, "archdiocese": true, "bishop": "Cardinal Antoine Kambanda", "founded": "April 10, 1976", "description": "The metropolitan see of Rwanda. The Cathedral of Notre-Dame des Victoires stands at the heart of the capital.", "image": "/img/Diocese/Kabgayi_Basilica_Catholic_Church.jpg", "phone": "+250 794 411 194", "website": "https://archdioceseofkigali.org/"}, {"id": "kabgayi", "name": "Diocese of Kabgayi", "city": "Muhanga", "lat": -2.0694, "lng": 29.7553, "bishop": "Mgr. Balthazar Ntivuguruzwa", "founded": "February 14, 1952", "description": "Home to the historic Kabgayi Basilica, one of the oldest and most significant Catholic centres in Rwanda.", "image": "/img/Diocese/Kabgayi_Basilica_Catholic_Church.jpg", "phone": "+250 788 633 463", "website": "http://www.diocesekabgayi.org/"}, {"id": "butare", "name": "Diocese of Butare", "city": "Huye", "lat": -2.5966, "lng": 29.7418, "bishop": "Mgr. Jean Bosco Ntagungira", "founded": "December 20, 1960", "description": "Serving the southern Rwanda region, centred in the university city of Huye (Butare).", "image": "/img/Diocese/caption.jpg", "phone": "+250 788 303 720", "website": "https://butarecatholicdiocese.com/"}, {"id": "byumba", "name": "Diocese of Byumba", "city": "Gicumbi", "lat": -1.5769, "lng": 30.0633, "bishop": "Mgr. Papias Musengamana", "founded": "November 14, 1981", "description": "Covering the northern highlands of Rwanda, centred in Byumba (Gicumbi district).", "image": "/img/Diocese/BYumba.jpg", "phone": "+250 788 676 620", "website": "https://byumbadiocese.org/"}, {"id": "cyangugu", "name": "Diocese of Cyangugu", "city": "Rusizi", "lat": -2.4847, "lng": 28.907, "bishop": "Mgr. Edouard Sinayobye", "founded": "November 5, 1981", "description": "Located in southwestern Rwanda on the shores of Lake Kivu, serving the Rusizi area.", "image": "/img/Diocese/cyangugu.jpg", "phone": "+250 788 308 810", "website": "https://www.diocesecyangugu.com/"}, {"id": "gikongoro", "name": "Diocese of Gikongoro", "city": "Nyamagabe", "lat": -2.4786, "lng": 29.5642, "bishop": null, "founded": "March 30, 1992", "description": "Covering the hilly terrain of southern-western Rwanda in the Nyamagabe district.", "image": "/img/Diocese/cropped-Cathedrale-Diocese-Gikongoro-BG-1-scaled-7.jpg", "phone": "+250 535 077", "website": "https://www.diocesegikongoro.com/"}, {"id": "kibungo", "name": "Diocese of Kibungo", "city": "Ngoma", "lat": -2.1489, "lng": 30.5485, "bishop": null, "founded": "September 5, 1968", "description": "Serving the eastern region of Rwanda, centred in Kibungo (Ngoma district).", "image": "/img/Diocese/Capture.PNG", "phone": "+250 789 589 308", "website": "https://www.diocesekibungo.com/"}, {"id": "nyundo", "name": "Diocese of Nyundo", "city": "Rubavu", "lat": -1.6786, "lng": 29.3947, "bishop": "H.E. Mgr. Anaclet Mwumvaneza", "founded": "November 10, 1959", "description": "Covering the northwest of Rwanda along Lake Kivu, centred in Rubavu (Gisenyi).", "image": "/img/Diocese/WhatsApp%20Image%202025-10-16%20at%2012.47.37_785f3d99.jpg", "phone": "+250 782 188 862", "website": "http://www.nyundodiocese.info/"}, {"id": "ruhengeri", "name": "Diocese of Ruhengeri", "city": "Musanze", "lat": -1.4986, "lng": 29.6318, "bishop": "Mgr. Vincent Harolimana", "founded": "September 11, 1961", "description": "Nestled at the foot of the Virunga volcanoes, serving northern Rwanda from Musanze.", "image": "/img/Diocese/Cathedrale_Fatima_Ruhengeri.jpg", "phone": "+250 788 742 632", "website": "https://www.dioceseruhengeri.org/"}]}$dm$::jsonb
)
on conflict (type) do update set
  label = excluded.label,
  description = excluded.description,
  icon = excluded.icon,
  default_content = excluded.default_content;

update public.sections s
set
  type = 'diocese_map_section'::public.section_type,
  name = 'Diocesan network map',
  content = t.default_content,
  updated_at = now()
from public.section_templates t
where t.type = 'diocese_map_section'::public.section_type
  and s.section_key = 'about_network'
  and s.page_id = (select id from public.pages where slug = 'about' limit 1);
