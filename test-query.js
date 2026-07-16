const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const envFile = fs.readFileSync('.env', 'utf8');
const envs = envFile.split('\n').reduce((acc, line) => {
  const [key, val] = line.split('=');
  if (key && val) acc[key.trim()] = val.trim();
  return acc;
}, {});

const supabase = createClient(envs['NEXT_PUBLIC_SUPABASE_URL'], envs['NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY']);

async function test() {
  const { data, count, error } = await supabase.from('discount_codes').select('*', { count: 'exact' }).range(0, 19);
  console.log('Error:', error);
  console.log('Count:', count);
  console.log('Data:', data?.length);
}

test();
