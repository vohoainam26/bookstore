'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdminPermission } from '@/lib/auth';

export async function getAuditLogs({
  page = 1,
  limit = 50,
  action = '',
  entity_type = ''
}: {
  page?: number;
  limit?: number;
  action?: string;
  entity_type?: string;
}) {
  await requireAdminPermission('audit.view');
  const supabase = createAdminClient();

  let query = supabase
    .from('admin_audit_logs')
    .select('*, admin:profiles!admin_audit_logs_admin_id_fkey(full_name, email:id)', { count: 'exact' });

  if (action) {
    query = query.ilike('action', `%${action}%`);
  }
  if (entity_type) {
    query = query.eq('entity_type', entity_type);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  query = query.order('created_at', { ascending: false }).range(from, to);

  const { data, count, error } = await query;
  if (error) throw error;

  return { logs: data, count };
}
