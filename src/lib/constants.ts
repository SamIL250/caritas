import { 
  Layers, 
  AlignLeft, 
  LayoutGrid, 
  Quote, 
  Megaphone, 
  Handshake, 
  Newspaper, 
  MapPin, 
  Map,
  Images, 
  Minus,
  LayoutTemplate,
  BarChart3,
  History,
  Columns2,
  Star,
  Globe2,
  Users,
  LayoutList,
  Mail,
  Landmark,
  Sparkles,
  BookOpen,
  PlayCircle,
  Compass,
} from "lucide-react";
import { DEFAULT_PARTNERS } from "@/lib/partners-defaults";
import { LEADERSHIP_CHRONICLE_DEFAULT_CONTENT } from "@/lib/about-leadership-defaults";
import { DEFAULT_DIOCESE_MAP_SECTION_CONTENT } from "@/lib/diocese-map-defaults";

export const DEFAULT_SECTION_CONTENT: Record<string, any> = {
  hero: {
    heading: "Restoring Hearts for Better Rwanda",
    subheading: "Through strategic humanitarian programs, social development initiatives, and faith-driven service, Caritas Rwanda works to create lasting change for the most vulnerable.",
    cta_text: "Donate Now",
    cta_url: "#",
    image_url: "/img/bg_3.png",
    options: { 
      align: "left", 
      overlay_opacity: 0.4,
      text_color: "#ffffff",
      badge_text: "WELCOME TO CARITAS RWANDA",
      secondary_cta_text: "Volunteer with Us",
      secondary_cta_url: "#"
    }
  },
  text_block: {
    heading: "New heading",
    body: "",
    alignment: "left"
  },
  image_grid: {
    images: [],
    columns: 3
  },
  testimonial: {
    quote: "",
    author: "",
    role: "",
    avatar_url: ""
  },
  cta: {
    eyebrow: "Make a Difference",
    heading: "Be Part of",
    heading_accent: "the Change",
    body:
      "Your support enables us to continue transforming lives and building sustainable communities across all nine dioceses of Rwanda.",
    button_text: "Donate Now",
    button_url: "#donate",
    secondary_text: "Volunteer with Us",
    secondary_url: "#",
    bg_color: "#111418",
    stats: [],
    be_part_grid: true,
    featured_card: {
      image_url:
        "https://caritasrwanda.org/wp-content/uploads/2026/02/162A7632-scaled.jpg",
      image_alt:
        "Portrait representing an older Rwandan woman supported by Caritas programmes",
      category_label: "Medical Support",
      category_icon: "fa-hand-holding-medical",
      title: "Marie Uwimana, 68",
      location: "Nyaruguru District, Southern Province",
      story:
        "Marie raised six children alone after losing her husband in 1994. Today she suffers from chronic diabetes and cannot afford her monthly medication. Your support will cover six months of treatment and ensure Marie can continue to be the pillar of her family.",
      raised_label: "RWF 340,000 raised",
      goal_label: "Goal: RWF 600,000",
      progress_pct: 57,
      stats: [
        { num: "57%", label: "Funded" },
        { num: "124", label: "Donors" },
        { num: "14", label: "Days left" },
      ],
      primary_button_text: "Donate to Marie's Care",
      primary_button_url: "#donate",
      discussion_label: "Campaign discussion",
      discussion_url: "/campaigns/marie-uwimana-care",
    },
    sidebar_cards: [
      {
        image_url:
          "https://caritasrwanda.org/wp-content/uploads/2026/03/162A8733-scaled.jpg",
        image_alt: "Young student supported through education programmes",
        category_label: "Education",
        category_icon: "fa-book-open",
        category_tone: "rose",
        name: "Jean-Pierre Habimana, 12",
        description:
          "An orphan from Musanze seeking school fees and supplies to complete his primary education and build a future.",
        raised_label: "RWF 180,000 raised",
        goal_pct_label: "72% of RWF 250,000",
        progress_pct: 72,
        bar_tone: "sky",
        button_text: "Support Jean-Pierre",
        button_url: "#donate",
      },
      {
        image_url:
          "https://caritasrwanda.org/wp-content/uploads/2026/03/162A9069-scaled.jpg",
        image_alt: "Young adult pursuing vocational skills training",
        category_label: "Livelihood",
        category_icon: "fa-briefcase",
        category_tone: "teal",
        name: "Emmanuel Nkurunziza, 24",
        description:
          "A young man from Rwamagana seeking vocational training funds to become a licensed electrician and support his widowed mother.",
        raised_label: "RWF 90,000 raised",
        goal_pct_label: "45% of RWF 200,000",
        progress_pct: 45,
        bar_tone: "teal",
        button_text: "Support Emmanuel",
        button_url: "#donate",
      },
    ],
    impact_panel: {
      title: "Our collective impact",
      icon: "fa-chart-line",
      items: [
        { num: "150K+", label: "Lives transformed" },
        { num: "67+", label: "Years of service" },
        { num: "9", label: "Dioceses covered" },
        { num: "8K", label: "Active volunteers" },
      ],
    },
    bottom_primary_text: "Start donating today",
    bottom_primary_url: "#donate",
    bottom_secondary_text: "Volunteer with us",
    bottom_secondary_url: "#",
  },
  featured_campaign: {
    anchor_id: "featured-campaign",
    eyebrow: "Make a Difference",
    heading: "Be Part of",
    heading_accent: "the Change",
    body:
      "Your support enables us to continue transforming lives and building sustainable communities across all nine dioceses of Rwanda.",
    impact_panel: {
      title: "Our Collective Impact",
      icon: "fa-chart-line",
      items: [
        { num: "150K+", label: "Lives Transformed" },
        { num: "67+", label: "Years of Service" },
        { num: "9", label: "Dioceses Covered" },
        { num: "8K", label: "Active Volunteers" },
      ],
    },
    bottom_primary_text: "Start Donating Today",
    bottom_primary_url: "#donate",
    bottom_secondary_text: "Volunteer with Us",
    bottom_secondary_url: "#",
  },
  partners: {
    eyebrow: "Collaboration",
    title: "Our Partners",
    subtitle:
      "Working together with trusted global and local organizations to deliver lasting impact across Rwanda.",
    items: DEFAULT_PARTNERS.map((p) => ({ ...p }))
  },
  news_cards: {
    eyebrow: "Latest from Caritas Rwanda",
    heading: "News &",
    heading_highlight: "Stories",
    subtitle: "Inspiring stories from the communities we serve",
    view_all_url: "/news",
    view_all_label: "View All News & Stories",
    articles: []
  },
  contact_info: {
    eyebrow: "Get In Touch",
    heading_line1: "Let's Talk &",
    heading_line2: "Work Together",
    subtext:
      "Have a question, want to partner with us, or simply want to learn more about our work across Rwanda? We'd love to hear from you.",
    headquarters_label: "Headquarters",
    headquarters: "Kigali, Rwanda",
    phone_label: "Phone",
    phone: "(+250) 252 574 34",
    email_label: "Email",
    email: "info@caritasrwanda.org",
    hours_label: "Office Hours",
    office_hours: "Mon – Fri, 8:00 AM – 5:00 PM",
    form_title: "Send Us a Message",
    form_subtitle: "We'll get back to you within 24 hours."
  },
  gallery: {
    images: [],
    caption: ""
  },
  program_cards: {
    eyebrow: "What We Do",
    heading: "Our Program",
    subtitle:
      "Making a lasting difference through targeted, community-focused initiatives across Rwanda",
    programs: []
  },
  home_about: {
    badge_est: "Est. 1959",
    badge_location: "Kigali, Rwanda",
    heading_line1: "Rooted in Faith,",
    heading_line2_accent: "Built for People",
    history_label: "Our History",
    paragraph_html: [
      'Founded in 1959 as <em>Le Secours Catholique Rwandais</em>, Caritas Rwanda is a <strong>faith-driven, nationwide humanitarian organization</strong> committed to restoring dignity, alleviating poverty, and promoting integral human development across every corner of Rwanda — from the hills of Nyaruguru to the streets of Kigali.',
      "As a proud member of <strong>Caritas Internationalis</strong> since 1965, we operate through 9 diocesan networks, reaching the most vulnerable with compassion, justice, and unwavering hope.",
    ],
    story_cta: { label: "Read our story", href: "/about" },
    quote_text:
      "We believe every human being carries inherent dignity that no crisis, poverty, or conflict can ever erase.",
    quote_attribution: "Caritas Rwanda — Core Conviction",
    milestones: [
      "First humanitarian response in post-independence Rwanda (1959)",
      "Joined Caritas Internationalis global network in 1965",
      "Led community recovery & reconciliation efforts post-1994",
      "Serving all 9 dioceses across Rwanda today",
    ],
    pillars: [
      {
        icon: "fa-regular fa-eye",
        title: "Vision",
        body: "A Rwanda where <strong>every person lives with dignity</strong> — free from poverty, injustice, and social exclusion — nurtured by a compassionate, faith-inspired community.",
        footer:
          "Resilient communities. Self-reliant families. A society bound together by solidarity and hope.",
      },
      {
        icon: "fa-solid fa-bullseye",
        title: "Mission",
        body: "To <strong>assist people in need</strong> and promote their integral human development, drawing on the spirit of Charity expressed through the Word of God and Catholic Social Teaching.",
        footer:
          "We serve without discrimination — reaching the poorest, most marginalized, and often forgotten members of society.",
      },
      {
        icon: "fa-solid fa-gem",
        title: "Core Values",
        body:
          "Six principles guide every program, every partnership, and every act of service we carry out across Rwanda:",
        chips: [
          "Compassion",
          "Human Dignity",
          "Solidarity",
          "Hope",
          "Subsidiarity",
          "Partnership",
        ],
        cta_label: "Read more",
        cta_href: "/about#values",
      },
    ],
    stats_bar: {
      items: [
        { value: "67+", label: "Years of Service" },
        { value: "9", label: "Diocesan Networks" },
        { value: "150K+", label: "Lives Touched" },
        { value: "59+", label: "Staff & Volunteers" },
      ],
      cta_label: "Explore our story",
      cta_href: "/about",
    },
  },
  map_section: {
    eyebrow: "Find Us",
    heading: "Our Location on",
    heading_accent: "G-Map",
    subtext:
      "Visit us at the Caritas Rwanda offices in Kigali — we'd love to welcome you.",
    map_a_title: "Street View",
    map_a_subtitle: "Explore our surroundings in 360°",
    map_a_embed_url:
      "https://www.google.com/maps/embed?pb=!4v1776831990082!6m8!1m7!1shQopyAPx9qTD4VQMaDmVfg!2m2!1d-1.948423749421037!2d30.05942523532954!3f245.44809355904687!4f1.5795459231316045!5f0.7820865974627469",
    map_b_title: "Caritas Rwanda HQ",
    map_b_subtitle: "Kigali, Rwanda — get directions",
    map_b_embed_url:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.5112492331314!2d30.05660827473925!3d-1.9485541980337648!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca425b5be2a55%3A0xcc6cf890e6ae864!2sCaritas%20Rwanda!5e0!3m2!1sen!2srw!4v1776832048548!5m2!1sen!2srw"
  },
  stats_banner: {
    layout: "strip",
    badge: "FY 2025",
    title_lead: "OUR",
    title_accent: "RESOURCES",
    subtitle: "Program Impacts",
    cta_label: "Explore our programs",
    cta_href: "#programs",
    items: [
      {
        number_core: "66",
        number_suffix: "+",
        label: "Years of Service",
        variant: "red",
        strip_icon: "clock",
      },
      {
        number_core: "7",
        number_suffix: "M+",
        label: "People Served",
        variant: "blue",
        strip_icon: "people",
      },
      {
        number_core: "10",
        number_suffix: "",
        label: "Diocesan Caritas",
        variant: "teal",
        strip_icon: "church",
      },
      {
        number_core: "56",
        number_suffix: "K+",
        label: "Active Volunteers",
        variant: "red",
        strip_icon: "hands-heart",
      },
      {
        number_core: "120",
        number_suffix: "",
        label: "Catholic Health Facilities",
        variant: "blue",
        strip_icon: "heart-pulse",
      },
      {
        number_core: "$72",
        number_suffix: "M",
        label: "Budget Mobilized (2015–2024)",
        variant: "teal",
        strip_icon: "money",
      },
    ],
  },
  featured_quote: {
    tone: "dark",
    name: "H.E. Mgr. Anaclet Mwumvaneza",
    subtitle: "Bishop of Nyundo Diocese<br/>Chairperson, Caritas Rwanda",
    quote:
      "Catholic Church is proud of Caritas Rwanda's **66 years of services** to Rwandans, especially its contribution to socio-economic development, health promotion, paying particular attention to the poor, the sick, the elderly, people living with disabilities, refugees — as well as building a just and resilient society.\n\nMay this be not only a reminder of the past, but above all an invitation to continue the mission of charity and service to the poor, so that the Gospel may continue to be **Good News for every Rwandan**.",
    meta: "Chairperson's Statement — 125th Jubilee of Evangelization, 2025",
    photo_url: ""
  },
  timeline: {
    eyebrow: "Our History",
    eyebrow_icon: "fa-clock-rotate-left",
    title: "Six Decades of Faith & Service",
    subtitle:
      "From a small charity established by Catholic Bishops to a nationwide humanitarian network — our journey spans over 66 years of unwavering service to the most vulnerable Rwandans.",
    anchor_id: "history",
    items: []
  },
  pillar_cards: {
    eyebrow: "Who We Are",
    eyebrow_icon: "fa-bullseye",
    title: "Mission, Vision & Values",
    subtitle:
      "Guided by the Word of God and the principles of Catholic Social Teaching, every action we take is rooted in dignity, solidarity, and justice.",
    anchor_id: "mission",
    pillars: []
  },
  values_grid: {
    eyebrow: "Core Values",
    eyebrow_icon: "fa-star",
    title: "What We Stand For",
    subtitle:
      "Eleven guiding principles that shape every program, decision, and relationship within Caritas Rwanda — rooted in the Gospel and Catholic Social Teaching.",
    anchor_id: "values",
    items: []
  },
  network_section: {
    eyebrow: "Our Network",
    eyebrow_icon: "fa-network-wired",
    title: "Reaching Every Corner of Rwanda",
    subtitle:
      "From 2 founding dioceses in 1959 to a network of 10 Diocesan Caritas spanning the entire country — our reach grows deeper every year.",
    anchor_id: "network",
    stats: [],
    dioceses: []
  },
  diocese_map_section: {
    ...DEFAULT_DIOCESE_MAP_SECTION_CONTENT,
    dioceses: DEFAULT_DIOCESE_MAP_SECTION_CONTENT.dioceses.map((d) => ({ ...d })),
  },
  leadership_grid: {
    ...LEADERSHIP_CHRONICLE_DEFAULT_CONTENT,
  },
  news_article_feed: {},
  publications_library: {},
  news_footer: {
    title: "Stay connected",
    body:
      "Follow Caritas Rwanda for programme news and humanitarian updates across all dioceses.",
  },
  video_gallery: {
    eyebrow: "Watch & Learn",
    eyebrow_icon: "fa-circle-play",
    heading_lead: "Stories in",
    heading_accent: "Motion",
    subtitle:
      "Field reports, campaign films, and event highlights from across the Caritas Rwanda network.",
    layout: "spotlight",
    show_categories: true,
    all_label: "All videos",
    cta_label: "",
    cta_url: "",
    videos: [
      {
        id: "v-1",
        title: "Caritas Rwanda — Year in review",
        description:
          "A short look back at programmes and people we walked alongside this year.",
        youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        category: "Highlights",
        duration: "4:21",
        published_label: "Featured",
      },
      {
        id: "v-2",
        title: "Inside our community campaigns",
        description:
          "Volunteers and partners share what these months on the ground meant for them.",
        youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        category: "Campaigns",
        duration: "3:08",
        published_label: "Recent",
      },
      {
        id: "v-3",
        title: "Voices from the field",
        description:
          "Beneficiaries and field staff describe the work in their own words.",
        youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        category: "Stories",
        duration: "6:42",
        published_label: "Popular",
      },
    ],
  },
};

