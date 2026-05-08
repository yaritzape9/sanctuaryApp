"use client"

import { useEffect } from "react"

export type ToastType = "success" | "error" | "info"

export interface ToastMessage {
  id: number
  message: string
  type: ToastType
}

interface ToastProps {
  toasts: ToastMessage[]
  removeToast: (id: number) => void
}

const icons: Record<ToastType, string> = {
  success: "✓",
  error: "✕",
  info: "→",
}

const styles: Record<ToastType, string> = {
  success: "border-green-500/30 bg-green-500/10 text-green-400",
  error: "border-red-500/30 bg-red-500/10 text-red-400",
  info: "border-sanctuary-border bg-sanctuary-surface text-neutral-300",
}

function Toast({ toast, removeToast }: { toast: ToastMessage; removeToast: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => removeToast(toast.id), 4000)
    return () => clearTimeout(timer)
  }, [toast.id, removeToast])

  return (
    <div
      className={`flex items-center gap-3 border rounded px-4 py-3 text-sm shadow-lg w-full max-w-sm animate-fade-in ${styles[toast.type]}`}
    >
      <span className="shrink-0 font-medium">{icons[toast.type]}</span>
      <p className="flex-1">{toast.message}</p>
      <button
        onClick={() => removeToast(toast.id)}
        className="shrink-0 opacity-50 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  )
}

export default function ToastContainer({ toasts, removeToast }: ToastProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center w-full px-4">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} removeToast={removeToast} />
      ))}
    </div>
  )
}