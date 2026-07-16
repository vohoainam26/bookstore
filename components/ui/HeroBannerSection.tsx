"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  CaretLeft,
  CaretRight,
  Tag,
  Percent,
  Lightning,
  Gift,
  Truck,
  Star,
  BookOpen,
  Pencil,
  Bag,
  Ticket,
  Confetti,
  GameController,
  Baby,
  ShoppingCartSimple,
} from "@phosphor-icons/react";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const MAIN_SLIDES = [
  {
    id: 1,
    title: "Sách Hay Giá Tốt\nMùa Hè 2025",
    subtitle: "Hàng nghìn đầu sách chính hãng, giảm đến 50%",
    badge: "HOT DEAL",
    badgeColor: "#ef4444",
    cta: "Mua ngay",
    ctaLink: "/products",
    bg: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=900&h=500&fit=crop&q=80",
  },
  {
    id: 2,
    title: "Văn Phòng Phẩm\nCao Cấp Nhập Khẩu",
    subtitle: "Bút máy, sổ da – đẳng cấp viết lách đỉnh cao",
    badge: "MỚI VỀ",
    badgeColor: "#059669",
    cta: "Khám phá",
    ctaLink: "/products",
    bg: "linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)",
    image: "https://images.unsplash.com/photo-1519567770579-c2fc5836e2d0?w=900&h=500&fit=crop&q=80",
  },
  {
    id: 3,
    title: "Quà Tặng Ý Nghĩa\nGói Miễn Phí",
    subtitle: "Mỗi đơn hàng đặc biệt được gói quà xinh xắn miễn phí",
    badge: "ƯU ĐÃI",
    badgeColor: "#d97706",
    cta: "Chọn quà ngay",
    ctaLink: "/products",
    bg: "linear-gradient(135deg, #78350f 0%, #92400e 50%, #b45309 100%)",
    image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=900&h=500&fit=crop&q=80",
  },
];

const STATIC_BANNERS = [
  {
    id: 1,
    title: "Sổ Tay Nhật Ký",
    sub: "Giảm đến 30%",
    bg: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)",
    image: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&h=280&fit=crop&q=80",
    link: "/products?category=so-tay",
  },
  {
    id: 2,
    title: "Sách Thiếu Nhi",
    sub: "Mới về kho hôm nay",
    bg: "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=280&fit=crop&q=80",
    link: "/products?category=thieu-nhi",
  },
];

const PROMO_CARDS = [
  {
    id: 1,
    title: "Flash Sale 12H",
    sub: "Giảm thêm 20%",
    Icon: Lightning,
    bg: "#fff1f2",
    border: "#fecaca",
    iconBg: "#fee2e2",
    iconColor: "#dc2626",
  },
  {
    id: 2,
    title: "Mã Giảm Giá",
    sub: "Nhập SACHVIET50",
    Icon: Ticket,
    bg: "#fff7ed",
    border: "#fed7aa",
    iconBg: "#ffedd5",
    iconColor: "#ea580c",
  },
  {
    id: 3,
    title: "Combo Tiết Kiệm",
    sub: "Mua 2 tặng 1",
    Icon: Gift,
    bg: "#fdf4ff",
    border: "#e9d5ff",
    iconBg: "#f3e8ff",
    iconColor: "#9333ea",
  },
  {
    id: 4,
    title: "Free Ship 0đ",
    sub: "Đơn từ 199.000đ",
    Icon: Truck,
    bg: "#f0fdf4",
    border: "#bbf7d0",
    iconBg: "#dcfce7",
    iconColor: "#16a34a",
  },
];

const QUICK_LINKS = [
  { id: 1, label: "Sale\nGiữa Tháng", Icon: Percent, iconBg: "#fee2e2", iconColor: "#dc2626" },
  { id: 2, label: "Mã Giảm\nGiá", Icon: Ticket, iconBg: "#ffedd5", iconColor: "#ea580c" },
  { id: 3, label: "Đồ Chơi\nTrẻ Em", Icon: GameController, iconBg: "#fef9c3", iconColor: "#ca8a04" },
  { id: 4, label: "Sách\nThiếu Nhi", Icon: Baby, iconBg: "#dcfce7", iconColor: "#16a34a" },
  { id: 5, label: "Sách\nVăn Học", Icon: BookOpen, iconBg: "#dbeafe", iconColor: "#2563eb" },
  { id: 6, label: "Văn Phòng\nPhẩm", Icon: Pencil, iconBg: "#ede9fe", iconColor: "#7c3aed" },
  { id: 7, label: "Flash\nSale", Icon: Lightning, iconBg: "#fee2e2", iconColor: "#e11d48" },
  { id: 8, label: "Quà\nTặng", Icon: Gift, iconBg: "#fce7f3", iconColor: "#db2777" },
  { id: 9, label: "Hàng\nMới Về", Icon: Star, iconBg: "#fff7ed", iconColor: "#f59e0b" },
  { id: 10, label: "Giỏ\nHàng", Icon: Bag, iconBg: "#ecfeff", iconColor: "#0891b2" },
];

// ─── MAIN SLIDER ──────────────────────────────────────────────────────────────

