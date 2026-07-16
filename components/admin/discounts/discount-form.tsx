'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createDiscount, updateDiscount } from '@/app/admin/(dashboard)/discounts/actions';

export default function DiscountForm({ discount }: { discount?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [discountType, setDiscountType] = useState(discount?.discount_type || 'percentage');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    const formData = new FormData(e.currentTarget);
    const data = {
      code: formData.get('code'),
      name: formData.get('name'),
      description: formData.get('description'),
      discount_type: formData.get('discount_type'),
      discount_value: Number(formData.get('discount_value')),
      min_order_amount: Number(formData.get('min_order_amount') || 0),
      max_discount_amount: formData.get('max_discount_amount') ? Number(formData.get('max_discount_amount')) : null,
      usage_limit: formData.get('usage_limit') ? Number(formData.get('usage_limit')) : null,
      usage_limit_per_user: Number(formData.get('usage_limit_per_user') || 1),
      starts_at: formData.get('starts_at') || null,
      expires_at: formData.get('expires_at') || null,
      first_order_only: formData.get('first_order_only') === 'on',
    };

    try {
      if (discount) {
        await updateDiscount(discount.id, data);
        setMessage('Cập nhật thành công!');
      } else {
        await createDiscount(data);
        router.push('/admin/discounts');
      }
    } catch (error: any) {
      setMessage(`Lỗi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div className={`p-3 rounded-md text-sm ${message.includes('Lỗi') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mã giảm giá (Code)</label>
          <input required type="text" name="code" defaultValue={discount?.code} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm uppercase" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên chương trình</label>
          <input required type="text" name="name" defaultValue={discount?.name} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
          <input type="text" name="description" defaultValue={discount?.description} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Loại giảm giá</label>
          <select 
            name="discount_type" 
            value={discountType} 
            onChange={(e) => setDiscountType(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
          >
            <option value="percentage">Phần trăm (%)</option>
            <option value="fixed_amount">Số tiền cố định (₫)</option>
            <option value="free_shipping">Miễn phí vận chuyển</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {discountType === 'percentage' ? 'Phần trăm giảm (%)' : discountType === 'fixed_amount' ? 'Số tiền giảm (₫)' : 'Số tiền hỗ trợ vận chuyển (₫)'}
          </label>
          <input 
            required 
            type="number" 
            min="0" 
            max={discountType === 'percentage' ? 100 : undefined} 
            name="discount_value" 
            defaultValue={discount?.discount_value} 
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Đơn hàng tối thiểu (₫)</label>
          <input required type="number" min="0" name="min_order_amount" defaultValue={discount?.min_order_amount || 0} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Giảm tối đa (₫) - Tùy chọn</label>
          <input type="number" min="0" name="max_discount_amount" defaultValue={discount?.max_discount_amount || ''} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" disabled={discountType === 'fixed_amount'} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Giới hạn tổng số lượt sử dụng</label>
          <input type="number" min="1" name="usage_limit" defaultValue={discount?.usage_limit || ''} placeholder="Không giới hạn" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Giới hạn mỗi người dùng</label>
          <input required type="number" min="1" name="usage_limit_per_user" defaultValue={discount?.usage_limit_per_user || 1} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian bắt đầu</label>
          <input type="datetime-local" name="starts_at" defaultValue={discount?.starts_at ? new Date(discount.starts_at).toISOString().slice(0,16) : ''} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian kết thúc</label>
          <input type="datetime-local" name="expires_at" defaultValue={discount?.expires_at ? new Date(discount.expires_at).toISOString().slice(0,16) : ''} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
        </div>

        <div className="md:col-span-2 flex items-center gap-4 mt-2">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" name="first_order_only" defaultChecked={discount?.first_order_only} className="rounded text-indigo-600 focus:ring-indigo-500" />
            Chỉ áp dụng cho đơn hàng đầu tiên
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.back()} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
          Hủy
        </button>
        <button disabled={loading} type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
          {loading ? 'Đang lưu...' : (discount ? 'Lưu thay đổi' : 'Tạo mã giảm giá')}
        </button>
      </div>
    </form>
  );
}
