"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  CaretLeft,
  CaretRight,
  Truck,
  Shield,
  Package,
  HeadCircuit,
} from "@phosphor-icons/react";
import ProductCard from "@/components/ui/ProductCard";
import { heroSlides } from "@/lib/mockData";
import HeroBannerSection from "@/components/ui/HeroBannerSection";
import BestSellersSection from "@/components/ui/BestSellersSection";
import { getBooks } from "@/lib/books";

// ---- Hero Section ----
function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = (next: number, dir: number) => {
    setDirection(dir);
    setCurrent((next + heroSlides.length) % heroSlides.length);
  };

  useEffect(() => {
    timer.current = setInterval(() => {
      setDirection(1);
      setCurrent((c) => (c + 1) % heroSlides.length);
    }, 5000);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, []);

  const slide = heroSlides[current];

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ minHeight: "min(85dvh, 680px)", background: "var(--color-forest-900)" }}
    >
      {/* Background image with overlay */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          <img
            src={slide.imageUrl}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-forest-950)]/90 via-[var(--color-forest-950)]/55 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 mx-auto w-full px-4 sm:px-6 lg:px-8 h-full flex items-center" style={{ minHeight: "inherit", maxWidth: "1280px" }}>
        <div className="max-w-lg py-20">
          {/* Promo badge */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`badge-${current}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-5"
              style={{
                background: "var(--color-accent)",
                color: "var(--color-stone-950)",
                fontFamily: "var(--font-outfit)",
              }}
            >
              <Truck size={13} weight="fill" />
              {slide.badge}
            </motion.div>
          </AnimatePresence>

          {/* Headline */}
          <AnimatePresence mode="wait">
            <motion.h1
              key={`title-${current}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-none tracking-tight mb-4"
              style={{ fontFamily: "var(--font-outfit)", whiteSpace: "pre-line" }}
            >
              {slide.headline}
            </motion.h1>
          </AnimatePresence>

          {/* Subtext */}
          <AnimatePresence mode="wait">
            <motion.p
              key={`sub-${current}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
              className="text-base md:text-lg mb-8 max-w-sm"
              style={{ color: "rgb(255 255 255 / 0.75)" }}
            >
              {slide.subtext}
            </motion.p>
          </AnimatePresence>

          {/* CTA */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`cta-${current}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.22 }}
              className="flex items-center gap-4"
            >
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                style={{
                  background: "var(--color-accent)",
                  color: "var(--color-stone-950)",
                  fontFamily: "var(--font-outfit)",
                  boxShadow: "0 4px 20px rgb(201 150 58 / 0.40)",
                }}
              >
                {slide.cta}
                <ArrowRight size={16} weight="bold" />
              </Link>
              <Link
                href="/products"
                className="text-sm font-medium transition-all duration-200 hover:text-white"
                style={{ color: "rgb(255 255 255 / 0.65)" }}
              >
                Xem tất cả
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Slide controls */}
      <div className="absolute bottom-8 right-8 z-10 flex items-center gap-3">
        <button
          onClick={() => go(current - 1, -1)}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:opacity-80 active:scale-95"
          style={{ background: "rgb(255 255 255 / 0.15)", color: "white", border: "1px solid rgb(255 255 255 / 0.20)" }}
          aria-label="Slide trước"
        >
          <CaretLeft size={18} />
        </button>
        <div className="flex items-center gap-1.5">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i, i > current ? 1 : -1)}
              className="transition-all duration-300 rounded-full"
              style={{
                width: i === current ? "24px" : "8px",
                height: "8px",
                background: i === current ? "var(--color-accent)" : "rgb(255 255 255 / 0.40)",
              }}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
        <button
          onClick={() => go(current + 1, 1)}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:opacity-80 active:scale-95"
          style={{ background: "rgb(255 255 255 / 0.15)", color: "white", border: "1px solid rgb(255 255 255 / 0.20)" }}
          aria-label="Slide tiếp theo"
        >
          <CaretRight size={18} />
        </button>
      </div>
    </section>
  );
}

