'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdminPermission } from '@/lib/auth';

export async function getDashboardKPIs(startDate: Date, endDate: Date) {
  await requireAdminPermission('analytics.view');
  const supabase = createAdminClient();

  const { data, error } = await supabase.rpc('admin_get_dashboard_analytics', {
    p_start_date: startDate.toISOString().split('T')[0],
    p_end_date: endDate.toISOString().split('T')[0]
  });

  if (error) throw error;
  return data;
}

export async function getRevenueSeries(startDate: Date, endDate: Date) {
  await requireAdminPermission('analytics.view');
  const supabase = createAdminClient();

  const { data, error } = await supabase.rpc('admin_get_revenue_series', {
    p_start_date: startDate.toISOString().split('T')[0],
    p_end_date: endDate.toISOString().split('T')[0]
  });

  if (error) throw error;
  return data;
}

export async function getTopProducts(startDate: Date, endDate: Date) {
  await requireAdminPermission('analytics.view');
  const supabase = createAdminClient();

  // Simple query for top products using order_items joined with orders
  const { data, error } = await supabase
    .from('order_items')
    .select('book_id, product_name, quantity, line_total, order:orders!inner(payment_status, status, created_at)')
    .eq('order.payment_status', 'paid')
    .neq('order.status', 'cancelled')
    .gte('order.created_at', startDate.toISOString())
    .lt('order.created_at', endDate.toISOString());

  if (error) throw error;

  // Aggregate in JS for simplicity instead of complex RPC
  const productStats: Record<string, { name: string, quantity: number, revenue: number }> = {};
  
  data?.forEach((item: any) => {
    const id = item.book_id;
    if (!productStats[id]) {
      productStats[id] = { name: item.product_name, quantity: 0, revenue: 0 };
    }
    productStats[id].quantity += item.quantity;
    productStats[id].revenue += Number(item.line_total);
  });

  const sortedProducts = Object.values(productStats).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  return sortedProducts;
}
