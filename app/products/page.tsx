"use client";
import { useState, useMemo } from "react";
import { Suspense } from "react";
import {
  FunnelSimple,
  SlidersHorizontal,
  GridFour,
  Rows,
  X,
  Star,
  CaretDown,
  CaretRight,
} from "@phosphor-icons/react";
import ProductCard from "@/components/ui/ProductCard";
import { categories } from "@/lib/mockData";
import Link from "next/link";
import { getBooks, Book } from "@/lib/books";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "price-asc", label: "Giá: Thấp đến Cao" },
  { value: "price-desc", label: "Giá: Cao đến Thấp" },
  { value: "rating", label: "Đánh giá cao nhất" },
  { value: "bestseller", label: "Bán chạy nhất" },
];

const DB_CATEGORIES = [
  "Tiểu thuyết",
  "Tâm lý - Kỹ năng sống",
  "Thiếu nhi",
  "Giáo khoa - Tham khảo",
  "Kinh tế - Chính trị - Pháp lý",
  "Sách Ngoại Văn",
  "Tiểu sử - Hồi ký",
  "Văn phòng phẩm - Bút",
  "Văn phòng phẩm - Dụng cụ học sinh",
  "Văn phòng phẩm - Dụng cụ văn phòng",
  "Văn phòng phẩm - Sản phẩm về giấy",
  "Bách hóa tổng hợp",
  "Đồ chơi - Lưu niệm"
];