// ---- Trust Strip ----
function TrustStrip() {
  const items = [
    { Icon: Truck, label: "Miễn phí ship", sub: "Đơn từ 200.000đ" },
    { Icon: Shield, label: "Đảm bảo chính hãng", sub: "100% sách thật" },
    { Icon: Package, label: "Đổi trả dễ dàng", sub: "Trong vòng 7 ngày" },
    { Icon: HeadCircuit, label: "Hỗ trợ 24/7", sub: "Tư vấn nhiệt tình" },
  ];

  return (
    <div
      className="border-b"
      style={{
        background: "var(--color-surface-overlay)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="w-full mx-auto px-4 lg:px-8" style={{ maxWidth: "1280px" }}>
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0"
          style={{ borderColor: "var(--color-border)" }}
        >
          {items.map(({ Icon, label, sub }) => (
            <div
              key={label}
              className="flex items-center gap-3 px-6 py-4"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--color-forest-50)" }}
              >
                <Icon size={20} style={{ color: "var(--color-brand)" }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-outfit)" }}>
                  {label}
                </p>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- Category Bento ----
function CategoryBento() {
  const dbCategories = [
    { id: "1", name: "Tiểu thuyết", count: "1200+", slug: "Tiểu thuyết", imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800" },
    { id: "2", name: "Kỹ năng sống", count: "850+", slug: "Tâm lý - Kỹ năng sống", imageUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800" },
    { id: "3", name: "Thiếu nhi", count: "640+", slug: "Thiếu nhi", imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800" },
    { id: "4", name: "Giáo khoa - Tham khảo", count: "420+", slug: "Giáo khoa - Tham khảo", imageUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800" },
    { id: "5", name: "Văn phòng phẩm", count: "1100+", slug: "van-phong-pham", imageUrl: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=800" },
    { id: "6", name: "Đồ chơi - Lưu niệm", count: "350+", slug: "Đồ chơi - Lưu niệm", imageUrl: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=800" },
  ];
  const featured = dbCategories.slice(0, 3);
  const small = dbCategories.slice(3, 6);

  return (
    <section className="w-full py-16">
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8" style={{ maxWidth: "1280px" }}>
        <div className="mb-8">
          <h2
            className="text-3xl font-bold tracking-tight"
            style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-outfit)" }}
          >
            Danh mục nổi bật
          </h2>
          <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
            Khám phá sách và văn phòng phẩm theo chủ đề yêu thích
          </p>
        </div>

        {/* Bento grid: 3 large + 3 small = 6 cells, no empty */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Large featured - spans 2 cols each on lg */}
          {featured.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-2 group relative overflow-hidden rounded-2xl cursor-pointer"
              style={{ minHeight: "200px" }}
            >
              <Link href={`/products?category=${cat.slug}`} className="block h-full">
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  style={{ minHeight: "200px" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-5">
                  <h3
                    className="text-white font-bold text-lg mb-0.5"
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    {cat.name}
                  </h3>
                  <p className="text-xs" style={{ color: "rgb(255 255 255 / 0.70)" }}>
                    {cat.count} sản phẩm
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}

          {/* Small - 1 col each on lg */}
          {small.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: (i + 3) * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-2 group relative overflow-hidden rounded-2xl cursor-pointer"
              style={{ minHeight: "160px" }}
            >
              <Link href={`/products?category=${cat.slug}`} className="block h-full">
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  style={{ minHeight: "160px" }}
                />
                <div
                  className="absolute inset-0"
                  style={{ background: `linear-gradient(135deg, var(--color-forest-900)/80, transparent)` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4">
                  <h3
                    className="text-white font-bold text-sm"
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    {cat.name}
                  </h3>
                  <p className="text-xs" style={{ color: "rgb(255 255 255 / 0.65)" }}>
                    {cat.count} sản phẩm
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- Horizontal Product Carousel ----
function ProductCarousel({
  title,
  subtitle,
  products: items,
  id,
}: {
  title: string;
  subtitle: string;
  products: any[];
  id: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const w = scrollRef.current.clientWidth;
    scrollRef.current.scrollBy({ left: dir === "left" ? -w / 1.2 : w / 1.2, behavior: "smooth" });
  };

  return (
    <section className="py-14" style={{ background: "var(--color-surface-overlay)" }}>
      <div className="w-full mx-auto px-4 lg:px-8" style={{ maxWidth: "1280px" }}>
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2
              className="text-2xl md:text-3xl font-bold tracking-tight"
              style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-outfit)" }}
            >
              {title}
            </h2>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>{subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => scroll("left")}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-[var(--color-stone-200)]"
              style={{ background: "var(--color-stone-100)", color: "var(--color-text-secondary)", border: "1px solid var(--color-border)" }}
              aria-label="Scroll left"
            >
              <CaretLeft size={16} />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-[var(--color-stone-200)]"
              style={{ background: "var(--color-stone-100)", color: "var(--color-text-secondary)", border: "1px solid var(--color-border)" }}
              aria-label="Scroll right"
            >
              <CaretRight size={16} />
            </button>
            <Link
              href="/products"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-[var(--color-brand)]"
              style={{ color: "var(--color-accent)" }}
            >
              Xem tất cả
              <ArrowRight size={14} weight="bold" />
            </Link>
          </div>
        </div>

        <div
          id={id}
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-hide pb-2"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {items.map((product, i) => (
            <div
              key={product.id}
              className="flex-shrink-0 w-[200px] sm:w-[220px] lg:w-[240px]"
              style={{ scrollSnapAlign: "start" }}
            >
              <ProductCard product={product} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- Promo Banner ----
function PromoBanner() {
  return (
    <section
      className="py-12"
      style={{ background: "var(--color-forest-950)" }}
    >
      <div className="w-full mx-auto px-4 lg:px-8" style={{ maxWidth: "1280px" }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-sm font-semibold mb-2" style={{ color: "var(--color-accent)" }}>
              Uu dai dac biet
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              Giảm 20% cho đơn hàng đầu tiên
            </h2>
            <p className="text-base mb-6" style={{ color: "rgb(255 255 255 / 0.65)" }}>
              Dành riêng cho khách hàng mới. Áp dụng cho tất cả sản phẩm trên toàn shop.
            </p>

            {/* Coupon code */}
            <div
              className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl mb-6"
              style={{ background: "rgb(255 255 255 / 0.08)", border: "1px dashed rgb(255 255 255 / 0.25)" }}
            >
              <span className="text-sm" style={{ color: "rgb(255 255 255 / 0.60)" }}>Mã giảm giá:</span>
              <span
                className="text-lg font-bold tracking-widest"
                style={{ color: "var(--color-accent)", fontFamily: "var(--font-outfit)" }}
              >
                TRANGSACH20
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                style={{
                  background: "var(--color-accent)",
                  color: "var(--color-stone-950)",
                  fontFamily: "var(--font-outfit)",
                }}
              >
                Mua sắm ngay
                <ArrowRight size={15} weight="bold" />
              </Link>
            </div>
          </motion.div>

          {/* Right - featured image */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-2xl">
              <img
                src="https://picsum.photos/seed/books-stacked-promo/700/420"
                alt="Khuyến mãi sách"
                className="w-full object-cover"
                style={{ aspectRatio: "5/3" }}
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[var(--color-forest-950)]/40" />
              <div
                className="absolute top-4 right-4 px-4 py-2 rounded-full text-sm font-bold"
                style={{
                  background: "var(--color-accent)",
                  color: "var(--color-stone-950)",
                  fontFamily: "var(--font-outfit)",
                }}
              >
                Miễn phí ship
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ---- Today's Picks - Different layout family (asymmetric large+grid) ----
function TodaysPicks({ items }: { items: any[] }) {
  if (!items || items.length < 4) return null;
  const featured = items[0];
  const grid = items.slice(1, 4);

  return (
    <section className="w-full py-16">
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8" style={{ maxWidth: "1280px" }}>
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2
              className="text-2xl md:text-3xl font-bold tracking-tight"
              style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-outfit)" }}
            >
              Gợi ý hôm nay
            </h2>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
              Tuyển chọn đặc biệt từ đội ngũ Trang Sách
            </p>
          </div>
          <Link
            href="/products"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium"
            style={{ color: "var(--color-accent)" }}
          >
            Xem thêm <ArrowRight size={14} weight="bold" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Featured large card */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-2 group relative overflow-hidden rounded-2xl flex flex-col"
            style={{
              background: "var(--color-forest-900)",
              minHeight: "420px",
            }}
          >
            <img
              src={featured.imageUrl}
              alt={featured.name}
              className="absolute inset-0 w-full h-full object-cover opacity-40 transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-forest-950)] via-[var(--color-forest-950)]/40 to-transparent" />
            <div className="relative mt-auto p-8">
              <span
                className="inline-block text-xs font-bold px-2.5 py-1 rounded-full mb-3"
                style={{ background: "var(--color-accent)", color: "var(--color-stone-950)" }}
              >
                Goi y cua Trang
              </span>
              <h3
                className="text-2xl font-bold text-white mb-1"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                {featured.name}
              </h3>
              <p className="text-sm mb-1" style={{ color: "rgb(255 255 255 / 0.65)" }}>
                {featured.author}
              </p>
              <p
                className="text-xl font-bold mb-4"
                style={{ color: "var(--color-amber-300)", fontFamily: "var(--font-outfit)" }}
              >
                {featured.price.toLocaleString("vi-VN")}d
              </p>
              <Link
                href={`/products/${featured.slug}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hover:opacity-90"
                style={{
                  background: "white",
                  color: "var(--color-brand)",
                  fontFamily: "var(--font-outfit)",
                }}
              >
                Xem chi tiet <ArrowRight size={14} weight="bold" />
              </Link>
            </div>
          </motion.div>

          {/* Right grid of 3 */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {grid.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ---- Main Homepage ----
export default function HomePage() {
  const [bestsellers, setBestsellers] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [todaysPicks, setTodaysPicks] = useState<any[]>([]);

  useEffect(() => {
    const fetchHomeData = async () => {
      const [bestRes, newRes] = await Promise.all([
        getBooks(1, 10, { sortBy: "bestseller" }),
        getBooks(1, 10, { sortBy: "newest" }),
      ]);
      const mapper = (b: any) => ({
        id: String(b.id),
        name: b.title,
        author: b.category,
        price: b.price,
        originalPrice: b.original_price,
        rating: b.rating_value || 5,
        reviewCount: b.reviews_count || 100,
        imageUrl: b.image_url,
        badge: b.label || (b.discount_percent ? `-${b.discount_percent}%` : ""),
        category: b.category,
        subcategory: "",
        slug: b.slug,
        description: b.description_html || "",
      });
      const best = bestRes.books.map(mapper);
      const newArr = newRes.books.map(mapper);
      setBestsellers(best);
      setNewArrivals(newArr);
      setTodaysPicks(best.slice(0, 4));
    };
    fetchHomeData();
  }, []);

  return (
    <>
      <HeroSection />
      <TrustStrip />
      <BestSellersSection />
      <HeroBannerSection />
      {bestsellers.length > 0 && (
        <ProductCarousel
          id="bestseller-carousel"
          title="Sách bán chạy"
          subtitle="Những cuốn sách được độc giả yêu thích nhất"
          products={bestsellers}
        />
      )}
      <PromoBanner />
      {newArrivals.length > 0 && (
        <ProductCarousel
          id="new-arrivals-carousel"
          title="Mới về kho"
          subtitle="Sách và văn phòng phẩm mới nhất vừa cập bến"
          products={newArrivals}
        />
      )}
      <TodaysPicks items={todaysPicks} />
    </>
  );
}
