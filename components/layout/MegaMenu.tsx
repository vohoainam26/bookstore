"use client";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";
import { categories } from "@/lib/mockData";

interface MegaMenuProps {
  activeKey: string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const MEGA_CONFIG = {
  sach: {
    title: "Danh mục Sách",
    featured: {
      label: "Sách bán chạy tuần này",
      image: "https://picsum.photos/seed/bestseller-books-stack/400/300",
      cta: "Xem tất cả",
      href: "/products?category=sach&sortBy=bestseller",
    },
    categories: [
      {
        name: "Tiểu thuyết",
        href: "/products?category=Tiểu thuyết",
        sub: [] as string[],
      },
      {
        name: "Tâm lý - Kỹ năng sống",
        href: "/products?category=Tâm lý - Kỹ năng sống",
        sub: [] as string[],
      },
      {
        name: "Thiếu nhi",
        href: "/products?category=Thiếu nhi",
        sub: [] as string[],
      },
      {
        name: "Giáo khoa - Tham khảo",
        href: "/products?category=Giáo khoa - Tham khảo",
        sub: [] as string[],
      },
      {
        name: "Kinh tế - Chính trị",
        href: "/products?category=Kinh tế - Chính trị - Pháp lý",
        sub: [] as string[],
      },
      {
        name: "Sách Ngoại Văn",
        href: "/products?category=Sách Ngoại Văn",
        sub: [] as string[],
      },
      {
        name: "Tiểu sử - Hồi ký",
        href: "/products?category=Tiểu sử - Hồi ký",
        sub: [] as string[],
      },
    ],
  },
  vpp: {
    title: "Văn phòng phẩm",
    featured: {
      label: "Sản phẩm mới",
      image: "https://picsum.photos/seed/stationery-collection-flat/400/300",
      cta: "Khám phá",
      href: "/products?category=van-phong-pham",
    },
    categories: [
      {
        name: "VPP - Bút",
        href: "/products?category=Văn phòng phẩm - Bút",
        sub: [] as string[],
      },
      {
        name: "VPP - Dụng cụ học sinh",
        href: "/products?category=Văn phòng phẩm - Dụng cụ học sinh",
        sub: [] as string[],
      },
      {
        name: "VPP - Dụng cụ văn phòng",
        href: "/products?category=Văn phòng phẩm - Dụng cụ văn phòng",
        sub: [] as string[],
      },
      {
        name: "VPP - Sản phẩm về giấy",
        href: "/products?category=Văn phòng phẩm - Sản phẩm về giấy",
        sub: [] as string[],
      },
      {
        name: "Bách hóa tổng hợp",
        href: "/products?category=Bách hóa tổng hợp",
        sub: [] as string[],
      },
      {
        name: "Đồ chơi - Lưu niệm",
        href: "/products?category=Đồ chơi - Lưu niệm",
        sub: [] as string[],
      },
    ],
  },
};

export default function MegaMenu({ activeKey, onMouseEnter, onMouseLeave }: MegaMenuProps) {
  const config = MEGA_CONFIG[activeKey as keyof typeof MEGA_CONFIG];
  if (!config) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="mega-menu-backdrop"
        style={{ zIndex: 40 }}
        onClick={onMouseLeave}
      />

      {/* Menu panel */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className="fixed left-0 right-0 z-50"
        style={{
          top: "72px",
          background: "var(--color-surface-overlay)",
          borderBottom: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-elevated)",
        }}
      >
        <div className="w-full mx-auto px-8 py-8" style={{ maxWidth: "1280px" }}>
          <div className="grid grid-cols-12 gap-8">
            {/* Categories */}
            <div className="col-span-8 grid grid-cols-3 gap-x-8 gap-y-8 content-start">
              {config.categories.map((cat, i) => (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={cat.href}
                    className="font-semibold text-sm mb-3 block hover:underline"
                    style={{
                      color: "var(--color-brand)",
                      fontFamily: "var(--font-outfit)",
                    }}
                  >
                    {cat.name}
                  </Link>
                  <ul className="space-y-2">
                    {cat.sub.map((sub) => (
                      <li key={sub}>
                        <Link
                          href={`${cat.href}&sub=${sub.toLowerCase().replace(/ /g, "-")}`}
                          className="text-sm transition-colors duration-150 hover:text-[var(--color-brand)]"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          {sub}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>

            {/* Featured */}
            <motion.div
              className="col-span-4"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                className="rounded-2xl overflow-hidden group cursor-pointer"
                style={{ background: "var(--color-forest-50)" }}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={config.featured.image}
                    alt={config.featured.label}
                    className="w-full h-44 object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
                <div className="p-4">
                  <p className="font-semibold text-sm mb-2" style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-outfit)" }}>
                    {config.featured.label}
                  </p>
                  <Link
                    href={config.featured.href}
                    className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors duration-200 hover:text-[var(--color-accent-hover)]"
                    style={{ color: "var(--color-accent)" }}
                  >
                    {config.featured.cta}
                    <ArrowRight size={14} weight="bold" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
