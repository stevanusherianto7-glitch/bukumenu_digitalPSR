import { createClient } from '@supabase/supabase-js'; 
const supabase = createClient('https://zyalxogxdxeoisuwwmic.supabase.co', 'sb_publishable_Pk6QcpkTFCTMGDJo9cMQfQ_hPemJghI'); 
async function run() { 
  const { data, error } = await supabase.from('order_items').select('*').limit(1);
  console.log('Using REST API we cannot easily list tables. Let me query a common table names.');
  const tables = ['orders', 'transactions', 'order_status', 'completed_orders'];
  for (const t of tables) {
    const res = await supabase.from(t).select('id').limit(1);
    console.log(t, res.error ? res.error.message : 'EXISTS');
  }
} 
run();
