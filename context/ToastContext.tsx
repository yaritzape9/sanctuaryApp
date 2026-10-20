"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import ToastContainer, { type ToastMessage, type ToastType } from "@/components/Toast"

interface ToastContextType {
  addToast: (message: string, type?: ToastType) => void
}

// No default value: a component outside the provider would drop its toasts silently,
// which is the bug this context replaces
const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  // A counter, not Date.now(), so two toasts in the same millisecond get different ids
  const nextId = useRef(0)

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = nextId.current++
    setToasts((prev) => [...prev, { id, message, type }])
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Only addToast is shared, so callers don't re-render when the toast list changes
  const value = useMemo(() => ({ addToast }), [addToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>")
  return ctx
}
