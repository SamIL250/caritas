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
  PieChart,
  Activity,
  Presentation,
  TrendingUp,
  HelpCircle,
  Eye
} from "lucide-react";
import { DEFAULT_PARTNERS } from "@/lib/partners-defaults";
import { LEADERSHIP_CHRONICLE_DEFAULT_CONTENT } from "@/lib/about-leadership-defaults";
import {
  DEFAULT_MVV_STATEMENTS,
  DEFAULT_MVV_TITLE,
  DEFAULT_MVV_VALUE_ITEMS,
  DEFAULT_MVV_VALUES_EYEBROW,
  DEFAULT_MVV_VALUES_EYEBROW_ICON,
  DEFAULT_MVV_VALUES_TITLE,
} from "@/lib/mission-vision-values";
import { DEFAULT_DIOCESE_MAP_SECTION_CONTENT } from "@/lib/diocese-map-defaults";
import { CANONICAL_PROGRAMS } from "@/lib/program-cards-defaults";
import { DEFAULT_PROGRAMS_LIBRARY_SECTION } from "@/lib/programs-library-section";

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
      "Please reach out to us with any questions, partnership opportunities, or to learn more about our initiatives across Rwanda.",
    headquarters_label: "Headquarters",
    headquarters: "Kigali, Rwanda",
    phone_label: "Phone",
    phone: "(+250) 252 574 344",
    email_label: "Email",
    email: "info@caritasrwanda.org",
    hours_label: "Office Hours",
    office_hours: "Mon – Fri, 8:00 AM – 5:00 PM",
    form_title: "Send Us a Message",
    form_subtitle: "We'll get back to you within 24 hours.",
    form_fields: [
      { key: "name", type: "text", label: "Full Name", required: true, placeholder: "e.g. Jean Hakizimana" },
      { key: "email", type: "email", label: "Email Address", required: true, placeholder: "you@example.com" },
      { key: "phone", type: "tel", label: "Phone Number", required: false, placeholder: "+250 7xx xxx xxx" },
      { key: "organization", type: "text", label: "Organization", required: false, placeholder: "Your organization" },
      { key: "topic", type: "select", label: "Topic", required: true, placeholder: "Select a topic", options: ["General Inquiry", "Partnership", "Volunteering", "Donation", "Media"] },
      { key: "message", type: "textarea", label: "Your Message", required: true, placeholder: "Tell us how we can help you..." }
    ]
  },
  gallery: {
    images: [],
    caption: ""
  },
  program_cards: {
    eyebrow: "What We Do",
    heading: "Our Programs",
    subtitle:
      "Making a difference through Social Welfare, Health, and Development interventions with safe Finance and Administration services.",
    programs: CANONICAL_PROGRAMS.map((p) => ({ ...p })),
  },
  home_about: {
    title: "About Us",
    subtitle: "Caritas Rwanda Interventions Scale Through Its Network",
    missionText:
      "To assist people in needs and promote their integral human development, drawing on the Charity as per the Word of God.",
    values: [
      "Advocacy",
      "Compassion",
      "Environment Protection",
      "Equity",
      "Hope",
      "Human Dignity",
      "Justice",
      "Service",
      "Solidarity",
      "Stewardship and Accountability",
      "Subsidiarity and Partnership",
    ],
    visionText: "Promoting Human<br />Dignity for All",
    networkNodes: [
      { value: "1",       label: "Caritas Rwanda" },
      { value: "10",      label: "Diocesan Caritas" },
      { value: "229",     label: "Parish Caritas" },
      { value: "882",     label: "Sub-Parish Caritas" },
      { value: "29,141",  label: "Basic Christian Community Caritas" },
      { value: "56,345+", label: "Volunteers" },
    ],
  },
  map_section: {
    eyebrow: "Find Us",
    heading: "Our Location on",
    heading_accent: "The Map",
    subtext:
      "Visit us at the Caritas Rwanda offices in Kigali — we'd love to welcome you.",
    map_a_title: "Street View",
    map_a_subtitle: "Explore our surroundings in 360°",
    map_a_embed_url:
      "https://www.google.com/maps/embed?pb=!4v1776831990082!6m8!1m7!1shQopyAPx9qTD4VQMaDmVfg!2m2!1d-1.948423749421037!2d30.05942523532954!3f245.44809355904687!4f1.5795459231316045!5f0.7820865974627469",
    map_b_title: "Caritas Rwanda HQ",
    map_b_subtitle: "Kigali, Rwanda — get directions",
    map_b_embed_url:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.5112492331314!2d30.05660827473925!3d-1.9485541980337648!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca425b5be2a55%3A0xcc6cf890e6ae864!2sCaritas%20Rwanda!5e0!3m2!1sen!2srw!4v1776832048548!5m2!1sen!2srw",
    cta_label: "Send us a message",
    cta_url: "/contact",
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
    title: DEFAULT_MVV_TITLE,
    anchor_id: "mission",
    statements: DEFAULT_MVV_STATEMENTS.map((s) => ({ ...s })),
  },
  values_grid: {
    eyebrow: DEFAULT_MVV_VALUES_EYEBROW,
    eyebrow_icon: DEFAULT_MVV_VALUES_EYEBROW_ICON,
    title: DEFAULT_MVV_VALUES_TITLE,
    anchor_id: "values",
    items: DEFAULT_MVV_VALUE_ITEMS.map((v) => ({ ...v })),
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
  programs_library: { ...DEFAULT_PROGRAMS_LIBRARY_SECTION },
  faq_section: {
    eyebrow: "FAQ",
    title: "Frequently Asked Questions",
    items: [
      { question: "How can I donate to Caritas Rwanda?", answer: "You can donate by contacting our office directly..." },
      { question: "How can I volunteer with Caritas Rwanda?", answer: "We welcome volunteers at both our national headquarters in Kigali and through our 10 Diocesan Caritas offices..." },
      { question: "How can my organization partner with Caritas Rwanda?", answer: "Caritas Rwanda actively partners with NGOs, faith-based organizations, government agencies, and international donors." },
      { question: "How can I access Caritas Rwanda's annual reports and publications?", answer: "All annual reports, quarterly newsletters, and strategic plans are freely available on our Publications page." },
      { question: "Where are Caritas Rwanda's Diocesan offices located?", answer: "Caritas Rwanda has 10 Diocesan Caritas offices covering all provinces of Rwanda." },
    ],
  },
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
  metrics_kpis: {
    items: [
      { icon: "fa-people-group", value: "500K+", label: "Beneficiaries", color: "#ff9a6c" },
      { icon: "fa-church", value: "9", label: "Dioceses", color: "#4ade80" }
    ]
  },
  metrics_stat_cards: {
    items: [
      { icon: "fa-calendar-check", icon_color: "#911313", icon_bg: "rgba(145,19,19,0.08)", value: "1959", label: "Year Founded", sub_label: "By Catholic Bishops" }
    ]
  },
  metrics_overview: {
    tab_key: "overview",
    tab_label: "Organisation Overview",
    tab_icon: "fa-building-columns",
    heading: "Organisation Overview",
    subheading: "Key facts about Caritas Rwanda",
    highlights: [
      { value: "500K+", label: "Beneficiaries Reached", color: "#911313" }
    ]
  },
  metrics_program: {
    tab_key: "program",
    tab_label: "New Program",
    tab_icon: "fa-heart-pulse",
    name: "New Program",
    description: "Program description",
    icon: "fa-heart-pulse",
    icon_color: "#dc2626",
    icon_bg: "rgba(220,38,38,0.09)",
    accent_color: "#dc2626",
    stats: [{ value: "15,000+", label: "Reached" }],
    progress_bars: [{ label: "Progress", percent: 78 }],
    callout: "Highlight or insight"
  },
  metrics_reach: {
    tab_key: "reach",
    tab_label: "Geographic Reach",
    tab_icon: "fa-map-location-dot",
    heading: "Our Reach",
    subheading: "Coverage data",
    provinces: [
      { name: "Kigali City", color: "#911313", dioceses: 1, beneficiaries: "180,000+", districts: 3 }
    ]
  },
  impact_at_glance: {
    label: "Impact at a Glance",
    title: "Caritas Rwanda by the",
    title_accent: "Numbers",
    kpis: [
      { value: "500K+", label: "Beneficiaries Reached Annually", color: "#ff9a6c", size: "xl" },
      { value: "9", label: "Diocesan Caritas Offices Nationwide", color: "#4ade80", size: "lg" },
      { value: "50+", label: "Active Programmes", color: "#60a5fa", size: "sm" },
      { value: "12+", label: "Global Partners", color: "#c084fc", size: "lg" },
      { value: "120K+", label: "Families Supported", color: "#fbbf24", size: "sm" },
    ],
    programs: [
      {
        tab_key: 'health',
        tab_label: 'Health & ECD',
        tab_icon: 'fa-heart-pulse',
        name: 'Health & ECD',
        description: 'Early Childhood Development & community health',
        icon: 'fa-heart-pulse',
        accent_color: '#dc2626',
        slug: 'health',
        stats: [
          { value: '15,000+', label: 'Children Reached' },
          { value: '7', label: 'Dioceses Active' },
          { value: '340+', label: 'ECD Centres' },
        ],
      },
      {
        tab_key: 'social',
        tab_label: 'Social Welfare',
        tab_icon: 'fa-people-roof',
        name: 'Social Welfare',
        description: 'Savings groups, family support & community care',
        icon: 'fa-people-roof',
        accent_color: '#2563eb',
        slug: 'social-welfare',
        stats: [
          { value: '4,500+', label: 'Households' },
          { value: '35%', label: 'Income Growth' },
          { value: '12M+', label: 'RWF Saved' },
        ],
      },
      {
        tab_key: 'development',
        tab_label: 'Development',
        tab_icon: 'fa-seedling',
        name: 'Development',
        description: 'Livelihoods, agriculture & youth entrepreneurship',
        icon: 'fa-seedling',
        accent_color: '#16a34a',
        slug: 'development',
        stats: [
          { value: '3,500+', label: 'Households' },
          { value: '24', label: 'PSPs Graduated' },
          { value: '5', label: 'Districts Covered' },
        ],
      },
      {
        tab_key: 'admin',
        tab_label: 'Administration',
        tab_icon: 'fa-building-columns',
        name: 'Administration & Finance',
        description: 'Governance, capacity building & resource management',
        icon: 'fa-building-columns',
        accent_color: '#7c3aed',
        slug: 'finance-administration',
        stats: [
          { value: '9', label: 'Dioceses Aligned' },
          { value: '29th', label: 'General Assembly' },
          { value: '100%', label: 'Audit Compliance' },
        ],
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
  programs_library: LayoutGrid,
  news_footer: Mail,
  video_gallery: PlayCircle,
  faq_section: HelpCircle,
  metrics_kpis: Activity,
  metrics_stat_cards: PieChart,
  metrics_overview: Presentation,
  metrics_program: TrendingUp,
  metrics_reach: Map,
  impact_at_glance: Eye,

};

export const SECTION_LABELS: Record<string, string> = {
  hero: "Hero Section",
  text_block: "Text Block",
  image_grid: "Image Grid",
  testimonial: "Testimonial",
  cta: "Call to Action",
  partners: "Partners Logos",
  news_cards: "News & Stories",
  contact_info: "Contact form",
  gallery: "Image Gallery",
  divider: "Divider Line",
  program_cards: "Our Programs",
  home_about: "Home — About story",
  map_section: "Find Us",
  featured_campaign: "Featured campaign",
  stats_banner: "Our resources",
  featured_quote: "Featured quote (chairperson)",
  timeline: "History timeline",
  pillar_cards: "Vision & mission",
  values_grid: "Core values",
  network_section: "Network & dioceses",
  diocese_map_section: "Diocese network map",
  leadership_grid: "Leadership chronicle (timeline)",
  news_article_feed: "Article listing",
  publications_library: "Publications library",
  programs_library: "Programs library",
  news_footer: "News footer strip",
  video_gallery: "Video gallery (YouTube)",
  metrics_kpis: "Metrics KPIs Strip",
  metrics_stat_cards: "Metrics Stat Cards",
  metrics_overview: "Metrics Overview Tab",
  metrics_program: "Metrics Program Tab",
  metrics_reach: "Metrics Reach Tab",
  faq_section: "FAQ Section",
  impact_at_glance: "Impact at a Glance",
};
