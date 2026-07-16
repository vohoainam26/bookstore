'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';

export async function getReviews(params: {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  rating?: string;
}) {
  await requireAdmin();
  const supabase = createAdminClient();

  let query = supabase.from('product_reviews').select('*, book:books(title, image_url)', { count: 'exact' });

  // Note: Searching inside related tables directly is tricky without RPC or inner joins. 
  // For a simple admin panel, we'll do basic filtering.
  if (params.status) {
    query = query.eq('status', params.status);
  }

  if (params.rating) {
    query = query.eq('rating', parseInt(params.rating));
  }

  query = query.order('created_at', { ascending: false });

  const from = (params.page - 1) * params.limit;
  const to = from + params.limit - 1;
  query = query.range(from, to);

  const { data, count, error } = await query;
  if (error) throw error;

  return { reviews: data, count };
}

export async function getReview(id: number) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('product_reviews')
    .select('*, book:books(id, title, image_url)')
    .eq('id', id)
    .single();
    
  if (error) throw error;
  return data;
}

export async function moderateReview(id: number, status: string, reason: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.rpc('admin_moderate_review', {
    p_review_id: id,
    p_new_status: status,
    p_reason: reason,
  });

  if (error) throw error;
  revalidatePath(`/admin/reviews/${id}`);
  revalidatePath('/admin/reviews');
  return { success: true };
}
