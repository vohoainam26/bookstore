"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { createClient } from "@/lib/supabase/client";
import ProductCard from "@/components/ui/ProductCard";
import Link from "next/link";
import { HeartBreak, CaretRight } from "@phosphor-icons/react";
import { Product } from "@/lib/types";

export default function WishlistPage() {
  const { wishlist } = useCartStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWishlist() {
      if (wishlist.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      const supabase = createClient();
      
      // Chuyển đổi mảng ID (string) thành số nguyên nếu Database dùng kiểu int.
      // Dựa trên cách map trước đó, product.id có thể là string lưu trong store.
      const ids = wishlist.map(id => parseInt(id, 10)).filter(id => !isNaN(id));

      if (ids.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("books")
        .select("*")
        .in("id", ids);

      if (error || !data) {
        console.error("Lỗi tải wishlist:", error);
        setProducts([]);
      } else {
        const mappedProducts: Product[] = data.map((b: any) => ({
          id: String(b.id),
          slug: b.slug,
          name: b.title,
          author: b.category || "Unknown",
          price: b.price || 0,
          originalPrice: b.original_price || b.price || 0,
          rating: b.rating_value || 0,
          reviewCount: b.reviews_count || 0,
          category: b.category || "Unknown",
          subcategory: "",
          imageUrl: b.image_url,
          images: [b.image_url],
          badge: b.label || (b.discount_percent ? `-${b.discount_percent}%` : ""),
          description: b.description_html || "",
          specs: {},
          coverType: "Bìa mềm",
          inStock: b.stock_status === "in_stock",
          tags: []
        }));
        setProducts(mappedProducts);
      }
      setLoading(false);
    }

    fetchWishlist();
  }, [wishlist]);

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      <div className="bg-white border-b border-gray-200 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-red-600 transition-colors">Trang chủ</Link>
            <CaretRight size={12} weight="bold" />
            <span className="text-gray-900 font-medium">Sản phẩm yêu thích</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4" style={{ fontFamily: "var(--font-display)" }}>
            Sản phẩm yêu thích
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Danh sách những cuốn sách và món đồ bạn quan tâm nhất.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <HeartBreak size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Danh sách trống</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">Bạn chưa có sản phẩm nào trong danh sách yêu thích. Hãy quay lại cửa hàng và thêm những cuốn sách bạn quan tâm nhé.</p>
            <Link href="/products" className="inline-block px-8 py-3 rounded-full bg-red-600 text-white font-bold hover:bg-red-700 transition-colors">
              Khám phá sách ngay
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
