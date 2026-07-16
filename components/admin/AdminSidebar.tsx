"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartLineUp, ShoppingCart, CurrencyCircleDollar, Storefront, House, SignOut, Books, Ticket, Star } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const NAV_ITEMS = [
    { name: "Tổng quan", href: "/admin", icon: ChartLineUp, exact: true },
    { name: "Đơn hàng", href: "/admin/orders", icon: ShoppingCart, exact: false },
    { name: "Thanh toán", href: "/admin/payments", icon: CurrencyCircleDollar, exact: false },
    { name: "Sản phẩm", href: "/admin/products", icon: Books, exact: false },
    { name: "Mã giảm giá", href: "/admin/discounts", icon: Ticket, exact: false },
    { name: "Đánh giá", href: "/admin/reviews", icon: Star, exact: false },
  ];

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-full flex flex-col fixed left-0 top-0 bottom-0 z-10">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <Link href="/admin" className="flex items-center gap-2 text-xl font-bold text-gray-900" style={{ fontFamily: "var(--font-display)" }}>
          <Storefront size={24} weight="fill" className="text-red-500" />
          <span>Admin</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-red-50 text-red-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon size={20} weight={isActive ? "fill" : "regular"} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 flex flex-col gap-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <House size={20} />
          Về cửa hàng
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full text-left"
        >
          <SignOut size={20} />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
