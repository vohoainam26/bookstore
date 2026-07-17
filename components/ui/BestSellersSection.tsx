"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Fire, Star, ShoppingCart } from "@phosphor-icons/react";
import { getBooks } from "@/lib/books";
import { useCartStore } from "@/store/cartStore";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "van-hoc", label: "Văn học", category: "Tiểu thuyết" },
  { id: "kinh-te", label: "Kinh Tế", category: "Kinh tế - Chính trị - Pháp lý" },
  { id: "tam-ly", label: "Tâm lý – Kỹ năng sống", category: "Tâm lý - Kỹ năng sống" },
  { id: "thieu-nhi", label: "Thiếu nhi", category: "Thiếu nhi" },
  { id: "lich-su", label: "Lịch sử", category: "Tiểu sử - Hồi ký" },
];

const WEEK_SOLD = [312, 187, 245, 134, 98];

// ─── STAR RATING ──────────────────────────────────────────────────────────────

function StarRating({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          weight={i <= Math.round(value) ? "fill" : "regular"}
          style={{ color: i <= Math.round(value) ? "#f59e0b" : "#d1d5db" }}
        />
      ))}
    </div>
  );
}

// ─── BOOK LIST ITEM ───────────────────────────────────────────────────────────

function BookListItem({
  book,
  rank,
  isActive,
  sold,
  onClick,
}: {
  book: any;
  rank: number;
  isActive: boolean;
  sold: number;
  onClick: () => void;
}) {
  const rankColor = rank <= 3 ? "#ef4444" : "#9ca3af";

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 hover:bg-red-50 relative"
      style={{
        background: isActive ? "#fff1f2" : "transparent",
        borderLeft: isActive ? "4px solid #ef4444" : "4px solid transparent",
      }}
    >
      {/* Rank number */}
      <span
        className="font-black flex-shrink-0 w-7 text-center leading-none"
        style={{ fontSize: rank <= 3 ? "1.6rem" : "1.2rem", color: rankColor, fontFamily: "var(--font-display)" }}
      >
        {rank}
      </span>

      {/* Book cover */}
      <img
        src={book.imageUrl}
        alt={book.name}
        className="w-10 h-14 object-cover rounded flex-shrink-0 shadow-sm"
      />

      {/* Info */}
      <div className="min-w-0 flex-1">
        {rank === 1 && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold text-white mb-1"
            style={{ background: "#ef4444" }}>
            <Fire size={9} weight="fill" /> Top 1
          </span>
        )}
        <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">{book.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">Đã bán trong tuần: {sold}</p>
      </div>
    </button>
  );
}

// ─── PRODUCT DETAIL PANEL ────────────────────────────────────────────────────

function ProductDetailPanel({ book }: { book: any }) {
  const { addToCart } = useCartStore();

  if (!book) return <div className="p-8 text-center text-gray-500">Đang tải...</div>;

  const discount = book.originalPrice
    ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Top: image + price + CTA */}
      <div className="flex gap-5">
        {/* Cover image */}
        <div className="flex-shrink-0">
          <Link href={`/products/${book.slug}`}>
            <img
              src={book.imageUrl}
              alt={book.name}
              className="w-32 rounded-lg shadow-md object-cover hover:opacity-90 transition-opacity cursor-pointer"
              style={{ aspectRatio: "2/3" }}
            />
          </Link>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <Link href={`/products/${book.slug}`}>
            <h3
              className="font-extrabold text-gray-900 mb-1 leading-tight line-clamp-2 hover:text-red-600 transition-colors cursor-pointer"
              style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem" }}
            >
              {book.name}
            </h3>
          </Link>
          <p className="text-sm text-gray-500 mb-3">{book.author}</p>

          {/* Price row */}
          <div className="flex flex-wrap items-baseline gap-2 mb-4">
            <span
              className="font-black text-3xl leading-none"
              style={{ color: "#dc2626", fontFamily: "var(--font-display)" }}
            >
              {book.price.toLocaleString("vi-VN")}đ
            </span>
            {book.originalPrice && (
              <span className="text-sm text-gray-400 line-through">
                {book.originalPrice.toLocaleString("vi-VN")}đ
              </span>
            )}
            {discount > 0 && (
              <span
                className="px-2 py-0.5 rounded text-xs font-bold text-white flex-shrink-0"
                style={{ background: "#ef4444" }}
              >
                -{discount}%
              </span>
            )}
          </div>

          {/* Star rating */}
          <div className="flex items-center gap-2 mb-4">
            <StarRating value={book.rating} size={15} />
            <span className="text-sm text-gray-500">
              {book.rating > 0 ? `${book.rating}/5` : "Chưa có đánh giá"} ({book.reviewCount} đánh giá)
            </span>
          </div>

          {/* CTA button */}
          <button
            onClick={() => addToCart(book, 1)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white text-sm transition-all duration-200 hover:opacity-90 hover:shadow-lg active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" }}
          >
            <ShoppingCart size={18} weight="fill" />
            Thêm vào giỏ hàng
          </button>
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid #f3f4f6" }} />

      {/* Description */}
      <div>
        <h4 className="font-bold text-gray-900 mb-2 text-sm">Mô tả sản phẩm</h4>
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-5">
          {book.description ||
            "Đây là một trong những cuốn sách được đọc giả yêu thích nhất. Nội dung phong phú, lối viết cuốn hút, phù hợp cho mọi lứa tuổi. Sách được in ấn chất lượng cao, bìa đẹp."}
        </p>
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid #f3f4f6" }} />

      {/* Reviews */}
      <div>
        <h4 className="font-bold text-gray-900 mb-3 text-sm">Đánh giá sản phẩm</h4>
        <div className="flex items-center gap-2 mb-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} size={20} weight={i <= Math.round(book.rating) ? "fill" : "regular"} style={{ color: i <= Math.round(book.rating) ? "#f59e0b" : "#d1d5db" }} />
          ))}
          <span className="text-sm font-semibold ml-1">{book.rating > 0 ? `${book.rating}/5` : ""}</span>
        </div>
        <p className="text-sm text-gray-500">
          {book.reviewCount > 0 ? `Dựa trên ${book.reviewCount} đánh giá từ khách hàng.` : "Sản phẩm chưa có đánh giá nào."}
        </p>
      </div>
    </div>
  );
}

