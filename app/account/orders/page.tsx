import Link from "next/link";
import { getUserOrders } from "@/lib/data/orders";
import { Hourglass, Truck, Check, X as XIcon, Package } from "@phosphor-icons/react/dist/ssr";

const STATUS_CONFIG: Record<string, { label: string; Icon: any; color: string; bg: string }> = {
  "pending": { label: "Chờ xác nhận", Icon: Hourglass, color: "#92400e", bg: "#fef3c7" },
  "confirmed": { label: "Đã xác nhận", Icon: Package, color: "#1e3a8a", bg: "#dbeafe" },
  "processing": { label: "Đang xử lý", Icon: Package, color: "#92400e", bg: "#fef3c7" },
  "shipping": { label: "Đang giao", Icon: Truck, color: "var(--color-brand)", bg: "var(--color-forest-50)" },
  "delivered": { label: "Đã giao", Icon: Check, color: "#065f46", bg: "#d1fae5" },
  "cancelled": { label: "Đã hủy", Icon: XIcon, color: "#991b1b", bg: "#fee2e2" },
};

export default async function OrdersPage() {
  const { orders, error } = await getUserOrders();

  if (error) {
    return <div className="p-6 text-center text-red-500 font-medium">{error}</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-6 text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>
        Lịch sử mua hàng
      </h2>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
          <Package size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">Bạn chưa có đơn hàng nào.</p>
          <Link href="/products" className="inline-block mt-4 px-6 py-2 rounded-full text-sm font-semibold text-white bg-[var(--color-brand)] transition-all hover:opacity-90">
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-12 px-6 py-3 text-xs font-semibold uppercase tracking-wider bg-gray-50 text-gray-500 border-b border-gray-100">
            <div className="col-span-3">Mã đơn</div>
            <div className="col-span-2">Ngày đặt</div>
            <div className="col-span-3">Trạng thái</div>
            <div className="col-span-2 text-right">Tổng tiền</div>
            <div className="col-span-2 text-right">Chi tiết</div>
          </div>

          {/* Rows */}
          {orders.map((order, i) => {
            const status = STATUS_CONFIG[order.status] || STATUS_CONFIG["pending"];
            const date = new Date(order.created_at).toLocaleDateString("vi-VN");

            return (
              <div
                key={order.id}
                className="grid grid-cols-2 md:grid-cols-12 px-6 py-4 items-center gap-2 hover:bg-gray-50 transition-colors border-b last:border-0 border-gray-100"
              >
                <div className="col-span-1 md:col-span-3">
                  <p className="font-bold text-sm text-[var(--color-brand)]" style={{ fontFamily: "var(--font-outfit)" }}>
                    {order.order_code}
                  </p>
                  <p className="text-xs mt-0.5 md:hidden text-gray-500">{date}</p>
                </div>

                <div className="hidden md:block md:col-span-2 text-sm text-gray-500">
                  {date}
                </div>

                <div className="col-span-1 md:col-span-3">
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ background: status.bg, color: status.color }}
                  >
                    <status.Icon size={11} weight="bold" />
                    {status.label}
                  </span>
                </div>

                <div className="hidden md:block md:col-span-2 text-right font-bold text-sm text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>
                  {order.total_amount.toLocaleString("vi-VN")}đ
                </div>

                <div className="col-span-2 md:col-span-2 flex justify-end">
                  {order.status === 'pending_payment' && (order.payment_method === 'bank_transfer_qr' || order.payment_method === 'test_payment') ? (
                    <Link
                      href={`/checkout/payment/${order.order_code}`}
                      className="text-xs font-bold px-4 py-1.5 rounded-full transition-all text-white bg-red-600 hover:bg-red-700"
                    >
                      Thanh toán ngay
                    </Link>
                  ) : (
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="text-xs font-medium px-4 py-1.5 rounded-full transition-all text-[var(--color-brand)] border border-[var(--color-forest-200)] hover:bg-[var(--color-forest-50)]"
                    >
                      Xem chi tiết
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
