"use client";

import { useState, useEffect } from "react";

interface Toast {
  id: number;
  message: string;
}

let toastId = 0;
const listeners: ((toast: Toast) => void)[] = [];

export function showToast(message: string) {
  const toast: Toast = { id: ++toastId, message };
  listeners.forEach((fn) => fn(toast));
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const timers = new Set<ReturnType<typeof setTimeout>>();

    const handler = (toast: Toast) => {
      setToasts((prev) => [...prev, toast]);
      const timer = setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
        timers.delete(timer);
      }, 2500);
      timers.add(timer);
    };

    listeners.push(handler);
    return () => {
      // 全タイマーをクリーンアップ
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
      const idx = listeners.indexOf(handler);
      if (idx >= 0) listeners.splice(idx, 1);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 space-y-2 safe-top" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium animate-slide-down"
          style={{
            background: "var(--md-on-surface)",
            color: "var(--md-surface)",
            borderRadius: "var(--md-shape-corner-sm)",
            boxShadow: "var(--md-elevation-2)",
          }}
        >
          <img src="/ponko.png" alt="" className="w-4 h-4" />
          {t.message}
        </div>
      ))}
    </div>
  );
}