// Sidebar filter
function FilterSidebar({
  selectedCategories,
  toggleCategory,
  priceRange,
  setPriceRange,
  minRating,
  setMinRating,
  onClear,
  mobileOpen,
  setMobileOpen,
}: {
  selectedCategories: string[];
  toggleCategory: (c: string) => void;
  priceRange: [number, number];
  setPriceRange: (v: [number, number]) => void;
  minRating: number;
  setMinRating: (v: number) => void;
  onClear: () => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}) {
  const filterCount =
    selectedCategories.length + (minRating > 0 ? 1 : 0) + (priceRange[0] > 0 || priceRange[1] < 1000000 ? 1 : 0);

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FunnelSimple size={16} style={{ color: "var(--color-brand)" }} />
          <span className="font-bold text-sm" style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-outfit)" }}>
            Bộ lọc
          </span>
          {filterCount > 0 && (
            <span
              className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: "var(--color-accent)", color: "var(--color-stone-950)" }}
            >
              {filterCount}
            </span>
          )}
        </div>
        {filterCount > 0 && (
          <button
            onClick={onClear}
            className="text-xs font-medium transition-colors hover:text-[var(--color-brand)]"
            style={{ color: "var(--color-text-muted)" }}
          >
            Xóa tất cả
          </button>
        )}
      </div>

      {/* Category filter */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--color-text-muted)" }}>
          Danh mục
        </p>
        <div className="space-y-2">
          {DB_CATEGORIES.map((catName) => (
            <label
              key={catName}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(catName)}
                onChange={() => toggleCategory(catName)}
                className="w-4 h-4 rounded accent-[var(--color-brand)]"
              />
              <span
                className="text-sm transition-colors group-hover:text-[var(--color-brand)]"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {catName}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--color-text-muted)" }}>
          Khoang gia
        </p>
        <div className="space-y-3">
          <input
            type="range"
            min={0}
            max={1000000}
            step={10000}
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
            className="w-full accent-[var(--color-brand)]"
          />
          <div className="flex items-center justify-between text-sm" style={{ color: "var(--color-text-secondary)" }}>
            <span style={{ fontFamily: "var(--font-outfit)" }}>
              {priceRange[0].toLocaleString("vi-VN")}d
            </span>
            <span style={{ fontFamily: "var(--font-outfit)" }}>
              {priceRange[1].toLocaleString("vi-VN")}d
            </span>
          </div>
          {/* Quick price buttons */}
          <div className="flex flex-wrap gap-2">
            {[
              [0, 100000, "Duoi 100k"],
              [100000, 300000, "100-300k"],
              [300000, 1000000, "Tren 300k"],
            ].map(([min, max, label]) => (
              <button
                key={label as string}
                onClick={() => setPriceRange([min as number, max as number])}
                className="text-xs px-3 py-1 rounded-full transition-all duration-200"
                style={{
                  background: priceRange[0] === min && priceRange[1] === max
                    ? "var(--color-forest-100)"
                    : "var(--color-stone-100)",
                  color: priceRange[0] === min && priceRange[1] === max
                    ? "var(--color-brand)"
                    : "var(--color-text-secondary)",
                  border: `1px solid ${priceRange[0] === min && priceRange[1] === max ? "var(--color-forest-300)" : "var(--color-border)"}`,
                }}
              >
                {label as string}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Rating filter */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--color-text-muted)" }}>
          Danh gia
        </p>
        <div className="space-y-2">
          {[4, 3, 2, 0].map((rating) => (
            <button
              key={rating}
              onClick={() => setMinRating(minRating === rating ? 0 : rating)}
              className="flex items-center gap-2 w-full text-left transition-opacity"
              style={{ opacity: minRating !== 0 && minRating !== rating ? 0.5 : 1 }}
            >
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    weight={i < rating ? "fill" : "regular"}
                    style={{
                      color: i < rating ? "var(--color-accent)" : "var(--color-stone-300)",
                    }}
                  />
                ))}
              </div>
              <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                {rating === 0 ? "Tat ca" : `${rating} sao tro len`}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:block w-60 flex-shrink-0 sticky top-24 self-start p-5 rounded-2xl"
        style={{
          background: "var(--color-surface-overlay)",
          border: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        {content}
      </aside>

      {/* Mobile filter sheet */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div
            className="relative ml-auto h-full w-80 overflow-y-auto p-6"
            style={{ background: "var(--color-surface-overlay)" }}
          >
            <div className="flex items-center justify-between mb-6">
              <span className="font-bold" style={{ fontFamily: "var(--font-outfit)" }}>Bo loc</span>
              <button onClick={() => setMobileOpen(false)}>
                <X size={20} style={{ color: "var(--color-text-secondary)" }} />
              </button>
            </div>
            {content}
          </div>
        </div>
      )}
    </>
  );
}

// Skeleton loader
function ProductSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--color-border)" }}>
      <div className="skeleton" style={{ aspectRatio: "3/4" }} />
      <div className="p-4 space-y-2">
        <div className="skeleton h-3 rounded w-24" />
        <div className="skeleton h-4 rounded w-full" />
        <div className="skeleton h-4 rounded w-3/4" />
        <div className="skeleton h-5 rounded w-20 mt-2" />
      </div>
    </div>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>(categoryParam ? [categoryParam] : []);
  
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategories([categoryParam]);
    } else {
      setSelectedCategories([]);
    }
    setCurrentPage(1);
  }, [categoryParam]);
  
  const toggleCategory = (catName: string) => {
    setSelectedCategories(prev =>
      prev.includes(catName)
        ? prev.filter((c) => c !== catName)
        : [...prev, catName]
    );
    setCurrentPage(1);
  };
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const PRODUCTS_PER_PAGE = 24;

  const [books, setBooks] = useState<Book[]>([]);
  const [totalBooks, setTotalBooks] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 1000000]);
    setMinRating(0);
    setCurrentPage(1);
  };

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    let mappedCategories: string[] | undefined = undefined;
    if (selectedCategories.length > 0) {
      const allDbCategories: string[] = [];
      for (const s of selectedCategories) {
         if (s === 'van-phong-pham' || s === 'vpp') {
            allDbCategories.push('Văn phòng phẩm - Bút', 'Văn phòng phẩm - Dụng cụ học sinh', 'Văn phòng phẩm - Dụng cụ văn phòng', 'Văn phòng phẩm - Sản phẩm về giấy');
         } else if (s === 'so-tay') {
            allDbCategories.push('Văn phòng phẩm - Sản phẩm về giấy');
         } else if (s === 'but-cao-cap' || s === 'phu-kien-ban' || s === 'qua-tang') {
            allDbCategories.push('Văn phòng phẩm - Bút', 'Văn phòng phẩm - Dụng cụ văn phòng', 'Đồ chơi - Lưu niệm');
         } else if (s === 'tieu-thuyet') {
            allDbCategories.push('Tiểu thuyết');
         } else if (s === 'ky-nang-song') {
            allDbCategories.push('Tâm lý - Kỹ năng sống');
         } else if (s === 'khoa-hoc') {
            allDbCategories.push('Giáo khoa - Tham khảo');
         } else if (s === 'thieu-nhi') {
            allDbCategories.push('Thiếu nhi');
         } else if (s === 'sach') {
            allDbCategories.push('Tiểu thuyết', 'Tâm lý - Kỹ năng sống', 'Thiếu nhi', 'Giáo khoa - Tham khảo', 'Sách Ngoại Văn', 'Tiểu sử - Hồi ký', 'Kinh tế - Chính trị - Pháp lý');
         } else {
            const found = categories.find(c => c.slug === s);
            if (found) allDbCategories.push(found.name);
            else allDbCategories.push(s);
         }
      }
      mappedCategories = Array.from(new Set(allDbCategories));
    }

    getBooks(currentPage, PRODUCTS_PER_PAGE, {
      category: mappedCategories,
      minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
      maxPrice: priceRange[1] < 1000000 ? priceRange[1] : undefined,
      minRating: minRating,
      sortBy: sortBy,
    }).then(({ books, total }) => {
      if (active) {
        setBooks(books);
        setTotalBooks(total);
        setIsLoading(false);
      }
    });
    return () => { active = false; };
  }, [currentPage, selectedCategories, priceRange, minRating, sortBy]);

  const totalPages = Math.ceil(totalBooks / PRODUCTS_PER_PAGE);
  
  const mappedProducts = books.map((b) => ({
    id: b.id,
    slug: b.slug,
    name: b.title,
    author: "Unknown",
    price: b.price || 0,
    originalPrice: b.original_price || b.price || 0,
    rating: b.rating_value || 0,
    reviewCount: b.reviews_count || 0,
    category: b.category || "Unknown",
    subcategory: "Unknown",
    imageUrl: b.image_url,
    images: [b.image_url],
    badge: b.label || (b.discount_percent ? `-${b.discount_percent}%` : ""),
    description: b.description_html || "",
    specs: {},
    coverType: "Bìa mềm",
    inStock: b.stock_status === "in_stock",
    tags: []
  }));

  const paginated = mappedProducts;

  return (
    <div style={{ background: "var(--color-surface)" }}>
      {/* Breadcrumb */}
      <div style={{ background: "var(--color-surface-overlay)", borderBottom: "1px solid var(--color-border)" }}>
        <div className="w-full mx-auto px-4 lg:px-8 py-3" style={{ maxWidth: "1280px" }}>
          <div className="flex items-center gap-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
            <Link href="/" className="hover:text-[var(--color-brand)] transition-colors">Trang chu</Link>
            <CaretRight size={12} />
            <span style={{ color: "var(--color-text-primary)" }}>San pham</span>
          </div>
        </div>
      </div>

      <div className="w-full mx-auto px-4 lg:px-8 py-8" style={{ maxWidth: "1280px" }}>
        {/* Page header */}
        <div className="mb-8">
          <h1
            className="text-3xl font-bold tracking-tight mb-2"
            style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-outfit)" }}
          >
            Tat ca san pham
          </h1>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            {totalBooks} san pham duoc tim thay
          </p>
        </div>

        <div className="flex gap-8">
          {/* Filter sidebar */}
          <FilterSidebar
            selectedCategories={selectedCategories}
            toggleCategory={toggleCategory}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            minRating={minRating}
            setMinRating={setMinRating}
            onClear={clearFilters}
            mobileOpen={mobileFilterOpen}
            setMobileOpen={setMobileFilterOpen}
          />

          {/* Main area */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
              {/* Mobile filter button */}
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all"
                style={{
                  background: "var(--color-surface-overlay)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text-secondary)",
                }}
              >
                <SlidersHorizontal size={15} />
                Bo loc
              </button>

              <div className="flex items-center gap-3 ml-auto">
                {/* Sort */}
                <div className="relative">
                  <button
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all"
                    style={{
                      background: "var(--color-surface-overlay)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    <FunnelSimple size={14} />
                    {SORT_OPTIONS.find((s) => s.value === sortBy)?.label}
                    <CaretDown size={12} />
                  </button>
                  {showSortDropdown && (
                    <div
                      className="absolute right-0 top-full mt-2 w-52 rounded-xl overflow-hidden z-30"
                      style={{
                        background: "var(--color-surface-overlay)",
                        boxShadow: "var(--shadow-elevated)",
                        border: "1px solid var(--color-border)",
                      }}
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => { setSortBy(opt.value); setShowSortDropdown(false); setCurrentPage(1); }}
                          className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-[var(--color-stone-50)]"
                          style={{
                            color: sortBy === opt.value ? "var(--color-brand)" : "var(--color-text-secondary)",
                            fontWeight: sortBy === opt.value ? "600" : "400",
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Active filters */}
            {(selectedCategories.length > 0 || minRating > 0) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedCategories.map((catName) => {
                  let displayName = catName;
                  if (catName === 'sach') displayName = 'Sách';
                  if (catName === 'van-phong-pham' || catName === 'vpp') displayName = 'Văn phòng phẩm';
                  return (
                    <span
                      key={catName}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                      style={{ background: "var(--color-forest-50)", color: "var(--color-brand)", border: "1px solid var(--color-forest-200)" }}
                    >
                      {displayName}
                      <button onClick={() => toggleCategory(catName)}>
                        <X size={10} />
                      </button>
                    </span>
                  );
                })}
                {minRating > 0 && (
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                    style={{ background: "var(--color-forest-50)", color: "var(--color-brand)", border: "1px solid var(--color-forest-200)" }}
                  >
                    Tu {minRating} sao
                    <button onClick={() => setMinRating(0)}>
                      <X size={10} />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Product grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : paginated.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-20 rounded-2xl"
                style={{ background: "var(--color-surface-overlay)", border: "1px solid var(--color-border)" }}
              >
                <p className="font-semibold mb-2" style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-outfit)" }}>
                  Khong tim thay san pham
                </p>
                <p className="text-sm mb-4" style={{ color: "var(--color-text-muted)" }}>
                  Thu thay doi bo loc de xem ket qua khac
                </p>
                <button
                  onClick={clearFilters}
                  className="px-5 py-2 rounded-full text-sm font-semibold transition-all hover:opacity-90"
                  style={{ background: "var(--color-brand)", color: "white" }}
                >
                  Xoa bo loc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginated.map((product, i) => (
                  <ProductCard key={product.id} product={product as any} index={i} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all disabled:opacity-40"
                  style={{
                    background: "var(--color-surface-overlay)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  <CaretRight size={14} className="rotate-180" />
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all"
                    style={{
                      background: currentPage === i + 1 ? "var(--color-brand)" : "var(--color-surface-overlay)",
                      border: `1px solid ${currentPage === i + 1 ? "var(--color-brand)" : "var(--color-border)"}`,
                      color: currentPage === i + 1 ? "white" : "var(--color-text-secondary)",
                      fontFamily: "var(--font-outfit)",
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all disabled:opacity-40"
                  style={{
                    background: "var(--color-surface-overlay)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  <CaretRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
