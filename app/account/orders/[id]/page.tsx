import { getOrderById } from "@/lib/data/orders";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Receipt, CheckCircle } from "@phosphor-icons/react/dist/ssr";

const STATUS_MAP: Record<string, string> = {
  "pending": "Chờ xác nhận",
  "confirmed": "Đã xác nhận",
  "processing": "Đang xử lý",
  "shipping": "Đang giao",
  "delivered": "Đã giao",
  "cancelled": "Đã hủy"
};

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { order, error } = await getOrderById(Number(id));

  if (error || !order) {
    notFound();
  }

  const date = new Date(order.created_at).toLocaleString("vi-VN");
  const address = order.shipping_address_snapshot;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/account/orders" className="text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>
          Chi tiết đơn hàng #{order.order_code}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-xs">Sản phẩm</h3>
            <div className="space-y-4">
              {order.items?.map((item) => (
                <div key={item.id} className="flex gap-4 items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  {item.product_image_url ? (
                    <img src={item.product_image_url} alt={item.product_title} className="w-16 h-20 object-cover rounded-lg border border-gray-100" />
                  ) : (
                    <div className="w-16 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Receipt size={24} className="text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>{item.product_title}</p>
                    <div className="flex justify-between items-end mt-2">
                      <p className="text-sm text-gray-500">
                        {item.unit_price.toLocaleString("vi-VN")}đ <span className="text-xs">x{item.quantity}</span>
                      </p>
                      <p className="font-bold text-[var(--color-brand)] text-sm" style={{ fontFamily: "var(--font-outfit)" }}>
                        {item.line_total.toLocaleString("vi-VN")}đ
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column - Summary & Address */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-xs">Thông tin đơn hàng</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Ngày đặt</span>
                <span className="font-medium text-gray-900">{date}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Trạng thái</span>
                <span className="font-semibold text-[var(--color-brand)]">{STATUS_MAP[order.status] || order.status}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Thanh toán</span>
                <span className="font-medium text-gray-900">
                  {order.payment_status === "paid" ? <span className="text-green-600 flex items-center gap-1"><CheckCircle size={16}/> Đã thanh toán</span> : "Chưa thanh toán"}
                </span>
              </div>
            </div>

            <hr className="my-4 border-gray-100" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính</span>
                <span className="font-medium text-gray-900">
                  {order.items?.reduce((sum, item) => sum + item.line_total, 0).toLocaleString("vi-VN")}đ
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển</span>
                <span className="font-medium text-gray-900">{order.shipping_fee.toLocaleString("vi-VN")}đ</span>
              </div>
              {order.discount_code_snapshot && (
                <div className="flex justify-between text-blue-600 bg-blue-50 p-2 rounded mt-2">
                  <span>Mã giảm giá áp dụng</span>
                  <span className="font-medium">{order.discount_code_snapshot}</span>
                </div>
              )}
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-green-600 mt-2">
                  <span>Giảm giá sản phẩm</span>
                  <span className="font-medium">-{order.discount_amount.toLocaleString("vi-VN")}đ</span>
                </div>
              )}
              {order.shipping_discount_amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm phí vận chuyển</span>
                  <span className="font-medium">-{order.shipping_discount_amount.toLocaleString("vi-VN")}đ</span>
                </div>
              )}
            </div>


            <hr className="my-4 border-gray-100" />

            <div className="flex justify-between font-bold text-lg text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>
              <span>Tổng cộng</span>
              <span className="text-[var(--color-brand)]">{order.total_amount.toLocaleString("vi-VN")}đ</span>
            </div>

            {order.customer_note && (
              <>
                <hr className="my-4 border-gray-100" />
                <div className="text-sm">
                  <span className="text-gray-600 block mb-1">Ghi chú của bạn:</span>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100">{order.customer_note}</p>
                </div>
              </>
            )}

            {order.payment_status === 'paid' && order.status === 'delivered' && (order.payment_method === 'test_payment' || order.payment_method === 'bank_transfer_qr') && (
              <div className="mt-4 bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-xl text-xs">
                <strong>Giao dịch mô phỏng (TEST MODE)</strong><br />
                Đơn hàng này đã được xác nhận thanh toán bằng chức năng kiểm thử của hệ thống.
              </div>
            )}

            {order.status === 'pending_payment' && (order.payment_method === 'bank_transfer_qr' || order.payment_method === 'test_payment') && (
              <div className="mt-6">
                <Link 
                  href={`/checkout/payment/${order.order_code}`} 
                  className="w-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-colors"
                >
                  THANH TOÁN NGAY
                </Link>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-xs flex items-center gap-2">
              <MapPin size={16} /> Giao hàng đến
            </h3>
            <div className="text-sm space-y-1">
              <p className="font-semibold text-gray-900">{address.recipient_name}</p>
              <p className="text-gray-600">{address.phone}</p>
              <p className="text-gray-600 mt-2">{address.address_line}</p>
              <p className="text-gray-600">
                {[address.ward, address.district, address.province].filter(Boolean).join(", ")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
