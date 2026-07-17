import { ContentPageLayout } from "@/components/content/content-page-layout";
import { termsContent } from "@/lib/content/policies";

export const metadata = {
  title: "Điều khoản dịch vụ | Trang Sách",
  description: "Các điều khoản và điều kiện khi sử dụng dịch vụ tại Trang Sách.",
};

export default function TermsOfServicePage() {
  return (
    <ContentPageLayout
      title="Điều khoản dịch vụ"
      description="Quy định về việc sử dụng website và mua sắm tại Trang Sách."
      breadcrumbs={[{ label: "Điều khoản dịch vụ", href: "/terms-of-service" }]}
      lastUpdated={termsContent.lastUpdated}
    >
      <div className="space-y-8">
        {termsContent.sections.map((section, idx) => (
          <section key={idx} className="scroll-mt-24">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.title}</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{section.content}</p>
          </section>
        ))}
      </div>
    </ContentPageLayout>
  );
}
