"use client";

import { useState, useRef } from "react";
import { use } from "react";
import { notFound, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Star,
  ShoppingCart,
  Lightning,
  Truck,
  ArrowCounterClockwise,
  Users,
  CaretRight,
  CaretLeft,
  Check,
  Minus,
  Plus,
  MapPin,
  Tag,
} from "@phosphor-icons/react";
import { products, reviews } from "@/lib/mockData";
import { useCartStore } from "@/store/cartStore";
import ProductCard from "@/components/ui/ProductCard";
import { getBookBySlug, getBooks, Book } from "@/lib/books";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import ProductReviews from "@/components/reviews/ProductReviews";
import { getUserAddresses, ShippingAddress } from "@/lib/data/addresses";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const RED = "#C92127";
const BLUE = "#2489F4";

const PROMO_CODES = [
  "Giảm 50K - Nhập ZLP50",
  "Freeship - Nhập SHIP0D",
  "Giảm 10% - Nhập BOOK10",
  "Tặng bookmark",
];

const VARIANTS = ["Bìa mềm thường", "Bìa cứng cao cấp", "Phiên bản giới hạn"];

const POLICIES = [
  { Icon: Truck,               label: "Giao hàng 2–4 ngày", sub: "Toàn quốc" },
  { Icon: ArrowCounterClockwise, label: "Đổi trả trong 7 ngày", sub: "Hoàn tiền 100%" },
  { Icon: Users,               label: "Chính sách khách sỉ", sub: "Liên hệ để biết thêm" },
];

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function StarRow({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} weight={i <= Math.round(value) ? "fill" : "regular"}
          style={{ color: i <= Math.round(value) ? "#f59e0b" : "#d1d5db" }} />
      ))}
    </div>
  );
}

