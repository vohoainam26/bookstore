import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/StatusBadges";
import { OrderStatusForm, PaymentStatusForm } from "@/components/admin/OrderForms";

export default async function AdminOrderDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const orderId = Number(id);

  if (isNaN(orderId)) {
    notFound();
  }

  await requireAdmin();
  const supabase = await createClient();

  // Fetch order details
  const { data: order, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .eq("id", orderId)
    .single();

  if (error || !order) {
    notFound();
  }

  // Fetch payment transactions
  const { data: transactions } = await supabase
    .from("payment_transactions")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });

  // Fetch status history
  const { data: history } = await supabase
    .from("order_status_history")
    .select("*, profile:profiles(full_name)")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });

  const address = order.shipping_address_snapshot as any;
  const items = order.items || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/orders" className="text-gray-500 hover:text-gray-900 font-medium">
          &larr; Quay lại
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 font-display">Chi tiết đơn hàng #{order.order_code}</h1>
        <div className="ml-auto flex gap-2">
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={order.payment_status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 font-display">Sản phẩm</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                    <th className="px-6 py-3">Sản phẩm</th>
                    <th className="px-6 py-3 text-right">Đơn giá</th>
                    <th className="px-6 py-3 text-center">SL</th>
                    <th className="px-6 py-3 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((item: any) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img src={item.product_image_url} alt={item.product_title} className="w-12 h-16 object-cover rounded shadow-sm" />
                          <div className="text-sm font-medium text-gray-900">{item.product_title}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-900">
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.unit_price)}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-900">{item.quantity}</td>
                      <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.line_total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 flex justify-end">
              <div className="w-64 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tạm tính:</span>
                  <span className="font-medium text-gray-900">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phí vận chuyển:</span>
                  <span className="font-medium text-gray-900">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(order.shipping_fee)}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá ({order.discount_code_snapshot}):</span>
                    <span>-{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(order.discount_amount)}</span>
                  </div>
                )}
                {order.shipping_discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Miễn phí vận chuyển:</span>
                    <span>-{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(order.shipping_discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-200 pt-2 font-bold text-lg">
                  <span className="text-gray-900">Tổng cộng:</span>
                  <span className="text-red-600">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(order.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* History */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 font-display">Lịch sử cập nhật</h2>
            </div>
            <div className="p-6">
              {history && history.length > 0 ? (
                <div className="space-y-4">
                  {history.map((h: any) => (
                    <div key={h.id} className="flex gap-4">
                      <div className="mt-1 w-2.5 h-2.5 rounded-full bg-red-400 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Chuyển từ <span className="font-bold">{h.old_status}</span> sang <span className="font-bold">{h.new_status}</span>
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(h.created_at).toLocaleString("vi-VN")} bởi {h.profile?.full_name || "Admin"}
                        </p>
                        {h.note && (
                          <p className="text-sm mt-1 text-gray-600 bg-gray-50 p-2 rounded">{h.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Chưa có lịch sử cập nhật.</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Customer & Shipping */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 font-display">Khách hàng & Giao hàng</h2>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div>
                <p className="font-medium text-gray-900">Người nhận:</p>
                <p className="text-gray-600">{address?.recipient_name}</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Số điện thoại:</p>
                <p className="text-gray-600">{address?.phone}</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Địa chỉ:</p>
                <p className="text-gray-600">
                  {address?.address_line}, {address?.ward}, {address?.district}, {address?.province}
                </p>
              </div>
              {address?.delivery_note && (
                <div>
                  <p className="font-medium text-gray-900">Ghi chú giao hàng:</p>
                  <p className="text-gray-600">{address.delivery_note}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment & Order Status Update Forms */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 font-display">Cập nhật đơn hàng</h2>
            </div>
            <div className="p-6 space-y-6">
              <OrderStatusForm orderId={orderId} currentStatus={order.status} />
              
              <div className="border-t border-gray-200 pt-6">
                <PaymentStatusForm orderId={orderId} currentStatus={order.payment_status} />
              </div>
            </div>
          </div>
          
          {/* Payment Transactions */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 font-display">Lịch sử thanh toán</h2>
            </div>
            <div className="p-6 space-y-4">
              {transactions && transactions.length > 0 ? (
                transactions.map((tx: any) => (
                  <div key={tx.id} className="text-sm p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-gray-900">{tx.payment_method}</span>
                      <span className="font-bold text-gray-900">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(tx.amount)}</span>
                    </div>
                    <div className="text-xs text-gray-500 flex justify-between">
                      <span>{new Date(tx.created_at).toLocaleString("vi-VN")}</span>
                      <span className={tx.status === 'paid' ? 'text-green-600 font-bold' : 'text-gray-500'}>{tx.status}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Chưa có giao dịch thanh toán.</p>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
