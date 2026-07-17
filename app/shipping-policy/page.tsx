import { ContentPageLayout } from "@/components/content/content-page-layout";
import { shippingPolicyContent } from "@/lib/content/policies";

export const metadata = {
  title: "Chính sách vận chuyển | Trang Sách",
  description: "Thông tin về giao hàng và phí vận chuyển tại Trang Sách.",
};

export default function ShippingPolicyPage() {
  return (
    <ContentPageLayout
      title="Chính sách vận chuyển"
      description="Chúng tôi luôn cố gắng mang sản phẩm đến tay bạn trong thời gian nhanh nhất với chi phí hợp lý nhất."
      breadcrumbs={[{ label: "Chính sách vận chuyển", href: "/shipping-policy" }]}
      lastUpdated={shippingPolicyContent.lastUpdated}
    >
      <div className="space-y-8">
        {shippingPolicyContent.sections.map((section, idx) => (
          <section key={idx} className="scroll-mt-24">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.title}</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{section.content}</p>
          </section>
        ))}
      </div>
    </ContentPageLayout>
  );
}
