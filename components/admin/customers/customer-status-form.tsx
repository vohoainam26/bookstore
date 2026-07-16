'use client';

import { useState } from 'react';
import { blockCustomer, unblockCustomer } from '@/app/admin/(dashboard)/customers/actions';

export default function CustomerStatusForm({ customer }: { customer: any }) {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState(customer.blocked_reason || '');

  const handleBlock = async () => {
    if (!reason.trim()) {
      alert('Vui lòng nhập lý do khóa tài khoản!');
      return;
    }
    if (!confirm('Bạn có chắc chắn muốn KHÓA tài khoản này? Người dùng sẽ không thể đăng nhập và mua hàng.')) return;
    
    setLoading(true);
    try {
      await blockCustomer(customer.id, reason);
      alert('Đã khóa tài khoản thành công!');
    } catch (e: any) {
      alert('Lỗi: ' + e.message);
    }
    setLoading(false);
  };

  const handleUnblock = async () => {
    if (!confirm('Bạn có chắc chắn muốn MỞ KHÓA tài khoản này?')) return;
    
    setLoading(true);
    try {
      await unblockCustomer(customer.id);
      setReason('');
      alert('Đã mở khóa tài khoản thành công!');
    } catch (e: any) {
      alert('Lỗi: ' + e.message);
    }
    setLoading(false);
  };

  if (customer.is_active) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Lý do khóa (bắt buộc)</label>
          <textarea
            className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-red-500 focus:border-red-500"
            rows={3}
            placeholder="Nhập lý do vi phạm..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          ></textarea>
        </div>
        <button
          onClick={handleBlock}
          disabled={loading || !reason.trim()}
          className="w-full bg-red-600 text-white font-medium py-2 px-4 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Đang xử lý...' : 'Khóa Tài Khoản'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-red-50 p-4 rounded-md border border-red-100 text-sm">
        <strong className="text-red-800 block mb-1">Tài khoản đang bị khóa</strong>
        <p className="text-red-700 mb-2"><strong>Lý do:</strong> {customer.blocked_reason}</p>
        <p className="text-red-600 text-xs">Vào lúc: {customer.blocked_at ? new Date(customer.blocked_at).toLocaleString('vi-VN') : 'N/A'}</p>
      </div>
      <button
        onClick={handleUnblock}
        disabled={loading}
        className="w-full bg-gray-900 text-white font-medium py-2 px-4 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        {loading ? 'Đang xử lý...' : 'Mở Khóa Tài Khoản'}
      </button>
    </div>
  );
}
