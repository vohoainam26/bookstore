"use client";

import { UserCircle } from "@phosphor-icons/react";

export function AdminTopbar({ userName }: { userName: string }) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end">
          <span className="text-sm font-semibold text-gray-900">{userName}</span>
          <span className="text-xs text-gray-500">Administrator</span>
        </div>
        <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
          <UserCircle size={24} weight="fill" />
        </div>
      </div>
    </header>
  );
}
