import { getProduct } from '../actions';
import ProductEditForm from '@/components/admin/products/product-edit-form';
import InventoryAdjustmentForm from '@/components/admin/products/inventory-adjustment-form';
import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';

export default async function AdminProductDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = parseInt(params.id);
  const product = await getProduct(id);
  
  const supabase = createAdminClient();
  const { data: movements } = await supabase
    .from('inventory_movements')
    .select('*, created_by_user:profiles!inventory_movements_created_by_fkey(full_name)')
    .eq('book_id', id)
    .order('created_at', { ascending: false })
    .limit(20);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="text-sm font-medium text-gray-500 hover:text-gray-900">
          &larr; Quay lại danh sách
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Chi tiết Sản phẩm</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h2>
            <ProductEditForm product={product} />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Lịch sử điều chỉnh tồn kho</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thay đổi</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tồn sau</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người thực hiện</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lý do</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {movements && movements.length > 0 ? movements.map((movement) => (
                    <tr key={movement.id} className="text-sm text-gray-900">
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                        {new Date(movement.created_at).toLocaleString('vi-VN')}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {movement.movement_type}
                      </td>
                      <td className={`px-4 py-3 whitespace-nowrap font-medium ${movement.quantity_change > 0 ? 'text-green-600' : movement.quantity_change < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                        {movement.quantity_change > 0 ? '+' : ''}{movement.quantity_change}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{movement.quantity_after}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                        {movement.created_by_user?.full_name || 'Hệ thống'}
                      </td>
                      <td className="px-4 py-3">{movement.reason}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-4 text-center text-gray-500 text-sm">Chưa có lịch sử thay đổi tồn kho</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Trạng thái tồn kho</h2>
            <div className="flex items-center gap-4 mb-6">
              <div className="text-3xl font-bold text-gray-900">{product.stock_quantity}</div>
              {product.stock_quantity === 0 ? (
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Hết hàng</span>
              ) : product.stock_quantity <= product.low_stock_threshold ? (
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Sắp hết</span>
              ) : (
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Còn hàng</span>
              )}
            </div>
            <InventoryAdjustmentForm product={product} />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Hình ảnh</h2>
            {product.image_url ? (
              <img src={product.image_url} alt={product.title} className="w-full rounded-md border" />
            ) : (
              <div className="w-full aspect-square bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-sm border">
                Không có ảnh
              </div>
            )}
            <div className="mt-4 text-sm text-gray-500 break-all">
              <span className="font-medium">URL Gốc:</span> <a href={product.product_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Fahasa Link</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
