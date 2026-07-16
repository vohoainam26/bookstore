'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdminPermission } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getStaffList() {
  await requireAdminPermission('staff.view');
  const supabase = createAdminClient();

  const { data: staff, error } = await supabase
    .from('profiles')
    .select('*, roles:admin_user_roles(is_active, role:admin_roles(code, name))')
    .eq('role', 'admin')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return staff;
}

export async function getStaffDetail(id: string) {
  await requireAdminPermission('staff.view');
  const supabase = createAdminClient();

  const { data: staff, error } = await supabase.from('profiles').select('*').eq('id', id).single();
  if (error) throw error;

  const { data: userRoles } = await supabase
    .from('admin_user_roles')
    .select('*, assigned_by_user:profiles!admin_user_roles_assigned_by_fkey(full_name), role:admin_roles(code, name, is_active, description, permissions:admin_role_permissions(permission:admin_permissions(code, name, module)))')
    .eq('user_id', id);

  const { data: allRoles } = await supabase.from('admin_roles').select('*').eq('is_active', true);

  return { staff, userRoles: userRoles || [], allRoles: allRoles || [] };
}

export async function assignRole(userId: string, roleCode: string) {
  await requireAdminPermission('roles.manage');
  const supabase = createAdminClient();
  const { error } = await supabase.rpc('admin_assign_role', {
    p_user_id: userId,
    p_role_code: roleCode
  });
  if (error) throw error;
  revalidatePath(`/admin/staff/${userId}`);
  revalidatePath('/admin/staff');
}

export async function removeRole(userId: string, roleCode: string) {
  await requireAdminPermission('roles.manage');
  const supabase = createAdminClient();
  const { error } = await supabase.rpc('admin_remove_role', {
    p_user_id: userId,
    p_role_code: roleCode
  });
  if (error) throw error;
  revalidatePath(`/admin/staff/${userId}`);
  revalidatePath('/admin/staff');
}
