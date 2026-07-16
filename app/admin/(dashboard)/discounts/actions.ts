'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';

export async function getDiscounts(params: {
  page: number;
  limit: number;
  search?: string;
  status?: string;
}) {
  await requireAdmin();
  const supabase = createAdminClient();

  let query = supabase.from('discount_codes').select('*', { count: 'exact' });

  if (params.search) {
    query = query.or(`code.ilike.%${params.search}%,name.ilike.%${params.search}%`);
  }

  if (params.status === 'active') {
    query = query.eq('is_active', true);
  } else if (params.status === 'inactive') {
    query = query.eq('is_active', false);
  }

  query = query.order('created_at', { ascending: false });

  const from = (params.page - 1) * params.limit;
  const to = from + params.limit - 1;
  query = query.range(from, to);

  const { data, count, error } = await query;
  if (error) {
    console.error("GET DISCOUNTS ERROR:", error);
    throw new Error(`Failed to get discounts: ${error.message || JSON.stringify(error)}`);
  }

  return { discounts: data, count };
}

export async function getDiscount(id: number) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('discount_codes').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function createDiscount(data: any) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data: res, error } = await supabase.rpc('admin_create_discount_code', {
    p_code: data.code,
    p_name: data.name,
    p_description: data.description,
    p_discount_type: data.discount_type,
    p_discount_value: data.discount_value,
    p_min_order_amount: data.min_order_amount,
    p_max_discount_amount: data.max_discount_amount || null,
    p_usage_limit: data.usage_limit || null,
    p_usage_limit_per_user: data.usage_limit_per_user || 1,
    p_starts_at: data.starts_at || null,
    p_expires_at: data.expires_at || null,
    p_first_order_only: data.first_order_only || false,
  });

  if (error) throw error;
  revalidatePath('/admin/discounts');
  return { success: true, id: res.id };
}

export async function updateDiscount(id: number, data: any) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.rpc('admin_update_discount_code', {
    p_id: id,
    p_code: data.code,
    p_name: data.name,
    p_description: data.description,
    p_discount_type: data.discount_type,
    p_discount_value: data.discount_value,
    p_min_order_amount: data.min_order_amount,
    p_max_discount_amount: data.max_discount_amount || null,
    p_usage_limit: data.usage_limit || null,
    p_usage_limit_per_user: data.usage_limit_per_user || 1,
    p_starts_at: data.starts_at || null,
    p_expires_at: data.expires_at || null,
    p_first_order_only: data.first_order_only || false,
  });

  if (error) throw error;
  revalidatePath(`/admin/discounts/${id}`);
  revalidatePath('/admin/discounts');
  return { success: true };
}

export async function toggleDiscountActive(id: number, isActive: boolean) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.rpc('admin_set_discount_active', {
    p_id: id,
    p_is_active: isActive,
  });
  
  if (error) throw error;
  revalidatePath(`/admin/discounts/${id}`);
  revalidatePath('/admin/discounts');
  return { success: true };
}
