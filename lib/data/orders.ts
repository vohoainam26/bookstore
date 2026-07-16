"use server";

import { createClient } from "@/lib/supabase/server";

export type OrderItem = {
  id: number;
  order_id: number;
  book_id: number | null;
  product_title: string;
  product_slug: string | null;
  product_image_url: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
};

export type Order = {
  id: number;
  order_code: string;
  status: "pending_payment" | "pending" | "confirmed" | "processing" | "shipping" | "delivered" | "cancelled";
  payment_status: "unpaid" | "awaiting_payment" | "paid" | "failed" | "refunded";
  payment_method: "cod" | "bank_transfer_qr" | "test_payment" | string;
  total_amount: number;
  shipping_fee: number;
  discount_amount: number;
  shipping_discount_amount: number;
  discount_code_snapshot?: string | null;
  discount_type_snapshot?: string | null;
  discount_value_snapshot?: number | null;
  created_at: string;
  customer_note?: string;
  shipping_address_snapshot: any;
  items?: OrderItem[];
};

export async function getUserOrders(status?: string, page = 1, limit = 10): Promise<{ orders: Order[]; total: number; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { orders: [], total: 0, error: "Bạn chưa đăng nhập" };

    let query = supabase.from("orders").select("*, items:order_items(*)", { count: "exact" }).eq("user_id", user.id);
    
    if (status && status !== "Tất cả") {
      // Map frontend status to backend status
      const statusMap: Record<string, string> = {
        "Chờ xác nhận": "pending",
        "Đã xác nhận": "confirmed",
        "Đang xử lý": "processing",
        "Đang giao": "shipping",
        "Đã giao": "delivered",
        "Đã hủy": "cancelled"
      };
      const dbStatus = statusMap[status];
      if (dbStatus) {
        query = query.eq("status", dbStatus);
      }
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Error fetching orders:", error);
      return { orders: [], total: 0, error: "Không thể lấy danh sách đơn hàng" };
    }

    return { orders: data as Order[], total: count || 0, error: null };
  } catch (error) {
    return { orders: [], total: 0, error: "Lỗi hệ thống khi tải đơn hàng" };
  }
}

export async function getOrderById(id: number): Promise<{ order: Order | null; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { order: null, error: "Bạn chưa đăng nhập" };

    const { data, error } = await supabase
      .from("orders")
      .select("*, items:order_items(*)")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Error fetching order detail:", error);
      return { order: null, error: "Đơn hàng không tồn tại hoặc bạn không có quyền xem" };
    }

    return { order: data as Order, error: null };
  } catch (error) {
    return { order: null, error: "Lỗi hệ thống khi tải chi tiết đơn hàng" };
  }
}
