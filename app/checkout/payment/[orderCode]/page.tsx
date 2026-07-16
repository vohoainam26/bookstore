import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { generateVietQRUrl } from "@/lib/payments/bank-qr";
import PaymentConfirmButton from "./PaymentConfirmButton";
import { CheckCircle, Info, Copy, WarningCircle, Bank, SpinnerGap } from "@phosphor-icons/react/dist/ssr";

export default async function PaymentPage({ params }: { params: Promise<{ orderCode: string }> }) {
  const { orderCode } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/account/login?next=/checkout/payment/${orderCode}`);
  }

  // Fetch order
  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("order_code", orderCode)
    .eq("user_id", user.id)
    .single();

  if (error || !order) {
    console.error("PaymentPage fetch order error:", error, "orderCode:", orderCode, "userId:", user.id);
    notFound();
  }

  // Only allow bank transfer or test payment
  if (order.payment_method !== "bank_transfer_qr" && order.payment_method !== "test_payment") {
    redirect(`/checkout/success/${order.order_code}`);
  }

  if (order.payment_status === "paid") {
    redirect(`/checkout/success/${order.order_code}`);
  }

  const bankName = process.env.BANK_NAME || "Ngân hàng TMCP";
  const accountName = process.env.BANK_ACCOUNT_NAME || "";
  const accountNumber = process.env.BANK_ACCOUNT_NUMBER || "";
  
  // Try to generate dynamic QR, fallback if config missing
  let qrUrl = "";
  try {
    qrUrl = generateVietQRUrl(order.total_amount, order.order_code);
  } catch (err) {
    console.error("Lỗi tạo QR:", err);
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-[800px] mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-blue-600 p-6 text-white text-center">
            <h1 className="text-2xl font-bold">Thanh toán đơn hàng</h1>
            <p className="opacity-90 mt-1">Mã đơn: <strong>{order.order_code}</strong></p>
          </div>

          <div className="p-8">
            {order.payment_method === "test_payment" && (
              <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex gap-3 items-start">
                <WarningCircle size={24} weight="fill" className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold">Chế độ kiểm thử đang bật</h3>
                  <p className="text-sm mt-1 text-amber-700">Đây là đơn hàng thử nghiệm. Nút bên dưới sẽ mô phỏng quá trình giao dịch ngân hàng thành công và đánh dấu đơn là đã giao (delivered) để bạn có thể kiểm tra tính năng đánh giá sản phẩm.</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* QR Section */}
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
                <p className="text-gray-500 text-sm font-medium mb-4">Quét mã để thanh toán</p>
                {qrUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qrUrl} alt="Mã QR thanh toán" className="w-48 h-48 mix-blend-multiply" />
                ) : (
                  <div className="w-48 h-48 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
                    <Bank size={32} />
                  </div>
                )}
                <div className="mt-4 text-center">
                  <p className="text-xl font-bold text-red-600">{order.total_amount.toLocaleString("vi-VN")} đ</p>
                </div>
              </div>

              {/* Transfer Details */}
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Ngân hàng thụ hưởng</p>
                  <p className="font-bold text-gray-900">{bankName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Chủ tài khoản</p>
                  <p className="font-bold text-gray-900">{accountName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Số tài khoản</p>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-blue-600 text-lg">{accountNumber}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Nội dung chuyển khoản</p>
                  <div className="flex items-center gap-2 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <p className="font-bold text-gray-900 text-lg">{order.order_code}</p>
                  </div>
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <Info size={14} /> Vui lòng nhập chính xác nội dung này
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 border-t border-gray-100 pt-6 text-center">
              {process.env.PAYMENT_TEST_MODE === "true" || order.payment_method === "test_payment" ? (
                <PaymentConfirmButton orderId={order.id} />
              ) : (
                <div className="bg-blue-50 text-blue-800 p-4 rounded-xl inline-flex items-center gap-2 font-medium">
                  <SpinnerGap size={20} className="animate-spin" /> Hệ thống đang chờ xác nhận giao dịch...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