export const SECTION_ICONS: Record<string, any> = {
  hero: Layers,
  text_block: AlignLeft,
  image_grid: LayoutGrid,
  testimonial: Quote,
  cta: Megaphone,
  partners: Handshake,
  news_cards: Newspaper,
  contact_info: MapPin,
  gallery: Images,
  divider: Minus,
  program_cards: LayoutTemplate,
  home_about: Landmark,
  map_section: Map,
  featured_campaign: Sparkles,
  stats_banner: BarChart3,
  featured_quote: Quote,
  timeline: History,
  pillar_cards: Columns2,
  values_grid: Star,
  network_section: Globe2,
  diocese_map_section: Compass,
  leadership_grid: Users,
  news_article_feed: LayoutList,
  publications_library: BookOpen,
  news_footer: Mail,
  video_gallery: PlayCircle,
};

export const SECTION_LABELS: Record<string, string> = {
  hero: "Hero Section",
  text_block: "Text Block",
  image_grid: "Image Grid",
  testimonial: "Testimonial",
  cta: "Call to Action",
  partners: "Partners Logos",
  news_cards: "News & Stories",
  contact_info: "Contact & Map",
  gallery: "Image Gallery",
  divider: "Divider Line",
  program_cards: "Our Program",
  home_about: "Home — About story",
  map_section: "Our Location",
  featured_campaign: "Featured campaign",
  stats_banner: "Our resources",
  featured_quote: "Featured quote (chairperson)",
  timeline: "History timeline",
  pillar_cards: "Mission / vision / pillars",
  values_grid: "Values grid",
  network_section: "Network & dioceses",
  diocese_map_section: "Diocese network map",
  leadership_grid: "Leadership chronicle (timeline)",
  news_article_feed: "Article listing",
  publications_library: "Publications library",
  news_footer: "News footer strip",
  video_gallery: "Video gallery (YouTube)",
};
