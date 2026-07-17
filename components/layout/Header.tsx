"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MagnifyingGlass,
  User,
  Heart,
  ShoppingBag,
  List,
  X,
  CaretDown,
} from "@phosphor-icons/react";
import { useCartStore } from "@/store/cartStore";
import { products } from "@/lib/mockData";
import { Product } from "@/lib/types";
import MegaMenu from "./MegaMenu";

const NAV_ITEMS = [
  { label: "Sách", href: "/products?category=sach", hasMega: true, megaKey: "sach" },
  { label: "Văn phòng phẩm", href: "/products?category=van-phong-pham", hasMega: true, megaKey: "vpp" },
  { label: "Quà tặng", href: "/products?category=qua-tang", hasMega: false },
  { label: "Blog", href: "/blog", hasMega: false },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMega, setActiveMega] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const megaTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { getCartCount, toggleCart } = useCartStore();
  const cartCount = getCartCount();
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);


  useEffect(() => {
    if (searchQuery.length > 1) {
      const q = searchQuery.toLowerCase();
      const results = products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.author.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        )
        .slice(0, 5);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleMegaEnter = (key: string) => {
    if (megaTimer.current) clearTimeout(megaTimer.current);
    setActiveMega(key);
  };

  const handleMegaLeave = () => {
    megaTimer.current = setTimeout(() => setActiveMega(null), 180);
  };

  const handleMegaMenuEnter = () => {
    if (megaTimer.current) clearTimeout(megaTimer.current);
  };

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-[0_2px_20px_0_rgb(26_58_46/0.10)]"
            : "bg-white"
        }`}
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        <div className="w-full mx-auto px-4 lg:px-8" style={{ maxWidth: "1280px" }}>
          <div className="flex items-center h-[72px] gap-4">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center gap-2 group">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "var(--color-brand)" }}
              >
                <span
                  className="text-white font-bold text-sm"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  T
                </span>
              </div>
              <span
                className="text-xl font-bold tracking-tight hidden sm:block"
                style={{
                  fontFamily: "var(--font-outfit)",
                  color: "var(--color-brand)",
                }}
              >
                Trang Sách
              </span>
            </Link>

            {/* Nav links - desktop */}
            <nav className="hidden lg:flex items-center gap-1 ml-6">
              {NAV_ITEMS.map((item) => (
                <div
                  key={item.label}
                  className="relative h-full flex items-center"
                  onMouseEnter={() => item.hasMega && handleMegaEnter(item.megaKey!)}
                  onMouseLeave={handleMegaLeave}
                >
                  <Link
                    href={item.href}
                    className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      pathname.startsWith(item.href.split("?")[0])
                        ? "text-[var(--color-brand)] bg-[var(--color-forest-50)]"
                        : "text-[var(--color-text-secondary)] hover:text-[var(--color-brand)] hover:bg-[var(--color-forest-50)]"
                    }`}
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    {item.label}
                    {item.hasMega && (
                      <CaretDown
                        size={12}
                        weight="bold"
                        className={`transition-transform duration-200 ${
                          activeMega === item.megaKey ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </Link>
                </div>
              ))}
            </nav>

            {/* Search bar */}
            <div ref={searchRef} className="flex-1 max-w-md mx-auto relative hidden md:block">
              <div className="relative">
                <MagnifyingGlass
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--color-text-muted)" }}
                />
                <input
                  type="text"
                  suppressHydrationWarning
                  placeholder="Tìm sách, tác giả, văn phòng phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSearch(true)}
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-full border transition-all duration-200 focus:outline-none"
                  style={{
                    background: "var(--color-stone-50)",
                    borderColor: showSearch ? "var(--color-brand)" : "var(--color-border)",
                    color: "var(--color-text-primary)",
                    fontFamily: "var(--font-body)",
                    boxShadow: showSearch ? "0 0 0 3px rgb(26 58 46 / 0.10)" : "none",
                  }}
                />
              </div>

              {/* Search dropdown */}
              {showSearch && searchResults.length > 0 && (
                <div
                  className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden z-50"
                  style={{
                    background: "var(--color-surface-overlay)",
                    boxShadow: "var(--shadow-elevated)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  {searchResults.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      onClick={() => { setShowSearch(false); setSearchQuery(""); }}
                      className="flex items-center gap-3 px-4 py-3 transition-colors duration-150 hover:bg-[var(--color-stone-50)]"
                    >
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-10 h-14 object-cover rounded-md flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium line-clamp-1" style={{ color: "var(--color-text-primary)" }}>
                          {product.name}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                          {product.author}
                        </p>
                        <p className="text-sm font-semibold mt-0.5" style={{ color: "var(--color-accent)" }}>
                          {product.price.toLocaleString("vi-VN")}đ
                        </p>
                      </div>
                    </Link>
                  ))}
                  <div
                    className="px-4 py-2.5 border-t text-center"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <Link
                      href={`/products?q=${searchQuery}`}
                      onClick={() => setShowSearch(false)}
                      className="text-sm font-medium"
                      style={{ color: "var(--color-brand)" }}
                    >
                      Xem tất cả kết quả cho "{searchQuery}"
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Right icons */}
            <div className="flex items-center gap-1 ml-auto lg:ml-0">
              <Link
                href="/account"
                className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:bg-[var(--color-stone-50)]"
                style={{ color: "var(--color-text-secondary)" }}
              >
                <User size={18} />
                <span className="hidden lg:block" style={{ fontFamily: "var(--font-outfit)" }}>
                  Tài khoản
                </span>
              </Link>

              <Link
                href="/wishlist"
                className="relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 hover:bg-[var(--color-stone-50)]"
                style={{ color: "var(--color-text-secondary)" }}
                aria-label="Danh sách yêu thích"
              >
                <Heart size={18} />
              </Link>

              <button
                id="cart-button"
                onClick={toggleCart}
                className="relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 hover:bg-[var(--color-forest-50)]"
                style={{ color: "var(--color-brand)" }}
                aria-label="Giỏ hàng"
              >
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center"
                    style={{ background: "var(--color-accent)", fontFamily: "var(--font-outfit)" }}
                  >
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </button>

              {/* Mobile hamburger */}
              <button
                className="flex lg:hidden items-center justify-center w-10 h-10 rounded-full transition-all duration-200 hover:bg-[var(--color-stone-50)] ml-1"
                style={{ color: "var(--color-text-secondary)" }}
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Menu"
              >
                {mobileOpen ? <X size={20} /> : <List size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden px-4 pb-3">
          <div className="relative">
            <MagnifyingGlass
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2"
              style={{ color: "var(--color-text-muted)" }}
            />
            <input
              type="text"
              suppressHydrationWarning
              placeholder="Tìm kiếm..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-full border"
              style={{
                background: "var(--color-stone-50)",
                borderColor: "var(--color-border)",
                color: "var(--color-text-primary)",
              }}
            />
          </div>
        </div>

        {/* Mobile nav menu */}
        {mobileOpen && (
          <div
            className="lg:hidden border-t"
            style={{
              borderColor: "var(--color-border)",
              background: "var(--color-surface-overlay)",
            }}
          >
            <nav className="px-4 py-4 space-y-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-200 hover:bg-[var(--color-stone-50)]"
                  style={{
                    color: "var(--color-text-primary)",
                    fontFamily: "var(--font-outfit)",
                  }}
                >
                  {item.label}
                  {item.hasMega && <CaretDown size={14} />}
                </Link>
              ))}
              <div className="pt-3 border-t" style={{ borderColor: "var(--color-border)" }}>
                <Link
                  href="/account"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  <User size={18} />
                  Tài khoản của tôi
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Mega Menu */}
      {activeMega && (
        <MegaMenu
          activeKey={activeMega}
          onMouseEnter={handleMegaMenuEnter}
          onMouseLeave={handleMegaLeave}
        />
      )}

      {/* Spacer for fixed header */}
      <div className="h-[72px] md:h-[72px]" />
    </>
  );
}
