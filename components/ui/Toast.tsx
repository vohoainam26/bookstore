"use client";
import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, XCircle, Info, X } from "@phosphor-icons/react";
import { useCartStore } from "@/store/cartStore";
import { ToastMessage } from "@/lib/types";

const TOAST_ICONS = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
};

const TOAST_COLORS = {
  success: { bg: "var(--color-forest-900)", icon: "var(--color-forest-300)" },
  error: { bg: "#7f1d1d", icon: "#fca5a5" },
  info: { bg: "#1e3a5f", icon: "#93c5fd" },
};

function Toast({ toast, onRemove }: { toast: ToastMessage; onRemove: () => void }) {
  const Icon = TOAST_ICONS[toast.type];
  const colors = TOAST_COLORS[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl min-w-[280px] max-w-sm"
      style={{
        background: colors.bg,
        boxShadow: "0 8px 32px 0 rgb(0 0 0 / 0.30)",
        border: "1px solid rgb(255 255 255 / 0.10)",
      }}
    >
      <Icon size={20} style={{ color: colors.icon, flexShrink: 0 }} weight="fill" />
      <p
        className="text-sm font-medium flex-1 text-white"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {toast.message}
      </p>
      <button
        onClick={onRemove}
        className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Đóng"
      >
        <X size={16} color="white" />
      </button>
    </motion.div>
  );
}

export default function ToastContainer() {
  const { toasts, removeToast } = useCartStore();

  return (
    <div
      className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 items-end"
      aria-live="polite"
      aria-atomic="false"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            toast={toast}
            onRemove={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
