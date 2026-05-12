-- Refresh About network section: photo diocese cards + pastoral zones variant (matches original-web/about gallery).

update public.sections s
set
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
  updated_at = now()
from public.pages p
where p.slug = 'about'
  and s.page_id = p.id
  and s.section_key = 'about_network';
