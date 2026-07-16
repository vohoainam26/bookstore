import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { StatCard } from "@/components/admin/StatCard";
import { ShoppingCart, CurrencyCircleDollar, Clock, Truck } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/StatusBadges";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const supabase = await createClient();

  // Fetch recent orders
  const { data: recentOrders } = await supabase
    .from("orders")
    .select("id, order_code, total_amount, status, payment_status, created_at, shipping_address_snapshot->recipient_name")
    .order("created_at", { ascending: false })
    .limit(5);

  // Fetch stats for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString();

  const [
    { count: totalOrdersToday },
    { count: pendingOrders },
    { count: shippingOrders },
    { data: revenueData }
  ] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }).gte("created_at", todayStr),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "shipping"),
    supabase.from("orders").select("total_amount").gte("created_at", todayStr).eq("payment_status", "paid")
  ]);

  const todayRevenue = revenueData?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 font-display">Tổng quan</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Đơn hàng hôm nay"
          value={totalOrdersToday || 0}
          icon={ShoppingCart}
          color="blue"
        />
        <StatCard
          title="Doanh thu hôm nay"
          value={new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(todayRevenue)}
          icon={CurrencyCircleDollar}
          color="green"
        />
        <StatCard
          title="Chờ xác nhận"
          value={pendingOrders || 0}
          icon={Clock}
          color="yellow"
        />
        <StatCard
          title="Đang giao hàng"
          value={shippingOrders || 0}
          icon={Truck}
          color="purple"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-8">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 font-display">Đơn hàng gần đây</h2>
          <Link href="/admin/orders" className="text-sm font-medium text-red-600 hover:text-red-700">
            Xem tất cả &rarr;
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="px-6 py-3">Mã đơn</th>
                <th className="px-6 py-3">Khách hàng</th>
                <th className="px-6 py-3">Tổng tiền</th>
                <th className="px-6 py-3">Trạng thái</th>
                <th className="px-6 py-3">Thanh toán</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentOrders && recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/admin/orders/${order.id}`} className="text-red-600 hover:underline font-medium">
                        {order.order_code}
                      </Link>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(order.created_at).toLocaleString("vi-VN")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {String((order as any).recipient_name || "Unknown")}
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Chưa có đơn hàng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
