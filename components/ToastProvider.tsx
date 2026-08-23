"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";
import { useShoppingStore } from "@/store/shoppingStore";
import { Toast, ToastType } from "@/types";

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-5 h-5 text-emerald-400 drop-shadow-md" />,
  error: <XCircle className="w-5 h-5 text-red-400 drop-shadow-md" />,
  info: <Info className="w-5 h-5 text-blue-400 drop-shadow-md" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-400 drop-shadow-md" />,
};

const BG_COLORS: Record<ToastType, string> = {
  success: "border-emerald-500/30 bg-[#064e3b]/80 shadow-[0_4px_20px_rgba(16,185,129,0.2)]",
  error: "border-red-500/30 bg-[#7f1d1d]/80 shadow-[0_4px_20px_rgba(239,68,68,0.2)]",
  info: "border-blue-500/30 bg-[#1e3a8a]/80 shadow-[0_4px_20px_rgba(59,130,246,0.2)]",
  warning: "border-amber-500/30 bg-[#78350f]/80 shadow-[0_4px_20px_rgba(245,158,11,0.2)]",
};

function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast } = useShoppingStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(toast.id);
    }, toast.duration ?? 3500);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, removeToast]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 40, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.92 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`flex items-start gap-3 px-4 py-3.5 rounded-2xl border backdrop-blur-xl max-w-sm w-full ${BG_COLORS[toast.type]}`}
    >
      <div className="flex-shrink-0 mt-0.5">{ICONS[toast.type]}</div>
      <p className="text-sm font-semibold text-white flex-1 leading-relaxed tracking-wide">
        {toast.message}
      </p>
      <button
        onClick={() => removeToast(toast.id)}
        className="flex-shrink-0 p-1 -mr-1 -mt-1 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export function ToastProvider() {
  const { toasts } = useShoppingStore();

  return (
    <div
      className="fixed bottom-6 right-4 left-4 sm:left-auto z-50 flex flex-col gap-3 pointer-events-none"
      aria-live="polite"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
