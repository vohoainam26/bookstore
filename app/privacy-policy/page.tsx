import { ContentPageLayout } from "@/components/content/content-page-layout";
import { privacyPolicyContent } from "@/lib/content/policies";

export const metadata = {
  title: "Chính sách bảo mật | Trang Sách",
  description: "Chính sách bảo mật và quyền riêng tư tại Trang Sách.",
};

export default function PrivacyPolicyPage() {
  return (
    <ContentPageLayout
      title="Chính sách bảo mật"
      description="Tìm hiểu cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu cá nhân của bạn."
      breadcrumbs={[{ label: "Chính sách bảo mật", href: "/privacy-policy" }]}
      lastUpdated={privacyPolicyContent.lastUpdated}
    >
      <div className="space-y-8">
        {privacyPolicyContent.sections.map((section, idx) => (
          <section key={idx} className="scroll-mt-24">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.title}</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{section.content}</p>
          </section>
        ))}
      </div>
      
      <div className="mt-12 p-6 bg-blue-50 rounded-2xl border border-blue-100">
        <h4 className="text-lg font-bold text-blue-900 mb-2">Cam kết của chúng tôi</h4>
        <p className="text-blue-800/80 text-sm leading-relaxed">
          Chúng tôi coi trọng quyền riêng tư của bạn và tuân thủ nghiêm ngặt các quy định về bảo mật dữ liệu. Thông tin cá nhân của bạn sẽ không bao giờ bị bán hoặc trao đổi với bên thứ ba cho mục đích tiếp thị.
        </p>
      </div>
    </ContentPageLayout>
  );
}
