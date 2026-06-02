require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const programs = [
  // Social Welfare
  {
    category: 'social-welfare',
    title: 'IGIRE-Gimbuka Activity',
    slug: 'igire-gimbuka-activity',
    subtitle: 'Be Resilient, Be Self Reliant',
    excerpt: 'A five-year U.S Government funded program (2022- 2027), aims to reduce vulnerability and incidence of HIV and GBV among Orphans and Vulnerable Children and their families.',
    body: 'A five-year U.S Government funded program (2022- 2027), aims to reduce vulnerability and incidence of HIV and GBV among Orphans and Vulnerable Children and their families.',
    location: 'Karongi, Nyamasheke, Rutsiro, and Rubavu District',
    contact_phone: '+250 078X XXX XXX',
    status: 'published',
    featured: true,
    sort_order: 10
  },
  {
    category: 'social-welfare',
    title: 'Graduation Project',
    slug: 'graduation-project',
    subtitle: 'Pathways to Economic Inclusion and Self-reliance',
    excerpt: 'A three-year project (2025-2027) funded by the UNHCR, aims to promote economic inclusion and self-reliance of refugees and their host communities in Rwanda.',
    body: 'A three-year project (2025-2027) funded by the UNHCR, aims to promote economic inclusion and self-reliance of refugees and their host communities in Rwanda.',
    location: 'Nyamagabe, Gisagara, Karongi, Kirehe, and Gatibo District',
    contact_phone: '+250 078X XXX XXX',
    status: 'published',
    featured: false,
    sort_order: 20
  },
  {
    category: 'social-welfare',
    title: 'Dukore Twigire Project',
    slug: 'dukore-twigire-project',
    subtitle: 'Poverty Alleviation Coalition',
    excerpt: 'A three-year WV-funded project (2024 - 2027), aims to enhance self-reliance and create durable solutions for refugees and host communities following a graduation approach.',
    body: 'A three-year WV-funded project (2024 - 2027), aims to enhance self-reliance and create durable solutions for refugees and host communities following a graduation approach.',
    location: 'Karongi District',
    contact_phone: '+250 078X XXX XXX',
    status: 'published',
    featured: false,
    sort_order: 30
  },
  {
    category: 'social-welfare',
    title: 'ATM Gashora',
    slug: 'atm-gashora',
    subtitle: '...........................................',
    excerpt: 'A............................................',
    body: 'A............................................',
    location: 'Bugesera District',
    contact_phone: '+250 078X XXX XXX',
    status: 'published',
    featured: false,
    sort_order: 40
  },

  // Health
  {
    category: 'health',
    title: 'ECD Project',
    slug: 'ecd-project',
    subtitle: 'Inclusive Nutrition & Early Childhood Development',
    excerpt: "A three-year Plan International Rwanda funded project (2025- 2027), aims to improve caregivers' and communities' knowledge of positive parenting, hygiene and sanitation, balanced diet preparation, and early childhood learning.",
    body: "A three-year Plan International Rwanda funded project (2025- 2027), aims to improve caregivers' and communities' knowledge of positive parenting, hygiene and sanitation, balanced diet preparation, and early childhood learning.",
    location: 'Bugesera, Gatsibo, and Nyaruguru districts',
    contact_phone: '+250 078X XXX XXX',
    status: 'published',
    featured: true,
    sort_order: 10
  },
  {
    category: 'health',
    title: 'RBF Malaria and RISE',
    slug: 'rbf-malaria-and-rise',
    subtitle: 'Results-Based Financing',
    excerpt: 'is funded by the Global Fund in partnership with Rwanda’s Ministry of Health/Rwanda Biomedical Center, aims to reduce malaria-related morbidity and mortality.',
    body: 'is funded by the Global Fund in partnership with Rwanda’s Ministry of Health/Rwanda Biomedical Center, aims to reduce malaria-related morbidity and mortality.',
    location: '............................. District',
    contact_phone: '+250 078X XXX XXX',
    status: 'published',
    featured: false,
    sort_order: 20
  },
  {
    category: 'health',
    title: 'UOF Nkuza Neza',
    slug: 'uof-nkuza-neza',
    subtitle: '...........................................',
    excerpt: '...................................................................................................................',
    body: '...................................................................................................................',
    location: 'Nyarugenge and Rulindo District',
    contact_phone: '+250 078X XXX XXX',
    status: 'published',
    featured: false,
    sort_order: 30
  },
  {
    category: 'health',
    title: 'ECD Digitalization',
    slug: 'ecd-digitalization',
    subtitle: '...........................................',
    excerpt: '...................................................................................................................',
    body: '...................................................................................................................',
    location: 'Rulindo, Nyarugenge, Kicukiro, Rwamagana, Ngoma, Kirehe, Huye, Nyaruguru, Rusizi, Karongi District',
    contact_phone: '+250 078X XXX XXX',
    status: 'published',
    featured: false,
    sort_order: 40
  },
  {
    category: 'health',
    title: 'STRONG',
    slug: 'strong',
    subtitle: '...........................................',
    excerpt: '...................................................................................................................',
    body: '...................................................................................................................',
    location: 'Karongi, Nyamasheke, Rutsiro, and Rubavu District',
    contact_phone: '+250 078X XXX XXX',
    status: 'published',
    featured: false,
    sort_order: 50
  },
  {
    category: 'health',
    title: 'HIV/TB Prevention',
    slug: 'hiv-tb-prevention',
    subtitle: '...........................................',
    excerpt: '...................................................................................................................',
    body: '...................................................................................................................',
    location: '.............................................. District',
    contact_phone: '+250 078X XXX XXX',
    status: 'published',
    featured: false,
    sort_order: 60
  },

  // Development
  {
    category: 'development',
    title: 'Gera Ku Ntego Project',
    slug: 'gera-ku-ntego-project',
    subtitle: 'Youth Project',
    excerpt: 'funded by Catholic Relief Services, aims to enhance their collective action to improve youth access to formal finance for their small/medium-sized enterprise.',
    body: 'funded by Catholic Relief Services, aims to enhance their collective action to improve youth access to formal finance for their small/medium-sized enterprise.',
    location: 'Rwamagana, Kayonza and Kirehe Districts',
    contact_phone: '+250 078X XXX XXX',
    status: 'published',
    featured: true,
    sort_order: 10
  },
  {
    category: 'development',
    title: 'PEES',
    slug: 'pees',
    subtitle: 'Programme d’ encadrement economique et social des jeunes vulnerables',
    excerpt: 'Funded by Secours Catholique/ Caritas France, aiming to improve the living conditions of vulnerable young people in 19 parishes of the Diocese of Gikongoro and 21 parishes of the Diocese of Cyangugu.',
    body: 'Funded by Secours Catholique/ Caritas France, aiming to improve the living conditions of vulnerable young people in 19 parishes of the Diocese of Gikongoro and 21 parishes of the Diocese of Cyangugu.',
    location: 'Rusizi, Nyamasheke, Nyamagabe... District',
    contact_phone: '+250 078X XXX XXX',
    status: 'published',
    featured: false,
    sort_order: 20
  },
  {
    category: 'development',
    title: 'TUNGA Project',
    slug: 'tunga-project',
    subtitle: '...........................................',
    excerpt: '...................................................................................................................',
    body: '...................................................................................................................',
    location: 'Kirehe District',
    contact_phone: '+250 078X XXX XXX',
    status: 'published',
    featured: false,
    sort_order: 30
  },
  {
    category: 'development',
    title: 'Tubeho Neza Aheza',
    slug: 'tubeho-neza-aheza',
    subtitle: '...........................................',
    excerpt: '...................................................................................................................',
    body: '...................................................................................................................',
    location: 'Kirehe District',
    contact_phone: '+250 078X XXX XXX',
    status: 'published',
    featured: false,
    sort_order: 40
  },
  {
    category: 'development',
    title: 'Umugore Ku Isonga',
    slug: 'umugore-ku-isonga',
    subtitle: '...........................................',
    excerpt: '...................................................................................................................',
    body: '...................................................................................................................',
    location: 'Bugesera District',
    contact_phone: '+250 078X XXX XXX',
    status: 'published',
    featured: false,
    sort_order: 50
  }
];

async function run() {
  try {
    console.log('Fetching program categories...');
    const { data: categories, error: catError } = await supabase.from('program_categories').select('*');
    if (catError) throw catError;

    if (!categories || categories.length === 0) {
      console.error('No program categories found in the database. Cannot insert programs.');
      process.exit(1);
    }

    const getCategoryId = (slug) => {
      const cat = categories.find(c => c.slug === slug);
      if (!cat) throw new Error(`Category not found for slug: ${slug}`);
      return cat.id;
    };

    const toInsert = programs.map(p => {
      const { category, ...rest } = p;
      return {
        ...rest,
        category_id: getCategoryId(category)
      };
    });

    console.log('Clearing existing programs...');
    const { error: delError } = await supabase.from('programs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (delError) throw delError;
    console.log('Cleared successfully.');

    console.log('Inserting new programs...');
    const { error: insError } = await supabase.from('programs').insert(toInsert);
    if (insError) throw insError;
    console.log('Inserted programs successfully.');
  } catch (error) {
    console.error('Error:', error);
  }
}

run();
