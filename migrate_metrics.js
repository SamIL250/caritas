require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migrate() {
  const { data: page } = await supabase.from('pages').select('id').eq('slug', 'metrics').single();
  if (!page) { console.error("No metrics page"); return; }
  const pid = page.id;

  // 1. Fetch KPIs
  const { data: kpis } = await supabase.from('metrics_kpis').select('*').eq('page_id', pid).order('sort_order', { ascending: true });
  if (kpis && kpis.length > 0) {
    await supabase.from('sections').insert({
      page_id: pid,
      type: 'metrics_kpis',
      content: { items: kpis },
      order: 1,
      visible: true
    });
    console.log("Migrated KPIs");
  }

  // 2. Fetch Stat Cards
  const { data: stats } = await supabase.from('metrics_stat_cards').select('*').eq('page_id', pid).order('sort_order', { ascending: true });
  if (stats && stats.length > 0) {
    await supabase.from('sections').insert({
      page_id: pid,
      type: 'metrics_stat_cards',
      content: { items: stats },
      order: 2,
      visible: true
    });
    console.log("Migrated Stat Cards");
  }

  // 3. Fetch Tabs
  const { data: tabs } = await supabase.from('metrics_sections').select('*').eq('page_id', pid).order('sort_order', { ascending: true });
  if (tabs && tabs.length > 0) {
    for (const tab of tabs) {
      let type = 'metrics_program';
      if (tab.tab_key === 'overview') type = 'metrics_overview';
      if (tab.tab_key === 'reach') type = 'metrics_reach';

      await supabase.from('sections').insert({
        page_id: pid,
        type: type,
        content: { ...tab.content, tab_key: tab.tab_key, tab_label: tab.tab_label, tab_icon: tab.tab_icon },
        order: tab.sort_order + 3,
        visible: tab.visible
      });
    }
    console.log("Migrated Tabs");
  }

  console.log("Done");
}

migrate();
