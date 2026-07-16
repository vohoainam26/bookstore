'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdminPermission } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getCustomers({
  page = 1,
  limit = 20,
  search = '',
  status = ''
}: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) {
  await requireAdminPermission('customers.view');
  const supabase = createAdminClient();

  let query = supabase.from('profiles').select('*, orders(id, total_amount, payment_status, status)', { count: 'exact' }).eq('role', 'user');

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%,id.eq.${search}`);
  }

  if (status === 'active') {
    query = query.eq('is_active', true);
  } else if (status === 'blocked') {
    query = query.eq('is_active', false);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.order('created_at', { ascending: false }).range(from, to);

  const { data: profiles, count, error } = await query;
  if (error) throw error;

  // Compute stats client-side or map it here
  const customers = profiles.map((p: any) => {
    const validOrders = p.orders?.filter((o: any) => o.payment_status === 'paid' && o.status !== 'cancelled') || [];
    const totalSpent = validOrders.reduce((sum: number, o: any) => sum + Number(o.total_amount), 0);
    return {
      ...p,
      orders_count: p.orders?.length || 0,
      total_spent: totalSpent
    };
  });

  return { customers, count };
}

export async function getCustomer(id: string) {
  await requireAdminPermission('customers.view');
  const supabase = createAdminClient();

  const { data: customer, error } = await supabase.from('profiles').select('*').eq('id', id).single();
  if (error) throw error;

  const { data: orders } = await supabase.from('orders').select('*').eq('user_id', id).order('created_at', { ascending: false }).limit(20);
  const { data: notes } = await supabase.from('customer_admin_notes').select('*, admin:profiles!customer_admin_notes_admin_id_fkey(full_name)').eq('customer_id', id).order('created_at', { ascending: false });

  const validOrders = orders?.filter((o: any) => o.payment_status === 'paid' && o.status !== 'cancelled') || [];
  const totalSpent = validOrders.reduce((sum: number, o: any) => sum + Number(o.total_amount), 0);

  return {
    ...customer,
    orders: orders || [],
    notes: notes || [],
    stats: {
      total_orders: orders?.length || 0,
      delivered_orders: orders?.filter(o => o.status === 'delivered').length || 0,
      total_spent: totalSpent
    }
  };
}

export async function blockCustomer(id: string, reason: string) {
  await requireAdminPermission('customers.status.manage');
  const supabase = createAdminClient();
  const { error } = await supabase.rpc('admin_set_customer_active', {
    p_customer_id: id,
    p_is_active: false,
    p_reason: reason
  });
  if (error) throw error;
  revalidatePath(`/admin/customers/${id}`);
  revalidatePath('/admin/customers');
}

export async function unblockCustomer(id: string) {
  await requireAdminPermission('customers.status.manage');
  const supabase = createAdminClient();
  const { error } = await supabase.rpc('admin_set_customer_active', {
    p_customer_id: id,
    p_is_active: true,
    p_reason: null
  });
  if (error) throw error;
  revalidatePath(`/admin/customers/${id}`);
  revalidatePath('/admin/customers');
}

export async function addCustomerNote(id: string, note: string) {
  await requireAdminPermission('customers.notes.create');
  const supabase = createAdminClient();
  const { error } = await supabase.rpc('admin_add_customer_note', {
    p_customer_id: id,
    p_note: note
  });
  if (error) throw error;
  revalidatePath(`/admin/customers/${id}`);
}
