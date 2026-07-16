import { getDiscount } from '../actions';
import Link from 'next/link';
import DiscountForm from '@/components/admin/discounts/discount-form';
import { createAdminClient } from '@/lib/supabase/admin';

export default async function AdminDiscountDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = parseInt(params.id);
  const discount = await getDiscount(id);

  const supabase = createAdminClient();
  const { data: redemptions } = await supabase
    .from('discount_code_redemptions')
    .select('*, order:orders(order_code, total_amount), user:profiles!discount_code_redemptions_user_id_fkey(full_name)')
    .eq('discount_code_id', id)
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/discounts" className="text-sm font-medium text-gray-500 hover:text-gray-900">
          &larr; Quay lại danh sách
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Chi tiết Mã giảm giá: {discount.code}</h1>
        {discount.is_active ? (
          <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            Đang kích hoạt
          </span>
        ) : (
          <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
            Đã tạm dừng
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin mã</h2>
          <DiscountForm discount={discount} />
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Lịch sử sử dụng</h2>
            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-1">Số lượt đã dùng</div>
              <div className="text-2xl font-bold text-gray-900">
                {discount.current_usage} <span className="text-base font-normal text-gray-500">/ {discount.usage_limit || '∞'}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              {redemptions && redemptions.length > 0 ? redemptions.map((r: any) => (
                <div key={r.id} className="text-sm border-b pb-3 last:border-0 last:pb-0">
                  <div className="flex justify-between font-medium text-gray-900 mb-1">
                    <span>Đơn: {r.order?.order_code || 'Không rõ'}</span>
                    <span className={r.status === 'redeemed' ? 'text-green-600' : 'text-gray-500'}>
                      {r.status}
                    </span>
                  </div>
                  <div className="text-gray-500">Khách: {r.user?.full_name || 'Khách ẩn danh'}</div>
                  <div className="text-gray-500">
                    Giảm: {(r.discount_amount + r.shipping_discount_amount).toLocaleString('vi-VN')} ₫
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(r.created_at).toLocaleString('vi-VN')}
                  </div>
                </div>
              )) : (
                <div className="text-sm text-gray-500 text-center py-4">Chưa có lượt sử dụng nào</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
