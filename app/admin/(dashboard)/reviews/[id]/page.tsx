import { getReview } from '../actions';
import Link from 'next/link';
import ReviewModerationForm from '@/components/admin/reviews/review-moderation-form';

export default async function AdminReviewDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = parseInt(params.id);
  const review = await getReview(id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/reviews" className="text-sm font-medium text-gray-500 hover:text-gray-900">
          &larr; Quay lại danh sách
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Kiểm duyệt đánh giá</h1>
        <div className="text-sm text-gray-500">
          ID: {review.id} | Ngày: {new Date(review.created_at).toLocaleString('vi-VN')}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Nội dung đánh giá của Khách hàng</h2>
            <div className="bg-gray-50 p-4 rounded-md border mb-4">
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium text-gray-900">{review.user?.full_name || 'Khách hàng'}</div>
                <div className="text-yellow-500">
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </div>
              </div>
              <div className="text-sm text-gray-700 whitespace-pre-line">
                {review.review_text || <span className="italic text-gray-400">Không có nội dung văn bản</span>}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 italic">* Lưu ý: Quản trị viên không thể chỉnh sửa trực tiếp nội dung đánh giá của khách hàng. Chỉ có thể thay đổi trạng thái hiển thị.</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Hành động kiểm duyệt</h2>
            <ReviewModerationForm review={review} />
            
            {review.moderated_at && (
              <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-xs rounded border border-blue-100">
                Cập nhật lần cuối: {new Date(review.moderated_at).toLocaleString('vi-VN')} bởi {review.moderator?.full_name || 'Hệ thống'}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sản phẩm</h2>
            <div className="flex gap-4 items-start">
              <div className="w-20 h-24 bg-gray-100 border rounded flex-shrink-0 overflow-hidden">
                {review.book?.image_url ? (
                  <img src={review.book.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No IMG</div>
                )}
              </div>
              <div>
                <div className="font-medium text-sm text-gray-900 mb-2">{review.book?.title}</div>
                <Link href={`/admin/products/${review.book?.id}`} className="text-indigo-600 hover:underline text-sm">
                  Xem chi tiết sản phẩm &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
