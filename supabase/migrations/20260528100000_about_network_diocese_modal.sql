-- About network section: diocese detail modal data (reference `about.html` DB).
-- Runs after 20260527100000_about_network_diocese_details_hrefs.sql so seeded content is not overwritten.

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
      {
        "name": "Kabgayi Diocese",
        "date_line": "Est. February 1952",
        "image": "/img/Diocese/Kabgayi_Basilica_Catholic_Church.jpg",
        "icon": "fa-church",
        "number": "01",
        "modal": {
          "founded": "February 14, 1952",
          "bishop": "Mgr. Balthazar Ntivuguruzwa",
          "address": "Eveche, B.P. 66, Muhanga (Gitarama), Rwanda",
          "phone": "+250 788 633 463",
          "website": "http://www.diocesekabgayi.org/",
          "website_label": "diocesekabgayi.org"
        }
      },
      {
        "name": "Nyundo Diocese",
        "date_line": "Est. November 1959",
        "image": "/img/Diocese/WhatsApp%20Image%202025-10-16%20at%2012.47.37_785f3d99.jpg",
        "icon": "fa-church",
        "number": "02",
        "modal": {
          "founded": "November 10, 1959",
          "bishop": "H.E. Mgr. Anaclet Mwumvaneza",
          "address": "Évêché, B.P. 85, Gisenyi (Rubavu), Rwanda",
          "phone": "+250 782 188 862",
          "website": "http://www.nyundodiocese.info/",
          "website_label": "nyundodiocese.info"
        }
      },
      {
        "name": "Butare Diocese",
        "date_line": "Est. December 1960",
        "image": "/img/Diocese/caption.jpg",
        "icon": "fa-church",
        "number": "03",
        "accent_wash": true,
        "modal": {
          "founded": "December 20, 1960",
          "bishop": "Mgr. Jean Bosco Ntagungira",
          "address": "Eveche, B.P. 69, Butare (Huye), Rwanda",
          "phone": "+250 788 303 720",
          "website": "https://butarecatholicdiocese.com/",
          "website_label": "butarecatholicdiocese.com"
        }
      },
      {
        "name": "Ruhengeri Diocese",
        "date_line": "Est. September 1961",
        "image": "/img/Diocese/Cathedrale_Fatima_Ruhengeri.jpg",
        "icon": "fa-church",
        "number": "04",
        "modal": {
          "founded": "September 11, 1961",
          "bishop": "Mgr. Vincent Harolimana",
          "address": "Curia Diocesaine, Avenue Mikeno, B.P. 45, Ruhengeri, Rwanda",
          "phone": "+250 788 742 632",
          "website": "https://www.dioceseruhengeri.org/",
          "website_label": "dioceseruhengeri.org"
        }
      },
      {
        "name": "Kibungo Diocese",
        "date_line": "Est. September 1968",
        "image": "/img/Diocese/Capture.PNG",
        "icon": "fa-church",
        "number": "05",
        "modal": {
          "founded": "September 5, 1968",
          "bishop": "—",
          "address": "B.P. 30, Kibungo, Rwanda",
          "phone": "+250 789 589 308",
          "email": "diokib@yahoo.fr",
          "website": "https://www.diocesekibungo.com/",
          "website_label": "diocesekibungo.com"
        }
      },
      {
        "name": "Kigali Archdiocese",
        "date_line": "Est. April 1976",
        "image": "/img/Diocese/Kabgayi_Basilica_Catholic_Church.jpg",
        "icon": "fa-church",
        "number": "06",
        "modal": {
          "founded": "April 10, 1976",
          "bishop": "Cardinal Antoine Kambanda",
          "address": "KN 69 St, B.P. 715, Kigali, Rwanda",
          "phone": "+250 794 411 194",
          "email": "info@archdioceseofkigali.org",
          "website": "https://archdioceseofkigali.org/",
          "website_label": "archdioceseofkigali.org"
        }
      },
      {
        "name": "Byumba Diocese",
        "date_line": "Est. November 1981",
        "image": "/img/Diocese/BYumba.jpg",
        "icon": "fa-church",
        "number": "07",
        "modal": {
          "founded": "November 14, 1981",
          "bishop": "Mgr. Papias Musengamana",
          "address": "B.P. 5, Byumba (Gicumbi, Province du Nord), Rwanda",
          "phone": "+250 788 676 620",
          "email": "info@byumbadiocese.org",
          "website": "https://byumbadiocese.org/",
          "website_label": "byumbadiocese.org"
        }
      },
      {
        "name": "Cyangugu Diocese",
        "date_line": "Est. November 1981",
        "image": "/img/Diocese/cyangugu.jpg",
        "icon": "fa-church",
        "number": "08",
        "modal": {
          "founded": "November 5, 1981",
          "bishop": "Mgr. Edouard Sinayobye",
          "address": "B.P. 05, Cyangugu, Rwanda",
          "phone": "+250 788 308 810",
          "email": "diocesecyangugu@gmail.com",
          "website": "https://www.diocesecyangugu.com/",
          "website_label": "diocesecyangugu.com"
        }
      },
      {
        "name": "Gikongoro Diocese",
        "date_line": "Est. March 1992",
        "image": "/img/Diocese/cropped-Cathedrale-Diocese-Gikongoro-BG-1-scaled-7.jpg",
        "icon": "fa-church",
        "number": "09",
        "modal": {
          "founded": "March 30, 1992",
          "bishop": "—",
          "address": "B.P. 77, Gikongoro, Rwanda",
          "phone": "+250 535 077 / +250 535 079",
          "email": "evechegik@yahoo.fr",
          "website": "https://www.diocesegikongoro.com/",
          "website_label": "diocesegikongoro.com"
        }
      },
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
