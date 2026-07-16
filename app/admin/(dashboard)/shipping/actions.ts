'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdminPermission } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getShippingZones() {
  await requireAdminPermission('shipping.view');
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('shipping_zones')
    .select('*, locations:shipping_zone_locations(province, district)')
    .order('priority', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getShippingMethods() {
  await requireAdminPermission('shipping.view');
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('shipping_methods')
    .select('*, rates:shipping_rates(*)')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data;
}

export async function createShippingZone(data: any) {
  await requireAdminPermission('shipping.manage');
  const supabase = createAdminClient();

  const { error } = await supabase.rpc('admin_create_shipping_zone', {
    p_code: data.code,
    p_name: data.name,
    p_priority: data.priority,
    p_description: data.description
  });

  if (error) throw error;
  revalidatePath('/admin/shipping/zones');
}

export async function createShippingMethod(data: any) {
  await requireAdminPermission('shipping.manage');
  const supabase = createAdminClient();

  const { error } = await supabase.rpc('admin_create_shipping_method', {
    p_code: data.code,
    p_name: data.name,
    p_min_days: data.min_delivery_days,
    p_max_days: data.max_delivery_days,
    p_supports_cod: data.supports_cod
  });

  if (error) throw error;
  revalidatePath('/admin/shipping/methods');
}

export async function addZoneLocation(zoneId: number, province: string, district?: string) {
  await requireAdminPermission('shipping.manage');
  const supabase = createAdminClient();

  const { error } = await supabase.from('shipping_zone_locations').insert({
    zone_id: zoneId,
    province,
    district: district || null
  });

  if (error) throw error;
  revalidatePath('/admin/shipping/zones');
}
