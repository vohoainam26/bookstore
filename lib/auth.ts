import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type Profile = {
  id: string;
  full_name: string | null;
  role: 'user' | 'admin';
  is_active: boolean;
};

export async function getCurrentProfile() {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { user: null, profile: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return { user, profile: profile as Profile | null };
}

export async function requireAdmin() {
  const { user, profile } = await getCurrentProfile();

  if (!user) {
    redirect("/admin/login");
  }

  if (!profile || !profile.is_active || profile.role !== "admin") {
    redirect("/admin/unauthorized");
  }

  return { user, profile };
}

export async function requireAdminPermission(permissionCode: string) {
  const { user, profile } = await requireAdmin();
  
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('has_admin_permission', { p_permission_code: permissionCode });
  
  if (error || data !== true) {
    console.error(`Permission denied: ${permissionCode} for user ${user.id}`);
    redirect("/admin/unauthorized");
  }

  return { user, profile };
}
