"use server";

import { createClient } from "@/lib/supabase/server";

export type CheckoutTotals = {
  subtotal: number;
  shipping_fee: number;
  discount_amount: number;
  shipping_discount_amount: number;
  total_amount: number;
  coupon_valid: boolean;
  coupon_code: string | null;
  coupon_name: string | null;
  discount_type: string | null;
  discount_value: number | null;
  message: string;
};

export async function previewCoupon(
  items: { book_id: number; quantity: number }[],
  couponCode: string | null
): Promise<{ success: boolean; data?: CheckoutTotals; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Bạn chưa đăng nhập." };
    }

    if (!items || items.length === 0) {
      return { success: false, error: "Giỏ hàng trống." };
    }

    const { data, error } = await supabase.rpc("preview_checkout_totals", {
      p_items: items,
      p_coupon_code: couponCode
    });

    if (error) {
      console.error("RPC error in previewCoupon:", error);
      return { success: false, error: "Có lỗi xảy ra khi tính toán giỏ hàng." };
    }

    return { success: true, data: data as CheckoutTotals };
  } catch (err: unknown) {
    console.error("Exception in previewCoupon:", err);
    return { success: false, error: "Lỗi hệ thống." };
  }
}
