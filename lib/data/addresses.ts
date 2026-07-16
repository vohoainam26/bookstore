"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ShippingAddress = {
  id: number;
  user_id: string;
  label: string | null;
  recipient_name: string;
  phone: string;
  address_line: string;
  ward: string | null;
  district: string | null;
  province: string;
  postal_code: string | null;
  delivery_note: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

export async function getUserAddresses(): Promise<{ addresses: ShippingAddress[]; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { addresses: [], error: "Bạn cần đăng nhập để xem địa chỉ" };
    }

    const { data, error } = await supabase
      .from("shipping_addresses")
      .select("*")
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching addresses:", error);
      return { addresses: [], error: "Không thể lấy danh sách địa chỉ" };
    }

    return { addresses: data as ShippingAddress[], error: null };
  } catch (error) {
    console.error("Exception fetching addresses:", error);
    return { addresses: [], error: "Lỗi hệ thống khi lấy địa chỉ" };
  }
}

export async function createAddress(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Bạn cần đăng nhập để thêm địa chỉ" };
    }

    const recipient_name = formData.get("recipient_name")?.toString().trim();
    const phone = formData.get("phone")?.toString().trim();
    const address_line = formData.get("address_line")?.toString().trim();
    const province = formData.get("province")?.toString().trim();
    const district = formData.get("district")?.toString().trim();
    const ward = formData.get("ward")?.toString().trim();
    const label = formData.get("label")?.toString().trim() || null;
    const is_default = formData.get("is_default") === "true";

    if (!recipient_name || !phone || !address_line || !province) {
      return { success: false, error: "Vui lòng điền đầy đủ các thông tin bắt buộc" };
    }

    const { error } = await supabase.from("shipping_addresses").insert({
      user_id: user.id,
      recipient_name,
      phone,
      address_line,
      province,
      district,
      ward,
      label,
      is_default,
    });

    if (error) {
      console.error("Error creating address:", error);
      return { success: false, error: "Không thể thêm địa chỉ" };
    }

    revalidatePath("/account/addresses");
    return { success: true };
  } catch (error) {
    console.error("Exception creating address:", error);
    return { success: false, error: "Lỗi hệ thống khi thêm địa chỉ" };
  }
}

export async function deleteAddress(id: number) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Bạn chưa đăng nhập" };

    const { error } = await supabase
      .from("shipping_addresses")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting address:", error);
      return { success: false, error: "Không thể xóa địa chỉ" };
    }

    revalidatePath("/account/addresses");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Lỗi hệ thống khi xóa địa chỉ" };
  }
}

export async function setDefaultAddress(id: number) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Bạn chưa đăng nhập" };

    const { error } = await supabase.rpc("set_default_shipping_address", {
      p_address_id: id,
    });

    if (error) {
      console.error("Error setting default address:", error);
      return { success: false, error: "Không thể đặt địa chỉ mặc định" };
    }

    revalidatePath("/account/addresses");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Lỗi hệ thống khi đặt địa chỉ mặc định" };
  }
}
