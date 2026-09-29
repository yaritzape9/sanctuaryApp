"use client"

import { useDevError } from "@/context/DevErrorContext"

export default function DevErrorBanner() {
  const { error, dismissError } = useDevError()

  if (!error) return null

  return (
    <div
      role="alert"
      className="fixed inset-x-0 top-0 z-[60] flex items-center gap-3 bg-red-600 px-4 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] text-xs text-white shadow-lg"
    >
      <span className="shrink-0 font-semibold">🔴 DEV MODE ON</span>
      <span
        className="max-w-[40%] shrink-0 truncate font-mono"
        title={error.endpoint}
      >
        {error.endpoint}
      </span>
      <span className="min-w-0 flex-1 truncate" title={error.message}>
        {error.message}
      </span>
      <button
        onClick={dismissError}
        className="shrink-0 opacity-70 transition-opacity hover:opacity-100"
        aria-label="Dismiss dev error"
      >
        ✕
      </button>
    </div>
  )
}