function MainSlider() {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback(
    (next: number) => setCurrent((next + MAIN_SLIDES.length) % MAIN_SLIDES.length),
    []
  );

  useEffect(() => {
    timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % MAIN_SLIDES.length), 4500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const slide = MAIN_SLIDES[current];

  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl" style={{ minHeight: "360px" }}>
      {/* Background */}
      <div
        className="absolute inset-0 transition-all duration-700"
        style={{ background: slide.bg }}
      />
      <img
        src={slide.image}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-30 transition-opacity duration-700"
        key={slide.id}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center px-8 py-10" style={{ minHeight: "360px" }}>
        {/* Badge */}
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white mb-4 w-fit"
          style={{ background: slide.badgeColor }}
        >
          <Lightning size={11} weight="fill" />
          {slide.badge}
        </span>

        {/* Title */}
        <h2
          className="text-white font-extrabold leading-tight mb-3"
          style={{
            fontSize: "clamp(1.4rem, 2.5vw, 2rem)",
            fontFamily: "var(--font-display)",
            whiteSpace: "pre-line",
            textShadow: "0 2px 12px rgba(0,0,0,0.4)",
          }}
        >
          {slide.title}
        </h2>

        <p className="text-white/75 text-sm mb-6 max-w-xs leading-relaxed">{slide.subtitle}</p>

        <Link
          href={slide.ctaLink}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 hover:opacity-90 hover:scale-105 active:scale-95 w-fit"
          style={{ background: slide.badgeColor, color: "white" }}
        >
          <ShoppingCartSimple size={15} weight="fill" />
          {slide.cta}
        </Link>
      </div>

      {/* Arrow buttons */}
      <button
        onClick={() => go(current - 1)}
        aria-label="Slide trước"
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-white/30 active:scale-95"
        style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.25)", color: "white" }}
      >
        <CaretLeft size={16} weight="bold" />
      </button>
      <button
        onClick={() => go(current + 1)}
        aria-label="Slide tiếp"
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-white/30 active:scale-95"
        style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.25)", color: "white" }}
      >
        <CaretRight size={16} weight="bold" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
        {MAIN_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            aria-label={`Slide ${i + 1}`}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === current ? "22px" : "7px",
              height: "7px",
              background: i === current ? "white" : "rgba(255,255,255,0.4)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── STATIC BANNERS ───────────────────────────────────────────────────────────

function StaticBanners() {
  return (
    <div className="flex flex-col gap-4 h-full">
      {STATIC_BANNERS.map((banner) => (
        <Link
          key={banner.id}
          href={banner.link}
          className="relative flex-1 overflow-hidden rounded-xl group cursor-pointer"
          style={{ background: banner.bg, minHeight: "0" }}
        >
          <img
            src={banner.image}
            alt={banner.title}
            className="absolute inset-0 w-full h-full object-cover opacity-50 transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
          <div className="relative z-10 h-full flex flex-col justify-center p-5">
            <p className="text-white font-extrabold text-base leading-tight mb-1" style={{ fontFamily: "var(--font-display)" }}>
              {banner.title}
            </p>
            <p className="text-white/75 text-xs mb-3">{banner.sub}</p>
            <span
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-white w-fit transition-transform duration-200 group-hover:scale-105"
              style={{ background: "rgba(239,68,68,0.9)" }}
            >
              MUA NGAY <CaretRight size={10} weight="bold" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

// ─── PROMO CARDS ROW ──────────────────────────────────────────────────────────

function PromoCardsRow() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {PROMO_CARDS.map((card) => {
        const { Icon } = card;
        return (
          <div
            key={card.id}
            className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            style={{
              background: card.bg,
              border: `1.5px solid ${card.border}`,
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: card.iconBg }}
            >
              <Icon size={20} weight="fill" style={{ color: card.iconColor }} />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm leading-tight text-gray-800 truncate">{card.title}</p>
              <p className="text-xs text-gray-500 truncate">{card.sub}</p>
            </div>
            <button
              className="ml-auto flex-shrink-0 px-2.5 py-1 rounded-md text-xs font-bold text-white transition-all duration-150 hover:opacity-85 active:scale-95"
              style={{ background: "#ef4444" }}
            >
              MUA
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── QUICK LINKS ROW ─────────────────────────────────────────────────────────

function QuickLinksRow() {
  return (
    <div className="flex justify-between items-start gap-1 overflow-x-auto pb-1">
      {QUICK_LINKS.map(({ id, label, Icon, iconBg, iconColor }) => (
        <button
          key={id}
          className="flex flex-col items-center gap-1.5 px-2 flex-shrink-0 group transition-transform duration-200 hover:-translate-y-1"
          style={{ minWidth: "64px" }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 group-hover:shadow-md group-hover:scale-110"
            style={{ background: iconBg }}
          >
            <Icon size={22} weight="fill" style={{ color: iconColor }} />
          </div>
          <span
            className="text-center text-[11px] font-medium leading-tight text-gray-600 whitespace-pre-line"
            style={{ maxWidth: "64px" }}
          >
            {label}
          </span>
        </button>
      ))}
    </div>
  );
}

// ─── HERO BANNER SECTION ─────────────────────────────────────────────────────

export default function HeroBannerSection() {
  return (
    <section className="w-full py-4" style={{ background: "white" }}>
      <div className="max-w-7xl mx-auto w-full px-4 flex flex-col gap-4">

        {/* ROW 1 – Main slider (8col) + Static banners (4col) */}
        <div className="grid grid-cols-12 gap-4" style={{ minHeight: "360px" }}>
          {/* Slider – 8 cols */}
          <div className="col-span-12 lg:col-span-8">
            <MainSlider />
          </div>
          {/* Static banners – 4 cols */}
          <div className="col-span-12 lg:col-span-4">
            <StaticBanners />
          </div>
        </div>

        {/* ROW 2 – Promo cards grid (4 cards) */}
        <PromoCardsRow />

        {/* ROW 3 – Quick access links (10 icons) */}
        <div
          className="rounded-xl px-4 py-4"
          style={{ background: "white", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
        >
          <QuickLinksRow />
        </div>

      </div>
    </section>
  );
}
