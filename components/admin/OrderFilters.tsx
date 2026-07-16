"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";

export function OrderFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [paymentStatus, setPaymentStatus] = useState(searchParams.get("payment_status") || "");

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (search) params.set("search", search);
    else params.delete("search");

    if (status) params.set("status", status);
    else params.delete("status");

    if (paymentStatus) params.set("payment_status", paymentStatus);
    else params.delete("payment_status");

    params.set("page", "1"); // Reset to page 1 on filter change
    
    const newUrl = `${pathname}?${params.toString()}`;
    router.replace(newUrl);
  }, [search, status, paymentStatus, pathname, router]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlass className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        <input
          type="text"
          className="block w-full rounded-md border-0 py-2 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"
          placeholder="Tìm mã đơn hoặc tên khách hàng..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="block w-full sm:w-48 rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-red-600 sm:text-sm sm:leading-6"
      >
        <option value="">Tất cả trạng thái đơn</option>
        <option value="pending_payment">Chờ thanh toán</option>
        <option value="pending">Chờ xác nhận</option>
        <option value="confirmed">Đã xác nhận</option>
        <option value="processing">Đang chuẩn bị</option>
        <option value="shipping">Đang giao</option>
        <option value="delivered">Đã giao</option>
        <option value="cancelled">Đã hủy</option>
      </select>

      <select
        value={paymentStatus}
        onChange={(e) => setPaymentStatus(e.target.value)}
        className="block w-full sm:w-48 rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-red-600 sm:text-sm sm:leading-6"
      >
        <option value="">Tất cả thanh toán</option>
        <option value="unpaid">Chưa thanh toán</option>
        <option value="awaiting_payment">Chờ thanh toán</option>
        <option value="paid">Đã thanh toán</option>
        <option value="failed">Thất bại</option>
        <option value="refunded">Đã hoàn tiền</option>
      </select>
    </div>
  );
}
