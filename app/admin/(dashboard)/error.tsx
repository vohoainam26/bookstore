"use client";

import { useEffect } from "react";
import { WarningCircle } from "@phosphor-icons/react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <WarningCircle size={64} weight="fill" className="text-red-500 mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Đã xảy ra lỗi</h2>
      <p className="text-gray-500 mb-6">{error.message || "Không thể tải dữ liệu."}</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
      >
        Thử lại
      </button>
    </div>
  );
}
