import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { CaretRight, CalendarBlank, User } from "@phosphor-icons/react/dist/ssr";

export const metadata = {
  title: "Blog | Trang Sách",
  description: "Tin tức, bài viết đánh giá sách và các chia sẻ về văn hóa đọc.",
};

export default async function BlogListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const currentPage = Number(resolvedSearchParams.page) || 1;
  const limit = 12;
  const from = (currentPage - 1) * limit;
  const to = from + limit - 1;

  // We are using the standard client. In a real highly-secure SSR context, 
  // we would use createServerClient from @supabase/ssr.
  // But for public data, the standard initialized client with anon key is sufficient.
  const { data: posts, count } = await supabase
    .from("blog_posts")
    .select("*", { count: "exact" })
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.ceil((count || 0) / limit);

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      <div className="bg-white border-b border-gray-200 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-red-600 transition-colors">Trang chủ</Link>
            <CaretRight size={12} weight="bold" />
            <span className="text-gray-900 font-medium">Blog</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4" style={{ fontFamily: "var(--font-display)" }}>
            Blog & Tin tức
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
            Cập nhật những thông tin mới nhất về sách, văn phòng phẩm, và các bài viết truyền cảm hứng.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {!posts || posts.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">📝</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có bài viết nào</h3>
            <p className="text-gray-500">Chúng tôi đang cập nhật các bài viết mới. Vui lòng quay lại sau.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link 
                key={post.id} 
                href={`/blog/${post.slug}`}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
              >
                <div className="aspect-video w-full bg-gray-100 relative overflow-hidden">
                  {post.cover_image_url ? (
                    <img 
                      src={post.cover_image_url} 
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                      <span className="text-4xl">📸</span>
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    {post.published_at && (
                      <div className="flex items-center gap-1.5">
                        <CalendarBlank size={14} />
                        <span>{new Date(post.published_at).toLocaleDateString('vi-VN')}</span>
                      </div>
                    )}
                    {post.author_name && (
                      <div className="flex items-center gap-1.5">
                        <User size={14} />
                        <span>{post.author_name}</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-red-600 transition-colors" style={{ fontFamily: "var(--font-display)" }}>
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-1">
                    {post.excerpt || "Đọc tiếp để khám phá chi tiết bài viết này..."}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-red-600 font-semibold text-sm mt-auto">
                    Đọc tiếp <CaretRight size={14} weight="bold" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
