import { Suspense } from 'react';
import { getReviews } from './actions';
import Link from 'next/link';

export default async function AdminReviewsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
  const status = typeof searchParams.status === 'string' ? searchParams.status : undefined;
  const rating = typeof searchParams.rating === 'string' ? searchParams.rating : undefined;
  const limit = 20;

  const { reviews, count } = await getReviews({ page, limit, status, rating });
  const totalPages = count ? Math.ceil(count / limit) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Quản lý Đánh giá</h1>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
        <form className="flex flex-wrap gap-4 items-center w-full" method="GET">
          <select name="status" defaultValue={status || ''} className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white">
            <option value="">Tất cả trạng thái</option>
            <option value="published">Đang hiển thị</option>
            <option value="hidden">Đã ẩn</option>
            <option value="flagged">Bị gắn cờ</option>
          </select>
          <select name="rating" defaultValue={rating || ''} className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white">
            <option value="">Tất cả số sao</option>
            <option value="5">5 Sao</option>
            <option value="4">4 Sao</option>
            <option value="3">3 Sao</option>
            <option value="2">2 Sao</option>
            <option value="1">1 Sao</option>
          </select>
          <button type="submit" className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors">
            Lọc
          </button>
          {(status || rating) && (
            <Link href="/admin/reviews" className="text-sm text-red-600 hover:text-red-800">
              Xóa bộ lọc
            </Link>
          )}
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sản phẩm & Người dùng
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đánh giá
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reviews && reviews.length > 0 ? (
                reviews.map((review: any) => (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900 truncate max-w-[250px]">{review.book?.title}</div>
                      <div className="text-xs text-gray-500">{review.user?.full_name || 'Khách hàng'}</div>
                      <div className="text-xs text-gray-400 mt-1">{new Date(review.created_at).toLocaleString('vi-VN')}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-yellow-500 text-sm mb-1">
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </div>
                      <div className="text-sm text-gray-700 line-clamp-2 max-w-sm">
                        {review.review_text || <span className="italic text-gray-400">Không có nội dung</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {review.status === 'published' ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Hiển thị</span>
                      ) : review.status === 'hidden' ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Đã ẩn</span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Gắn cờ</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/admin/reviews/${review.id}`} className="text-indigo-600 hover:text-indigo-900">
                        Kiểm duyệt
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                    Không tìm thấy đánh giá nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">Trang {page} / {totalPages}</div>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/reviews?page=${page - 1}${status ? `&status=${status}` : ''}${rating ? `&rating=${rating}` : ''}`}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50"
                >
                  Trang trước
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/reviews?page=${page + 1}${status ? `&status=${status}` : ''}${rating ? `&rating=${rating}` : ''}`}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50"
                >
                  Trang sau
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
