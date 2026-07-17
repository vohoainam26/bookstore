import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase"; // Assuming this is standard setup, or we should use SSR client
import Link from "next/link";
import { Package } from "@phosphor-icons/react/dist/ssr";

export const metadata = {
  title: "Theo dõi đơn hàng | Trang Sách",
  description: "Kiểm tra tình trạng vận chuyển đơn hàng của bạn.",
};

export default async function TrackOrderPage() {
  // If we want true SSR auth we should use @supabase/ssr, but for simplicity here we can render a client-side wrapper or a generic page with a button.
  // We'll provide a nice UI that guides them to log in to see their orders.

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center py-16 px-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Package size={32} weight="fill" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: "var(--font-display)" }}>
          Theo dõi đơn hàng
        </h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Để xem trạng thái chi tiết đơn hàng của bạn, vui lòng đăng nhập vào tài khoản. Chúng tôi thiết lập tính năng này nhằm bảo mật thông tin đơn hàng cá nhân của bạn.
        </p>
        
        <div className="space-y-3">
          <Link 
            href="/account/orders"
            className="flex w-full items-center justify-center px-6 py-3 rounded-full font-bold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: "var(--color-brand)" }}
          >
            Đăng nhập / Xem lịch sử đơn hàng
          </Link>
          <Link 
            href="/"
            className="flex w-full items-center justify-center px-6 py-3 rounded-full font-semibold text-gray-700 transition-all hover:bg-gray-100"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </main>
  );
}
