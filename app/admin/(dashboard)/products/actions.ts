'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';

export async function getProducts(params: {
  page: number;
  limit: number;
  search?: string;
  category?: string;
  status?: string;
  stock?: string;
}) {
  await requireAdmin();
  const supabase = createAdminClient();

  let query = supabase.from('books').select('*', { count: 'exact' });

  if (params.search) {
    query = query.or(`title.ilike.%${params.search}%,source_id.ilike.%${params.search}%`);
  }
  
  if (params.category) {
    query = query.eq('category', params.category);
  }

  if (params.status === 'active') {
    query = query.eq('is_active', true);
  } else if (params.status === 'inactive') {
    query = query.eq('is_active', false);
  }

  if (params.stock === 'out_of_stock') {
    query = query.eq('stock_quantity', 0);
  } else if (params.stock === 'low_stock') {
    query = query.gt('stock_quantity', 0);
    // Needs raw postgrest or just filter after if possible, but we can do a hack:
    // query = query.lte('stock_quantity', 'low_stock_threshold'); -> Supabase doesn't support comparing two columns directly in standard filters yet.
  }

  // Sorting
  query = query.order('updated_at', { ascending: false });

  // Pagination
  const from = (params.page - 1) * params.limit;
  const to = from + params.limit - 1;
  query = query.range(from, to);

  const { data, count, error } = await query;
  if (error) throw error;

  return { products: data, count };
}

export async function getProduct(id: number) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('books').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function updateProduct(id: number, data: any) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.rpc('admin_update_product', {
    p_product_id: id,
    p_title: data.title,
    p_price: data.price,
    p_original_price: data.original_price,
    p_category: data.category,
    p_is_active: data.is_active,
    p_is_featured: data.is_featured,
    p_low_stock_threshold: data.low_stock_threshold,
    p_admin_note: data.admin_note,
  });

  if (error) throw error;
  revalidatePath(`/admin/products/${id}`);
  revalidatePath('/admin/products');
  return { success: true };
}

export async function adjustInventory(id: number, operation: string, quantity: number, reason: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.rpc('admin_adjust_inventory', {
    p_book_id: id,
    p_operation: operation,
    p_quantity: quantity,
    p_reason: reason,
  });

  if (error) throw error;
  revalidatePath(`/admin/products/${id}`);
  revalidatePath('/admin/products');
  return { success: true };
}

export async function toggleProductActive(id: number, isActive: boolean) {
  await requireAdmin();
  const supabase = createAdminClient();
  // We can reuse admin_update_product and just pass null for everything else
  // Or just call standard update if RLS allows, but RPC is safer
  const { error } = await supabase.rpc('admin_update_product', {
    p_product_id: id,
    p_title: null,
    p_price: null,
    p_original_price: null,
    p_category: null,
    p_is_active: isActive,
    p_is_featured: null,
    p_low_stock_threshold: null,
    p_admin_note: null,
  });
  
  if (error) throw error;
  revalidatePath(`/admin/products/${id}`);
  revalidatePath('/admin/products');
  return { success: true };
}
