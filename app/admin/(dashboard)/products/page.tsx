import { Suspense } from 'react';
import { getProducts } from './actions';
import Link from 'next/link';

export default async function AdminProductsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
  const search = typeof searchParams.search === 'string' ? searchParams.search : undefined;
  const category = typeof searchParams.category === 'string' ? searchParams.category : undefined;
  const status = typeof searchParams.status === 'string' ? searchParams.status : undefined;
  const stock = typeof searchParams.stock === 'string' ? searchParams.stock : undefined;
  const limit = 20;

  const { products, count } = await getProducts({ page, limit, search, category, status, stock });

  const totalPages = count ? Math.ceil(count / limit) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Quản lý Sản phẩm</h1>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
        {/* Basic Filters (Can be expanded to client components) */}
        <form className="flex flex-wrap gap-4 items-center w-full" method="GET">
          <input 
            type="text" 
            name="search" 
            defaultValue={search} 
            placeholder="Tìm theo tên hoặc ID..." 
            className="flex-1 min-w-[200px] border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
          <select name="status" defaultValue={status || ''} className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white">
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang kinh doanh</option>
            <option value="inactive">Tạm ngừng</option>
          </select>
          <select name="stock" defaultValue={stock || ''} className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white">
            <option value="">Tất cả kho</option>
            <option value="low_stock">Sắp hết hàng</option>
            <option value="out_of_stock">Hết hàng</option>
          </select>
          <button type="submit" className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors">
            Lọc
          </button>
          {(search || status || stock || category) && (
            <Link href="/admin/products" className="text-sm text-red-600 hover:text-red-800">
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
                  Sản phẩm
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giá
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tồn kho
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
              {products && products.length > 0 ? (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {product.image_url ? (
                            <img className="h-10 w-10 rounded-md object-cover border" src={product.image_url} alt="" />
                          ) : (
                            <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center text-gray-400">
                              No IMG
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-xs" title={product.title}>
                            {product.title}
                          </div>
                          <div className="text-sm text-gray-500">{product.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.price.toLocaleString('vi-VN')} ₫</div>
                      {product.original_price && product.original_price > product.price && (
                        <div className="text-xs text-gray-500 line-through">{product.original_price.toLocaleString('vi-VN')} ₫</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.stock_quantity === 0 ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Hết hàng
                        </span>
                      ) : product.stock_quantity <= product.low_stock_threshold ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          {product.stock_quantity} (Sắp hết)
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {product.stock_quantity}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.is_active ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Đang bán
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Đã ẩn
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/admin/products/${product.id}`} className="text-indigo-600 hover:text-indigo-900">
                        Sửa
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                    Không tìm thấy sản phẩm nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Trang {page} / {totalPages}
            </div>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/products?page=${page - 1}${search ? `&search=${search}` : ''}${status ? `&status=${status}` : ''}${stock ? `&stock=${stock}` : ''}`}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50"
                >
                  Trang trước
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/products?page=${page + 1}${search ? `&search=${search}` : ''}${status ? `&status=${status}` : ''}${stock ? `&stock=${stock}` : ''}`}
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
