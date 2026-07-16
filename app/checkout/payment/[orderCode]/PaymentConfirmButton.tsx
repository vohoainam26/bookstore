"use client";

import { useState } from "react";
import { completeTestBankTransfer } from "@/lib/data/payments";
import { SpinnerGap, CheckCircle } from "@phosphor-icons/react";

export default function PaymentConfirmButton({ orderId }: { orderId: number }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    
    const res = await completeTestBankTransfer(orderId);
    if (!res.success) {
      setError(res.error || "Đã xảy ra lỗi");
      setLoading(false);
    } else {
      // The page will redirect automatically via revalidatePath/router or we let user click link
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col items-center">
      {error && <p className="text-red-500 mb-3 text-sm">{error}</p>}
      <button
        onClick={handleConfirm}
        disabled={loading}
        className={`px-8 py-3 rounded-xl font-bold text-white shadow-md transition-colors flex items-center gap-2 ${
          loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        {loading ? (
          <><SpinnerGap size={20} className="animate-spin" /> Đang xử lý...</>
        ) : (
          <><CheckCircle size={22} weight="bold" /> TÔI ĐÃ HOÀN TẤT CHUYỂN KHOẢN</>
        )}
      </button>
      <p className="text-gray-400 text-xs mt-3">Nút này chỉ khả dụng trong môi trường kiểm thử (TEST MODE)</p>
    </div>
  );
}
