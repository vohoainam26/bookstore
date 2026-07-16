import React from "react";

export function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    pending_payment: { label: "Chờ thanh toán", color: "bg-yellow-100 text-yellow-800" },
    pending: { label: "Chờ xác nhận", color: "bg-orange-100 text-orange-800" },
    confirmed: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-800" },
    processing: { label: "Đang chuẩn bị", color: "bg-indigo-100 text-indigo-800" },
    shipping: { label: "Đang giao", color: "bg-purple-100 text-purple-800" },
    delivered: { label: "Đã giao", color: "bg-green-100 text-green-800" },
    cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-800" },
  };

  const current = map[status] || { label: status, color: "bg-gray-100 text-gray-800" };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${current.color}`}>
      {current.label}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    unpaid: { label: "Chưa thanh toán", color: "bg-gray-100 text-gray-800" },
    awaiting_payment: { label: "Chờ thanh toán", color: "bg-yellow-100 text-yellow-800" },
    paid: { label: "Đã thanh toán", color: "bg-green-100 text-green-800" },
    failed: { label: "Thất bại", color: "bg-red-100 text-red-800" },
    refunded: { label: "Đã hoàn tiền", color: "bg-gray-200 text-gray-800" },
  };

  const current = map[status] || { label: status, color: "bg-gray-100 text-gray-800" };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${current.color}`}>
      {current.label}
    </span>
  );
}
