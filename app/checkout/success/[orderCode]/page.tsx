import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, Receipt, ArrowRight, BookOpen } from "@phosphor-icons/react/dist/ssr";

export default async function SuccessPage({ params }: { params: Promise<{ orderCode: string }> }) {
  const { orderCode } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/account/login`);
  }

  // Fetch order
  const { data: order, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("order_code", orderCode)
    .eq("user_id", user.id)
    .single();

  if (error || !order) {
    notFound();
  }

  const isTestCompleted = order.payment_status === "paid" && order.status === "delivered";

  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="max-w-[700px] mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-center p-10">
          <div className="flex justify-center mb-6">
            <CheckCircle size={80} weight="fill" className="text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Đặt hàng thành công!</h1>
          <p className="text-gray-600 mb-8">
            Cảm ơn bạn đã mua sắm. Mã đơn hàng của bạn là <strong className="text-gray-900">{order.order_code}</strong>
          </p>

          {isTestCompleted && (
            <div className="bg-green-50 text-green-800 p-4 rounded-xl mb-8 border border-green-200">
              <p className="font-semibold text-sm">Giao dịch mô phỏng trong môi trường kiểm thử (TEST MODE)</p>
              <p className="text-xs mt-1">Đơn hàng đã tự động được chuyển sang trạng thái <b>Đã giao (Delivered)</b> để bạn có thể kiểm tra tính năng Đánh Giá Sản Phẩm.</p>
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left border border-gray-100">
            <div className="grid grid-cols-2 gap-y-4 text-sm">
              <div className="text-gray-500">Tổng thanh toán</div>
              <div className="text-right font-bold text-red-600 text-lg">{order.total_amount.toLocaleString("vi-VN")} đ</div>

              <div className="text-gray-500">Phương thức thanh toán</div>
              <div className="text-right font-medium text-gray-900">
                {order.payment_method === 'cod' ? 'Tiền mặt khi nhận hàng' : order.payment_method === 'bank_transfer_qr' ? 'Chuyển khoản VietQR' : 'Thanh toán kiểm thử'}
              </div>

              <div className="text-gray-500">Trạng thái thanh toán</div>
              <div className="text-right font-medium">
                {order.payment_status === 'paid' ? <span className="text-green-600">Đã thanh toán</span> : 
                 order.payment_status === 'awaiting_payment' ? <span className="text-amber-600">Chờ thanh toán</span> : 
                 <span className="text-gray-600">Chưa thanh toán</span>}
              </div>

              <div className="text-gray-500">Trạng thái đơn hàng</div>
              <div className="text-right font-medium">
                 {order.status === 'delivered' ? <span className="text-green-600">Đã giao hàng</span> : 
                  order.status === 'pending_payment' ? <span className="text-amber-600">Chờ thanh toán</span> :
                  <span className="text-blue-600">Đang xử lý</span>}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href={`/account/orders/${order.id}`}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
            >
              <Receipt size={20} /> Xem chi tiết đơn
            </Link>
            <Link 
              href="/products"
              className="px-6 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              Tiếp tục mua sắm <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
