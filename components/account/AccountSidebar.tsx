"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClockCounterClockwise, Gear, MapPin } from "@phosphor-icons/react";

const MENU_ITEMS = [
  { href: "/account/orders", label: "Lịch sử mua hàng", Icon: ClockCounterClockwise },
  { href: "/account", label: "Cài đặt tài khoản", Icon: Gear, exact: true },
  { href: "/account/addresses", label: "Địa chỉ lưu sẵn", Icon: MapPin },
];

export default function AccountSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Quick stats could be fetched via API or left out here to simplify */}
      <nav
        className="rounded-2xl overflow-hidden"
        style={{ background: "var(--color-surface-overlay)", border: "1px solid var(--color-border)" }}
      >
        {MENU_ITEMS.map(({ href, label, Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname?.startsWith(href);
          
          return (
            <Link
              key={href}
              href={href}
              className="w-full flex items-center gap-3 px-5 py-4 text-sm font-medium text-left transition-all duration-200"
              style={{
                background: isActive ? "var(--color-forest-50)" : "transparent",
                color: isActive ? "var(--color-brand)" : "var(--color-text-secondary)",
                borderLeft: isActive ? "3px solid var(--color-brand)" : "3px solid transparent",
                fontFamily: "var(--font-outfit)",
              }}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
