'use client';

import { useState } from 'react';
import { adjustInventory } from '@/app/admin/(dashboard)/products/actions';

export default function InventoryAdjustmentForm({ product }: { product: any }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const operation = formData.get('operation') as string;
    const quantity = Number(formData.get('quantity'));
    const reason = formData.get('reason') as string;

    if (!confirm(`Bạn chắc chắn muốn ${operation === 'add' ? 'thêm' : operation === 'remove' ? 'giảm' : 'đặt'} tồn kho với số lượng ${quantity}? Hành động này sẽ được lưu vào lịch sử.`)) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await adjustInventory(product.id, operation, quantity, reason);
      setMessage('Điều chỉnh tồn kho thành công!');
      (e.target as HTMLFormElement).reset();
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Thao tác</label>
          <select name="operation" required className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white">
            <option value="add">Nhập thêm</option>
            <option value="remove">Trừ kho</option>
            <option value="set">Đặt số lượng chính xác</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng</label>
          <input required type="number" min="0" name="quantity" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Lý do điều chỉnh</label>
        <input required type="text" minLength={3} maxLength={500} name="reason" placeholder="Ví dụ: Nhập hàng đợt 1, Khách trả hàng..." className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
      </div>

      <div className="flex justify-end">
        <button disabled={loading} type="submit" className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50">
          {loading ? 'Đang xử lý...' : 'Xác nhận điều chỉnh'}
        </button>
      </div>
    </form>
  );
}
