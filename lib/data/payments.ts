"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function completeTestBankTransfer(orderId: number) {
  if (process.env.PAYMENT_TEST_MODE !== 'true') {
    return { success: false, error: "Chức năng xác nhận thanh toán thử chỉ khả dụng trong môi trường kiểm thử." };
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Không tìm thấy phiên đăng nhập" };
  }

  try {
    const adminClient = createAdminClient();
    
    // Call the security-definer RPC that requires Admin access
    // We pass the user.id to ensure the admin RPC still validates ownership
    const { error: rpcError } = await adminClient.rpc('complete_test_payment', {
      p_order_id: orderId,
      p_user_id: user.id
    });

    if (rpcError) {
      console.error("Lỗi hoàn tất test payment:", rpcError);
      return { success: false, error: rpcError.message || "Lỗi cập nhật đơn hàng" };
    }

    revalidatePath('/account/orders');
    return { success: true };

  } catch (err) {
    console.error("Lỗi hoàn tất test payment (try-catch):", err);
    return { success: false, error: "Lỗi hệ thống khi hoàn tất thanh toán mô phỏng." };
  }
}
