import { ContentPageLayout } from "@/components/content/content-page-layout";
import { aboutContent } from "@/lib/content/policies";
import Link from "next/link";
import { BookOpen, Sparkle, Target } from "@phosphor-icons/react/dist/ssr";

export const metadata = {
  title: "Về chúng tôi | Trang Sách",
  description: "Câu chuyện và sứ mệnh của Trang Sách.",
};

export default function AboutPage() {
  return (
    <ContentPageLayout
      title="Câu chuyện của Trang Sách"
      description="Hành trình mang tri thức và cái đẹp đến gần hơn với mỗi người."
      breadcrumbs={[{ label: "Về chúng tôi", href: "/about" }]}
    >
      <div className="space-y-12">
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <Target size={20} weight="fill" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 m-0 font-display">Sứ mệnh</h2>
          </div>
          <p className="text-gray-600 leading-relaxed text-lg">{aboutContent.mission}</p>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <Sparkle size={20} weight="fill" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 m-0 font-display">Tầm nhìn</h2>
          </div>
          <p className="text-gray-600 leading-relaxed text-lg">{aboutContent.vision}</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 font-display border-t border-gray-200 pt-8 mt-8">Giá trị cốt lõi</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {aboutContent.values.map((val, idx) => (
              <div key={idx} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-red-600 mb-4">
                  <BookOpen size={20} weight="fill" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 font-display">{val.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-12 p-8 bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl text-center border border-red-100">
          <h4 className="text-xl font-bold text-red-950 mb-3 font-display">Cùng chúng tôi viết tiếp câu chuyện</h4>
          <p className="text-red-800/80 mb-6">Khám phá các tựa sách mới nhất được tuyển chọn dành riêng cho bạn.</p>
          <Link href="/products" className="inline-block px-8 py-3 rounded-full bg-red-600 text-white font-bold hover:bg-red-700 transition-all shadow-sm hover:shadow active:scale-95">
            Khám phá Cửa hàng
          </Link>
        </div>
      </div>
    </ContentPageLayout>
  );
}
