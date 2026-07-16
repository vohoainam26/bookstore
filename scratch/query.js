const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

async function main() {
  const { data: books, error: err } = await supabase.from('books').select('*').limit(1);
  if (err) console.error('Books Error:', err);
  else console.log('Books Sample:', JSON.stringify(books[0], null, 2));
}

main();
