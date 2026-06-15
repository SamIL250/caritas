require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

async function fix() {
  const { data, error } = await supabase.from('page_revisions').select('id, content');
  if (error) {
    console.error(error);
    return;
  }
  for (const row of data) {
    let updated = false;
    let contentStr = JSON.stringify(row.content);
    if (contentStr.includes('10 Caritas')) {
      contentStr = contentStr.replace(/10 Caritas/g, '9 Caritas');
      updated = true;
    }
    if (contentStr.includes('10 Dioceses')) {
      contentStr = contentStr.replace(/10 Dioceses/g, '9 Dioceses');
      updated = true;
    }
    if (updated) {
      await supabase.from('page_revisions').update({ content: JSON.parse(contentStr) }).eq('id', row.id);
      console.log(`Updated page_revisions ${row.id}`);
    }
  }

  const { data: pages, error: pError } = await supabase.from('pages').select('id, current_content');
  if (pError) return;
  for (const row of pages) {
    let updated = false;
    let contentStr = JSON.stringify(row.current_content);
    if (contentStr.includes('10 Caritas')) {
      contentStr = contentStr.replace(/10 Caritas/g, '9 Caritas');
      updated = true;
    }
    if (contentStr.includes('10 Dioceses')) {
      contentStr = contentStr.replace(/10 Dioceses/g, '9 Dioceses');
      updated = true;
    }
    if (updated) {
      await supabase.from('pages').update({ current_content: JSON.parse(contentStr) }).eq('id', row.id);
      console.log(`Updated pages ${row.id}`);
    }
  }

  console.log('Done');
}
fix();
