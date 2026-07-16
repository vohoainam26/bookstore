import 'server-only';
import { createClient } from '@supabase/supabase-js';

// The admin client uses the service_role key to bypass RLS.
// It MUST ONLY be used in server-only modules and never exposed to the client.
export const createAdminClient = () => {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
    throw new Error('Missing Supabase admin environment variables');
  }
  
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};
