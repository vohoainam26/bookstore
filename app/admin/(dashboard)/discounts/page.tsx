import { Suspense } from 'react';
import { getDiscounts } from './actions';
import Link from 'next/link';

export default async function AdminDiscountsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
  const search = typeof searchParams.search === 'string' ? searchParams.search : undefined;
  const status = typeof searchParams.status === 'string' ? searchParams.status : undefined;
  const limit = 20;

  const { discounts, count } = await getDiscounts({ page, limit, search, status });
  const totalPages = count ? Math.ceil(count / limit) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Mã giảm giá</h1>
        <Link href="/admin/discounts/new" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
          + Tạo mã mới
        </Link>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
        <form className="flex flex-wrap gap-4 items-center w-full" method="GET">
          <input 
            type="text" 
            name="search" 
            defaultValue={search} 
            placeholder="Tìm theo mã hoặc tên..." 
            className="flex-1 min-w-[200px] border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
          <select name="status" defaultValue={status || ''} className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white">
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang kích hoạt</option>
            <option value="inactive">Đã tạm dừng</option>
          </select>
          <button type="submit" className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors">
            Lọc
          </button>
          {(search || status) && (
            <Link href="/admin/discounts" className="text-sm text-red-600 hover:text-red-800">
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
                  Mã
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại / Giá trị
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lượt dùng
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hạn sử dụng
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
              {discounts && discounts.length > 0 ? (
                discounts.map((discount) => (
                  <tr key={discount.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{discount.code}</div>
                      <div className="text-xs text-gray-500">{discount.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {discount.discount_type === 'percentage' 
                          ? `${discount.discount_value}%` 
                          : discount.discount_type === 'fixed_amount' 
                            ? `${discount.discount_value.toLocaleString('vi-VN')} ₫`
                            : 'Miễn phí VC'}
                      </div>
                      <div className="text-xs text-gray-500">
                        Đơn tối thiểu: {discount.min_order_amount.toLocaleString('vi-VN')} ₫
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {discount.current_usage} / {discount.usage_limit || '∞'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {discount.expires_at ? new Date(discount.expires_at).toLocaleDateString('vi-VN') : 'Không thời hạn'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {discount.is_active ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/admin/discounts/${discount.id}`} className="text-indigo-600 hover:text-indigo-900">
                        Chi tiết
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                    Không tìm thấy mã giảm giá nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Trang {page} / {totalPages}
            </div>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/discounts?page=${page - 1}${search ? `&search=${search}` : ''}${status ? `&status=${status}` : ''}`}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50"
                >
                  Trang trước
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/discounts?page=${page + 1}${search ? `&search=${search}` : ''}${status ? `&status=${status}` : ''}`}
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
