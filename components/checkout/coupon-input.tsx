"use client";

import { useState } from "react";
import { Tag, X, SpinnerGap, CheckCircle } from "@phosphor-icons/react";
import { CheckoutTotals } from "@/app/checkout/coupon-actions";

export default function CouponInput({
  onApply,
  onRemove,
  loading,
  couponData
}: {
  onApply: (code: string) => void;
  onRemove: () => void;
  loading: boolean;
  couponData: CheckoutTotals | null;
}) {
  const [code, setCode] = useState("");

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    onApply(code.trim().toUpperCase());
  };

  const activeCoupon = couponData?.coupon_valid && couponData?.coupon_code;

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 mb-4">
      <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
        <Tag size={18} className="text-blue-600" />
        Mã giảm giá
      </h3>

      {!activeCoupon ? (
        <form onSubmit={handleApply} className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Nhập mã ưu đãi..."
            disabled={loading}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 uppercase disabled:bg-gray-50"
          />
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed min-w-[90px] flex items-center justify-center"
          >
            {loading ? <SpinnerGap size={18} className="animate-spin" /> : "Áp dụng"}
          </button>
        </form>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-semibold text-green-700 flex items-center gap-1.5 text-sm">
              <CheckCircle size={16} weight="fill" />
              Đã áp dụng mã {couponData.coupon_code}
            </span>
            <span className="text-xs text-green-600 mt-0.5">
              Bạn được giảm {(couponData.discount_amount + couponData.shipping_discount_amount).toLocaleString("vi-VN")} ₫
            </span>
          </div>
          <button
            onClick={onRemove}
            disabled={loading}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
            title="Xoá mã"
          >
            <X size={16} weight="bold" />
          </button>
        </div>
      )}

      {/* Error messages are handled globally or we can show it here if we refactor, but the requirement suggests showing alerts or below input */}
    </div>
  );
}
