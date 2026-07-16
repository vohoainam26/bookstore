'use client';

import { useState } from 'react';
import { updateProduct } from '@/app/admin/(dashboard)/products/actions';

export default function ProductEditForm({ product }: { product: any }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title'),
      price: Number(formData.get('price')),
      original_price: formData.get('original_price') ? Number(formData.get('original_price')) : null,
      category: formData.get('category'),
      is_active: formData.get('is_active') === 'on',
      is_featured: formData.get('is_featured') === 'on',
      low_stock_threshold: Number(formData.get('low_stock_threshold')),
      admin_note: formData.get('admin_note'),
    };

    try {
      await updateProduct(product.id, data);
      setMessage('Cập nhật thành công!');
    } catch (error: any) {
      setMessage(`Lỗi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <div className={`p-3 rounded-md text-sm ${message.includes('Lỗi') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
          <input required type="text" name="title" defaultValue={product.title} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
          <input required type="text" name="category" defaultValue={product.category} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán (₫)</label>
          <input required type="number" min="0" name="price" defaultValue={product.price} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Giá gốc (₫)</label>
          <input type="number" min="0" name="original_price" defaultValue={product.original_price || ''} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ngưỡng cảnh báo hết hàng</label>
          <input required type="number" min="0" name="low_stock_threshold" defaultValue={product.low_stock_threshold} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
        </div>
        <div className="flex items-center gap-4 mt-6">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" name="is_active" defaultChecked={product.is_active} className="rounded text-indigo-600 focus:ring-indigo-500" />
            Hiển thị (Active)
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" name="is_featured" defaultChecked={product.is_featured} className="rounded text-indigo-600 focus:ring-indigo-500" />
            Nổi bật
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú (Nội bộ admin)</label>
        <textarea name="admin_note" defaultValue={product.admin_note || ''} rows={3} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"></textarea>
      </div>

      <div className="flex justify-end">
        <button disabled={loading} type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
          {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>
    </form>
  );
}
