'use client';

import { useState } from 'react';
import { addCustomerNote } from '@/app/admin/(dashboard)/customers/actions';

export default function CustomerNoteForm({ customerId }: { customerId: string }) {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;

    setLoading(true);
    try {
      await addCustomerNote(customerId, note);
      setNote('');
    } catch (error: any) {
      alert('Lỗi khi thêm ghi chú: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
        rows={3}
        placeholder="Nhập ghi chú nội bộ (khách hàng không nhìn thấy)..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        required
      ></textarea>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || !note.trim()}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Đang lưu...' : 'Thêm Ghi chú'}
        </button>
      </div>
    </form>
  );
}
