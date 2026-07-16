"use client";

import { useState } from "react";
import { updateOrderStatus, updatePaymentStatus } from "@/app/admin/actions";
import { Spinner } from "@phosphor-icons/react";

export function OrderStatusForm({ orderId, currentStatus }: { orderId: number; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === currentStatus) return;
    
    if (!confirm("Bạn có chắc chắn muốn cập nhật trạng thái đơn hàng này?")) return;

    setLoading(true);
    setError("");
    setSuccess("");

    const res = await updateOrderStatus(orderId, status, note);
    
    if (res.success) {
      setSuccess("Cập nhật trạng thái thành công!");
      setNote("");
    } else {
      setError(res.error || "Có lỗi xảy ra.");
      setStatus(currentStatus); // Revert
    }
    
    setLoading(false);
  };

  const isFinal = currentStatus === "delivered" || currentStatus === "cancelled";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-red-50 text-red-600 rounded text-sm">{error}</div>}
      {success && <div className="p-3 bg-green-50 text-green-600 rounded text-sm">{success}</div>}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái mới</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          disabled={loading || isFinal}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
        >
          <option value="pending_payment">Chờ thanh toán</option>
          <option value="pending">Chờ xác nhận</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="processing">Đang chuẩn bị</option>
          <option value="shipping">Đang giao</option>
          <option value="delivered">Đã giao</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú (tùy chọn)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={loading || isFinal}
          rows={2}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
          placeholder="Lý do hủy đơn, ghi chú cho kho,..."
        />
      </div>

      <button
        type="submit"
        disabled={loading || isFinal || status === currentStatus}
        className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50"
      >
        {loading ? <Spinner size={16} className="animate-spin" /> : "Cập nhật đơn hàng"}
      </button>
    </form>
  );
}

export function PaymentStatusForm({ orderId, currentStatus }: { orderId: number; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === currentStatus) return;
    
    if (!confirm("Bạn có chắc chắn muốn cập nhật trạng thái thanh toán này?")) return;

    setLoading(true);
    setError("");
    setSuccess("");

    const res = await updatePaymentStatus(orderId, status, note);
    
    if (res.success) {
      setSuccess("Cập nhật thanh toán thành công!");
      setNote("");
    } else {
      setError(res.error || "Có lỗi xảy ra.");
      setStatus(currentStatus); // Revert
    }
    
    setLoading(false);
  };

  const isPaid = currentStatus === "paid" || currentStatus === "refunded";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-red-50 text-red-600 rounded text-sm">{error}</div>}
      {success && <div className="p-3 bg-green-50 text-green-600 rounded text-sm">{success}</div>}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái thanh toán mới</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          disabled={loading || isPaid}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
        >
          <option value="unpaid">Chưa thanh toán</option>
          <option value="awaiting_payment">Chờ thanh toán</option>
          <option value="paid">Đã thanh toán</option>
          <option value="failed">Thất bại</option>
          <option value="refunded">Đã hoàn tiền</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú (tùy chọn)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={loading || isPaid}
          rows={2}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
          placeholder="Mã GD ngân hàng..."
        />
      </div>

      <button
        type="submit"
        disabled={loading || isPaid || status === currentStatus}
        className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? <Spinner size={16} className="animate-spin" /> : "Xác nhận thanh toán"}
      </button>
    </form>
  );
}
