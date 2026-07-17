import { ContentPageLayout } from "@/components/content/content-page-layout";
import { shoppingGuideContent } from "@/lib/content/policies";
import Link from "next/link";

export const metadata = {
  title: "Hướng dẫn mua hàng | Trang Sách",
  description: "Các bước đơn giản để tìm kiếm, lựa chọn và thanh toán đơn hàng tại Trang Sách.",
};

export default function ShoppingGuidePage() {
  return (
    <ContentPageLayout
      title="Hướng dẫn mua hàng"
      description="Chỉ với vài thao tác cơ bản, bạn đã có thể dễ dàng đặt mua những cuốn sách và món đồ yêu thích."
      breadcrumbs={[{ label: "Hướng dẫn mua hàng", href: "/shopping-guide" }]}
    >
      <div className="space-y-12">
        {shoppingGuideContent.map((step, index) => (
          <div key={index} className="flex gap-4 md:gap-6">
            <div className="flex-shrink-0 w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center font-black text-xl font-display">
              {index + 1}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 font-display">{step.title.replace(/^\d+\.\s*/, '')}</h3>
              <p className="text-gray-600 leading-relaxed">{step.content}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 p-8 bg-gray-50 rounded-2xl text-center border border-gray-100">
        <h4 className="text-lg font-bold text-gray-900 mb-3">Bạn đã sẵn sàng?</h4>
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          <Link href="/products" className="px-6 py-2.5 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors">
            Khám phá sách ngay
          </Link>
          <Link href="/contact" className="px-6 py-2.5 rounded-full bg-white border border-gray-200 text-gray-700 font-semibold hover:border-red-500 hover:text-red-500 transition-colors">
            Cần hỗ trợ? Liên hệ
          </Link>
        </div>
      </div>
    </ContentPageLayout>
  );
}