// ─── BEST SELLERS SECTION ─────────────────────────────────────────────────────

export default function BestSellersSection() {
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const [activeBook, setActiveBook] = useState(0);
  const [bookLists, setBookLists] = useState<Record<string, any[]>>({});

  useEffect(() => {
    if (bookLists[activeTab]) return; // Already fetched
    
    let active = true;
    const tabData = TABS.find(t => t.id === activeTab);
    if (!tabData) return;

    getBooks(1, 5, { category: [tabData.category], sortBy: "bestseller" }).then(({ books }) => {
      if (!active) return;
      const mapped = books.map((b) => ({
        id: String(b.id),
        name: b.title,
        author: b.category,
        price: b.price,
        originalPrice: b.original_price,
        rating: b.rating_value || 0,
        reviewCount: b.reviews_count || 0,
        imageUrl: b.image_url,
        badge: b.label || (b.discount_percent ? `-${b.discount_percent}%` : ""),
        category: b.category,
        subcategory: "",
        slug: b.slug,
        description: b.description_html ? b.description_html.replace(/<[^>]+>/g, '').slice(0, 150) + "..." : "",
        specs: { publisher: "" },
      }));
      setBookLists(prev => ({ ...prev, [activeTab]: mapped }));
    });

    return () => { active = false; };
  }, [activeTab, bookLists]);

  const bookList = bookLists[activeTab] || [];
  const selectedBook = bookList[activeBook];

  return (
    <section className="w-full py-4" style={{ background: "white" }}>
      <div className="max-w-7xl mx-auto w-full px-4">
        {/* Card wrapper */}
        <div
          className="rounded-xl p-6"
          style={{ background: "white", boxShadow: "0 1px 8px rgba(0,0,0,0.07)" }}
        >
          {/* ── Header ── */}
          <div className="flex items-center gap-2 mb-3">
            <Fire size={22} weight="fill" style={{ color: "#ef4444" }} />
            <h2
              className="text-xl font-extrabold text-gray-900"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Best Sellers
            </h2>
          </div>

          {/* ── Tabs ── */}
          <div className="flex items-center gap-0 border-b mb-5 overflow-x-auto" style={{ borderColor: "#f3f4f6" }}>
            {TABS.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setActiveBook(0); }}
                  className="px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-all duration-150 flex-shrink-0"
                  style={{
                    color: isActive ? "#ef4444" : "#6b7280",
                    borderBottom: isActive ? "2.5px solid #ef4444" : "2.5px solid transparent",
                    fontWeight: isActive ? 700 : 500,
                    marginBottom: "-1px",
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* ── Body: 12-col grid ── */}
          <div className="grid grid-cols-12 gap-0">
            {/* LEFT – Top list (5 cols) */}
            <div
              className="col-span-12 lg:col-span-5 overflow-hidden"
              style={{ borderRight: "1px solid #f3f4f6" }}
            >
              {bookList.map((book, i) => (
                <BookListItem
                  key={book.id + i}
                  book={book}
                  rank={i + 1}
                  isActive={activeBook === i}
                  sold={WEEK_SOLD[i]}
                  onClick={() => setActiveBook(i)}
                />
              ))}
            </div>

            {/* RIGHT – Detail panel (7 cols) */}
            <div className="col-span-12 lg:col-span-7 pl-0 lg:pl-6 pt-4 lg:pt-0">
              <ProductDetailPanel book={selectedBook} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