// Card 1 – Gallery
function GalleryCard({
  images, imageUrl, name, onAddToCart, onBuyNow
}: { images: string[]; imageUrl: string; name: string; onAddToCart: () => void; onBuyNow: () => void }) {
  const [sel, setSel] = useState(0);
  const allImgs = images.length > 0 ? images : [imageUrl];

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col gap-3">
      {/* Main image */}
      <div className="relative w-full overflow-hidden rounded-lg bg-gray-50 flex items-center justify-center"
        style={{ aspectRatio: "2/3" }}>
        <img src={allImgs[sel]} alt={name}
          className="w-full h-full object-cover transition-opacity duration-300" />
        {/* Promo strip */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2 py-2 px-3"
          style={{ background: "rgba(201,33,39,0.92)" }}>
          <Tag size={13} color="white" weight="fill" />
          <span className="text-white text-xs font-bold">Nhập mã ZLP50 – Giảm ngay 50K</span>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-5 gap-2">
        {allImgs.slice(0, 5).map((img, i) => {
          const isLast = i === 4 && allImgs.length > 5;
          return (
            <button key={i} onClick={() => setSel(i)}
              className="relative overflow-hidden rounded-md aspect-square"
              style={{ border: `2px solid ${sel === i ? RED : "#e5e7eb"}` }}>
              <img src={img} alt="" className="w-full h-full object-cover" />
              {isLast && (
                <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">+{allImgs.length - 4}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* CTA buttons */}
      <div className="flex gap-3 mt-1">
        <button 
          onClick={onAddToCart}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold border-2 transition-all hover:bg-red-50 active:scale-[0.98]"
          style={{ borderColor: RED, color: RED }}>
          <ShoppingCart size={17} weight="bold" />
          Thêm vào giỏ
        </button>
        <button 
          onClick={onBuyNow}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: RED }}>
          <Lightning size={17} weight="fill" />
          Mua ngay
        </button>
      </div>

      {/* Policies */}
      <div className="border-t pt-3 flex flex-col gap-2">
        {POLICIES.map(({ Icon, label, sub }) => (
          <div key={label} className="flex items-center gap-3 py-1 cursor-pointer group">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "#fee2e2" }}>
              <Icon size={16} style={{ color: RED }} weight="fill" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800">{label}</p>
              <p className="text-xs text-gray-400">{sub}</p>
            </div>
            <CaretRight size={14} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Card 2 – Basic Info
function InfoCard({ product, discount }: { product: any; discount: number }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col gap-4">
      {/* Badge + Title */}
      <div>
        <span className="inline-block px-2.5 py-0.5 rounded text-xs font-bold text-white mb-2"
          style={{ background: "#f97316" }}>🔥 Xu hướng</span>
        <h1 className="text-xl font-extrabold text-gray-900 leading-snug" style={{ fontFamily: "var(--font-display)" }}>
          {product.name}
        </h1>
      </div>

      {/* Meta grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
        {[
          { k: "Nhà cung cấp", v: "Trang Sách" },
          { k: "Tác giả", v: product.author },
          { k: "Nhà xuất bản", v: product.specs?.publisher || "NXB Việt Nam" },
          { k: "Hình thức bìa", v: product.coverType || "Bìa mềm" },
        ].map(({ k, v }) => (
          <div key={k} className="flex gap-1">
            <span className="text-gray-400 flex-shrink-0">{k}:</span>
            <span className="font-medium truncate" style={{ color: BLUE }}>{v}</span>
          </div>
        ))}
      </div>

      {/* Rating row */}
      <div className="flex items-center gap-2 text-sm">
        <StarRow value={product.rating} size={15} />
        <span className="font-semibold text-gray-700">{product.rating}</span>
        <span className="text-gray-400">({product.reviewCount} đánh giá)</span>
        <span className="text-gray-300">|</span>
        <span className="text-gray-500">Đã bán <strong className="text-gray-800">2.3k</strong></span>
      </div>

      {/* Price block */}
      <div>
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="text-4xl font-black" style={{ color: RED, fontFamily: "var(--font-display)" }}>
            {product.price.toLocaleString("vi-VN")}đ
          </span>
          {product.originalPrice > product.price && (
            <span className="text-lg text-gray-400 line-through">
              {product.originalPrice.toLocaleString("vi-VN")}đ
            </span>
          )}
          {discount > 0 && (
            <span className="px-2 py-0.5 rounded text-sm font-bold text-white" style={{ background: RED }}>
              -{discount}%
            </span>
          )}
        </div>
        {/* In-stock notice */}
        <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
          style={{ background: "#eff6ff", color: "#1d4ed8" }}>
          <Check size={14} weight="bold" />
          101 nhà sách còn hàng – Giao ngay hôm nay
        </div>
      </div>
    </div>
  );
}

// Card 3 – Shipping, Variants, Quantity
function OrderCard({
  product, quantity, setQuantity,
  selectedVariant, setSelectedVariant,
  onAddToCart,
  user,
}: {
  product: (typeof products)[number];
  quantity: number;
  setQuantity: (n: number) => void;
  selectedVariant: string;
  setSelectedVariant: (v: string) => void;
  onAddToCart: () => void;
  user: unknown;
}) {
  const [address, setAddress] = useState<ShippingAddress | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(true);

  useEffect(() => {
    let active = true;
    if (user) {
       getUserAddresses().then(res => {
         if (active && res.addresses && res.addresses.length > 0) {
           setAddress(res.addresses[0]);
         }
         if (active) setLoadingAddress(false);
       });
    } else {
       setLoadingAddress(false);
    }
    return () => { active = false; };
  }, [user]);

  // Calculate estimated delivery date (e.g. 3 days from now)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);
  const days = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
  const formattedDate = `${days[deliveryDate.getDay()]}, ${deliveryDate.getDate()}/${deliveryDate.getMonth() + 1}`;

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col gap-4">
      {/* Shipping */}
      <div className="flex items-start gap-3 text-sm">
        <Truck size={18} style={{ color: "#16a34a" }} weight="fill" className="mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <span className="text-gray-500">Giao đến </span>
          {loadingAddress ? (
             <span className="text-gray-400">Đang tải địa chỉ...</span>
          ) : user ? (
            address ? (
              <>
                <span className="font-semibold" style={{ color: BLUE }}>
                  <MapPin size={12} className="inline mr-0.5" />
                  {[address.address_line, address.ward, address.district, address.province].filter(Boolean).join(", ")}
                </span>
                <span className="text-gray-400"> – </span>
                <span className="text-green-600 font-semibold">Dự kiến {formattedDate}</span>
              </>
            ) : (
              <Link href="/account/addresses" className="font-semibold underline decoration-dashed" style={{ color: BLUE }}>
                Thêm địa chỉ giao hàng
              </Link>
            )
          ) : (
             <Link href="/account/login" className="font-semibold underline decoration-dashed" style={{ color: BLUE }}>
                Đăng nhập để chọn địa chỉ
             </Link>
          )}
        </div>
      </div>

      {/* Promo codes scroll */}
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-1.5">Ưu đãi liên quan</p>
        <div className="flex gap-2 overflow-x-auto pb-1 scroll-hide">
          {PROMO_CODES.map((code) => (
            <span key={code}
              className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium border cursor-pointer whitespace-nowrap hover:bg-blue-50 transition-colors"
              style={{ borderColor: "#bfdbfe", color: BLUE }}>
              🏷 {code}
            </span>
          ))}
        </div>
      </div>

      {/* Variants */}
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2">Phân loại</p>
        <div className="flex flex-wrap gap-2">
          {VARIANTS.map((v) => {
            const isActive = selectedVariant === v;
            return (
              <button key={v} onClick={() => setSelectedVariant(v)}
                className="relative px-3 py-2 rounded-lg text-sm font-medium border-2 transition-all"
                style={{
                  borderColor: isActive ? BLUE : "#e5e7eb",
                  color: isActive ? BLUE : "#374151",
                  background: isActive ? "#eff6ff" : "white",
                }}>
                {isActive && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: BLUE }}>
                    <Check size={9} color="white" weight="bold" />
                  </span>
                )}
                {v}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quantity */}
      <div className="flex items-center gap-4">
        <p className="text-xs font-semibold text-gray-500">Số lượng</p>
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
          <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 transition-colors border-r border-gray-300">
            <Minus size={13} weight="bold" className="text-gray-600" />
          </button>
          <span className="w-10 text-center text-sm font-bold text-gray-800">{quantity}</span>
          <button onClick={() => setQuantity(quantity + 1)}
            className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 transition-colors border-l border-gray-300">
            <Plus size={13} weight="bold" className="text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Card 4 – Specs Table
function SpecsCard({ product }: { product: (typeof products)[number] }) {
  const rows = [
    { k: "Mã hàng", v: `SKU-${String(product.id).toUpperCase()}` },
    { k: "Nhà cung cấp", v: "Trang Sách JSC" },
    { k: "Tác giả", v: product.author },
    { k: "NXB", v: product.specs?.publisher || "NXB Văn Học" },
    { k: "Số trang", v: product.specs?.pages ? `${product.specs.pages} trang` : "—" },
    { k: "Kích thước", v: product.specs?.size || "—" },
    { k: "Trọng lượng", v: product.specs?.weight || "—" },
    { k: "Ngôn ngữ", v: product.specs?.language || "Tiếng Việt" },
    { k: "Hình thức bìa", v: product.coverType || "Bìa mềm" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <h3 className="text-base font-bold text-gray-900 mb-3" style={{ fontFamily: "var(--font-display)" }}>
        Thông tin chi tiết
      </h3>
      <div className="divide-y divide-gray-100">
        {rows.map(({ k, v }) => (
          <div key={k} className="flex py-2.5 text-sm">
            <span className="w-[35%] text-gray-400 flex-shrink-0">{k}</span>
            <span className="font-medium text-gray-800">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Card 5 – Description
function DescriptionCard({ description }: { description: string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <h3 className="text-base font-bold text-gray-900 mb-3" style={{ fontFamily: "var(--font-display)" }}>
        Mô tả sản phẩm
      </h3>
      <div className="relative">
        <div 
          className={`text-sm text-gray-600 leading-relaxed ${!expanded ? "line-clamp-5 overflow-hidden" : ""}`}
          dangerouslySetInnerHTML={{ __html: description || "Chưa có mô tả cho sản phẩm này." }}
        />
        {!expanded && (
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />
        )}
      </div>
      <button onClick={() => setExpanded(!expanded)}
        className="mt-2 text-sm font-semibold w-full text-center pt-1 transition-colors hover:opacity-80"
        style={{ color: BLUE }}>
        {expanded ? "Thu gọn ▲" : "Xem thêm ▼"}
      </button>
    </div>
  );
}

// Reviews section is now handled by ProductReviews component

// Card 7 – Related carousel
function RelatedCarousel({ related }: { related: (typeof products) }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") => {
    if (!ref.current) return;
    ref.current.scrollBy({ left: dir === "left" ? -280 : 280, behavior: "smooth" });
  };

  if (related.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-900 tracking-wide" style={{ fontFamily: "var(--font-display)" }}>
          GIỚI THIỆU
        </h3>
        <div className="flex gap-2">
          <button onClick={() => scroll("left")}
            className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-colors">
            <CaretLeft size={14} className="text-gray-500" />
          </button>
          <button onClick={() => scroll("right")}
            className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-colors">
            <CaretRight size={14} className="text-gray-500" />
          </button>
        </div>
      </div>
      <div ref={ref} className="flex gap-4 overflow-x-auto scroll-hide pb-1"
        style={{ scrollSnapType: "x mandatory" }}>
        {related.map((p, i) => (
          <div key={p.id} className="flex-shrink-0 w-[180px]" style={{ scrollSnapAlign: "start" }}>
            <ProductCard product={p} index={i} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  
  const [book, setBook] = useState<Book | null>(null);
  const [relatedBooks, setRelatedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<unknown>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user || null);
    });
    let active = true;
    setLoading(true);
    getBookBySlug(slug).then((b) => {
      if (!active) return;
      if (b) {
        setBook(b);
        getBooks(1, 8, { category: [b.category] }).then((res) => {
          if (active) setRelatedBooks(res.books.filter((r) => r.id !== b.id));
        });
      }
      setLoading(false);
    });
    return () => { active = false; };
  }, [slug]);

  const { addToCart } = useCartStore();

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(VARIANTS[0]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;
  }
  if (!book) {
    notFound();
  }

  const product = {
    id: book.id,
    slug: book.slug,
    name: book.title,
    author: "Unknown",
    price: book.price || 0,
    originalPrice: book.original_price || book.price || 0,
    rating: book.rating_value || 0,
    reviewCount: book.reviews_count || 0,
    category: book.category || "Unknown",
    subcategory: "Unknown",
    imageUrl: book.image_url,
    images: [book.image_url],
    badge: book.label || (book.discount_percent ? `-${book.discount_percent}%` : ""),
    description: book.description_html || "",
    specs: {},
    coverType: "Bìa mềm",
    inStock: book.stock_status === "in_stock",
    tags: []
  } as any;

  const related = relatedBooks.map(b => ({
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
  } as any));

  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen" style={{ background: "#f3f4f6" }}>
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 flex-wrap">
            <Link href="/" className="hover:text-gray-700 transition-colors">Trang chủ</Link>
            <CaretRight size={10} />
            <Link href="/products" className="hover:text-gray-700 transition-colors">Sản phẩm</Link>
            <CaretRight size={10} />
            <Link href={`/products?category=${product.category}`} className="hover:text-gray-700 transition-colors">
              {product.category}
            </Link>
            <CaretRight size={10} />
            <span className="text-gray-600 font-medium line-clamp-1">{product.name}</span>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTAINER ── */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-4">

        {/* PHẦN 1: THÂN TRÊN – Grid 12 cột */}
        <div className="grid grid-cols-12 gap-4">

          {/* CỘT TRÁI – 5 cột */}
          <div className="col-span-12 lg:col-span-5">
            <GalleryCard 
              images={product.images} 
              imageUrl={product.imageUrl} 
              name={product.name} 
              onAddToCart={() => addToCart(product, quantity, selectedVariant)}
              onBuyNow={() => {
                addToCart(product, quantity, selectedVariant);
                router.push('/checkout');
              }}
            />
          </div>

          {/* CỘT PHẢI – 7 cột, 3 cards xếp dọc */}
          <div className="col-span-12 lg:col-span-7 flex flex-col gap-4">
            <InfoCard product={product} discount={discount} />
            <OrderCard
              product={product}
              quantity={quantity}
              setQuantity={setQuantity}
              selectedVariant={selectedVariant}
              setSelectedVariant={setSelectedVariant}
              onAddToCart={() => addToCart(product, quantity, selectedVariant)}
              user={user}
            />
            <SpecsCard product={product} />
          </div>
        </div>

        {/* PHẦN 2: THÂN DƯỚI – Full width, cards xếp dọc */}
        <DescriptionCard description={product.description || ""} />
        <ProductReviews bookId={Number(book.id)} productSlug={book.slug} user={user} />
        <RelatedCarousel related={related} />

      </div>
    </div>
  );
}
