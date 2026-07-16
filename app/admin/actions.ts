"use strict";
"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateOrderStatus(orderId: number, newStatus: string, note?: string) {
  try {
    await requireAdmin();
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("admin_update_order_status", {
      p_order_id: orderId,
      p_new_status: newStatus,
      p_note: note || null,
    });

    if (error) {
      console.error("RPC Error:", error);
      return { success: false, error: error.message || "Lỗi khi cập nhật trạng thái đơn hàng." };
    }

    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath(`/admin/orders`);
    revalidatePath(`/admin`);

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi hệ thống." };
  }
}

export async function updatePaymentStatus(orderId: number, newStatus: string, note?: string) {
  try {
    await requireAdmin();
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("admin_update_payment_status", {
      p_order_id: orderId,
      p_new_status: newStatus,
      p_note: note || null,
    });

    if (error) {
      console.error("RPC Error:", error);
      return { success: false, error: error.message || "Lỗi khi cập nhật trạng thái thanh toán." };
    }

    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath(`/admin/orders`);
    revalidatePath(`/admin`);
    revalidatePath(`/admin/payments`);

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi hệ thống." };
  }
}
