import { getBooks } from "@/lib/books";
import ProductCard from "@/components/ui/ProductCard";
import Link from "next/link";
import { CaretRight, CaretLeft } from "@phosphor-icons/react/dist/ssr";

export const metadata = {
  title: "Sách mới nhất | Trang Sách",
  description: "Khám phá những đầu sách mới được cập nhật tại cửa hàng.",
};

export default async function NewBooksPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const currentPage = Number(resolvedSearchParams.page) || 1;
  const limit = 24;

  const { books, total } = await getBooks(currentPage, limit, {
    sortBy: "newest",
  });

  const totalPages = Math.ceil(total / limit);

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      <div className="bg-white border-b border-gray-200 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-red-600 transition-colors">Trang chủ</Link>
            <CaretRight size={12} weight="bold" />
            <span className="text-gray-900 font-medium">Sách mới nhất</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4" style={{ fontFamily: "var(--font-display)" }}>
            Sách mới nhất
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Khám phá những tựa sách vừa được cập bến tại cửa hàng.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {books.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <p className="text-gray-500">Chưa có sản phẩm nào.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {books.map((b, i) => {
                const product = {
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
                };
                return <ProductCard key={product.id} product={product as any} index={i} />;
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                {currentPage > 1 && (
                  <Link
                    href={`/new-books?page=${currentPage - 1}`}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-gray-200 text-gray-600 hover:border-red-500 hover:text-red-500 transition-colors"
                  >
                    <CaretLeft size={16} weight="bold" />
                  </Link>
                )}
                
                {Array.from({ length: totalPages }).map((_, i) => {
                  const p = i + 1;
                  // Simple pagination logic to avoid showing too many buttons
                  if (totalPages > 7 && p !== 1 && p !== totalPages && Math.abs(p - currentPage) > 1) {
                    if (p === 2 || p === totalPages - 1) return <span key={p} className="text-gray-400">...</span>;
                    return null;
                  }
                  
                  return (
                    <Link
                      key={p}
                      href={`/new-books?page=${p}`}
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                        currentPage === p 
                          ? "bg-red-600 border border-red-600 text-white" 
                          : "bg-white border border-gray-200 text-gray-700 hover:border-red-500 hover:text-red-500"
                      }`}
                    >
                      {p}
                    </Link>
                  );
                })}

                {currentPage < totalPages && (
                  <Link
                    href={`/new-books?page=${currentPage + 1}`}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-gray-200 text-gray-600 hover:border-red-500 hover:text-red-500 transition-colors"
                  >
                    <CaretRight size={16} weight="bold" />
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
