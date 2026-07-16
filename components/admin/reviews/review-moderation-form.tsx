'use client';

import { useState } from 'react';
import { moderateReview } from '@/app/admin/(dashboard)/reviews/actions';

export default function ReviewModerationForm({ review }: { review: any }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(review.status);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    const formData = new FormData(e.currentTarget);
    const newStatus = formData.get('status') as string;
    const reason = formData.get('reason') as string;

    try {
      await moderateReview(review.id, newStatus, reason);
      setMessage('Đã cập nhật trạng thái kiểm duyệt thành công!');
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái đánh giá</label>
          <select 
            name="status" 
            value={status} 
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
          >
            <option value="published">Đang hiển thị (Published)</option>
            <option value="hidden">Ẩn (Hidden)</option>
            <option value="flagged">Gắn cờ (Flagged)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Lý do kiểm duyệt {status !== 'published' && <span className="text-red-500">*</span>}
        </label>
        <textarea 
          name="reason" 
          required={status !== 'published'}
          defaultValue={review.moderation_reason || ''} 
          rows={3} 
          placeholder={status !== 'published' ? 'Bắt buộc nhập lý do (VD: Ngôn từ không phù hợp)' : 'Không bắt buộc'}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        ></textarea>
      </div>

      <div className="flex justify-end">
        <button disabled={loading} type="submit" className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50">
          {loading ? 'Đang lưu...' : 'Lưu trạng thái'}
        </button>
      </div>
    </form>
  );
}
