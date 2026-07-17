import { ContentPageLayout } from "@/components/content/content-page-layout";
import { returnsPolicyContent } from "@/lib/content/policies";
import Link from "next/link";

export const metadata = {
  title: "Đổi trả hàng | Trang Sách",
  description: "Chính sách và hướng dẫn đổi trả hàng tại Trang Sách.",
};

export default function ReturnsPage() {
  return (
    <ContentPageLayout
      title="Chính sách Đổi trả hàng"
      description="Chúng tôi cam kết bảo vệ quyền lợi của khách hàng với chính sách đổi trả minh bạch và dễ dàng."
      breadcrumbs={[{ label: "Đổi trả hàng", href: "/returns" }]}
      lastUpdated={returnsPolicyContent.lastUpdated}
    >
      <div className="space-y-8">
        {returnsPolicyContent.sections.map((section, idx) => (
          <section key={idx} className="scroll-mt-24">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.title}</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{section.content}</p>
          </section>
        ))}
      </div>

      <div className="mt-12 p-6 bg-red-50 rounded-2xl border border-red-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h4 className="text-lg font-bold text-red-900 mb-1">Cần hỗ trợ đổi trả ngay?</h4>
          <p className="text-red-700 text-sm">Vui lòng chuẩn bị mã đơn hàng và tình trạng sản phẩm trước khi liên hệ.</p>
        </div>
        <div className="flex-shrink-0 flex gap-3">
          <Link href="/contact" className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors">
            Gửi yêu cầu hỗ trợ
          </Link>
        </div>
      </div>
    </ContentPageLayout>
  );
}
