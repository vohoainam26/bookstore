import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/StatusBadges";
import { Pagination } from "@/components/admin/Pagination";
import { OrderFilters } from "@/components/admin/OrderFilters";

export default async function AdminOrdersPage(props: {
  searchParams?: Promise<{
    search?: string;
    status?: string;
    payment_status?: string;
    page?: string;
  }>;
}) {
  await requireAdmin();
  const searchParams = await props.searchParams;
  const search = searchParams?.search || "";
  const status = searchParams?.status || "";
  const paymentStatus = searchParams?.payment_status || "";
  const page = Number(searchParams?.page) || 1;
  const limit = 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select("id, order_code, total_amount, status, payment_status, created_at, shipping_address_snapshot", { count: "exact" });

  if (status) {
    query = query.eq("status", status);
  }
  
  if (paymentStatus) {
    query = query.eq("payment_status", paymentStatus);
  }

  if (search) {
    query = query.or(`order_code.ilike.%${search}%,shipping_address_snapshot->>recipient_name.ilike.%${search}%`);
  }

  const { data: orders, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalPages = count ? Math.ceil(count / limit) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 font-display">Đơn hàng</h1>
      </div>

      <OrderFilters />

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="px-6 py-3">Mã đơn</th>
                <th className="px-6 py-3">Khách hàng</th>
                <th className="px-6 py-3">Ngày đặt</th>
                <th className="px-6 py-3">Tổng tiền</th>
                <th className="px-6 py-3">Trạng thái</th>
                <th className="px-6 py-3">Thanh toán</th>
                <th className="px-6 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders && orders.length > 0 ? (
                orders.map((order) => {
                  const recipient = (order.shipping_address_snapshot as any)?.recipient_name || "Unknown";
                  const phone = (order.shipping_address_snapshot as any)?.phone || "";
                  
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {order.order_code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{recipient}</div>
                        <div className="text-xs text-gray-500">{phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleString("vi-VN")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(order.total_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <PaymentStatusBadge status={order.payment_status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link href={`/admin/orders/${order.id}`} className="text-red-600 hover:text-red-900">
                          Chi tiết
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Không tìm thấy đơn hàng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination totalPages={totalPages} currentPage={page} />
      </div>
    </div>
  );
}
