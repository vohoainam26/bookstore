import { ContentPageLayout } from "@/components/content/content-page-layout";
import Link from "next/link";
import { Star, Gift, Crown } from "@phosphor-icons/react/dist/ssr";

export const metadata = {
  title: "Chương trình thành viên | Trang Sách",
  description: "Tham gia chương trình thành viên để nhận nhiều ưu đãi hấp dẫn.",
};

export default function MembershipPage() {
  return (
    <ContentPageLayout
      title="Chương trình Thành viên"
      description="Gắn kết hơn với Trang Sách và nhận hàng ngàn ưu đãi đặc quyền."
      breadcrumbs={[{ label: "Chương trình thành viên", href: "/membership" }]}
    >
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-50 text-yellow-500 rounded-full mb-6">
          <Crown size={40} weight="fill" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4 font-display">Chương trình đang được hoàn thiện</h2>
        <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Chúng tôi đang nỗ lực xây dựng hệ thống tích điểm và ưu đãi hoàn toàn mới dành riêng cho khách hàng thân thiết. Rất nhiều đặc quyền hấp dẫn đang chờ đón bạn trong thời gian tới.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift size={24} weight="fill" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Ưu đãi độc quyền</h3>
          <p className="text-gray-500 text-sm">Nhận mã giảm giá đặc biệt vào ngày sinh nhật và các dịp lễ lớn.</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star size={24} weight="fill" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Tích điểm đổi quà</h3>
          <p className="text-gray-500 text-sm">Mỗi đơn hàng đều mang lại điểm thưởng để quy đổi thành sách hoặc quà tặng.</p>
        </div>
      </div>

      <div className="mt-16 p-8 bg-gray-50 rounded-2xl text-center border border-gray-100">
        <h4 className="text-xl font-bold text-gray-900 mb-3">Đừng bỏ lỡ thông báo ra mắt</h4>
        <p className="text-gray-600 mb-6">Đăng ký tài khoản ngay hôm nay để trở thành những thành viên đầu tiên trải nghiệm chương trình.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/account/login" className="px-8 py-3 rounded-full bg-red-600 text-white font-bold hover:bg-red-700 transition-colors">
            Đăng ký / Đăng nhập
          </Link>
          <Link href="/products" className="px-8 py-3 rounded-full bg-white border border-gray-200 text-gray-700 font-bold hover:border-red-500 hover:text-red-500 transition-colors">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </ContentPageLayout>
  );
}
