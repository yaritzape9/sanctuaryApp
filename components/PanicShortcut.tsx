"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"

export default function PanicShortcut() {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [countdown, setCountdown] = useState(30)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)

  function clearTimers() {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (countdownRef.current) clearInterval(countdownRef.current)
  }

  function handleConfirm() {
    clearTimers()
    setConfirming(false)
    setCountdown(30)
    router.push("/panic")
  }

  function handleCancel() {
    clearTimers()
    setConfirming(false)
    setCountdown(30)
  }

  useEffect(() => {
    if (confirming) {
      // Auto-trigger after 30 seconds
      timerRef.current = setTimeout(() => {
        setConfirming(false)
        setCountdown(30)
        router.push("/panic")
      }, 30000)

      // Tick countdown every second
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)
    }

    return () => clearTimers()
  }, [confirming, router])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return
      if (e.key === "Escape" && confirming) {
        handleCancel()
        return
      }
      if (e.key === "p" || e.key === "P") setConfirming(true)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [confirming])

  if (!confirming) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm" />

      {/* Confirmation overlay */}
      <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 pointer-events-none">
        <div className="w-full max-w-sm bg-sanctuary-surface border border-red-500/30 rounded-xl p-6 pointer-events-auto text-center">

          {/* Countdown ring */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle
                cx="40" cy="40" r="34"
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="6"
              />
              <circle
                cx="40" cy="40" r="34"
                fill="none"
                stroke="#ef4444"
                strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 34}`}
                strokeDashoffset={`${2 * Math.PI * 34 * (1 - countdown / 30)}`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-mono font-bold text-white">{countdown}</span>
            </div>
          </div>

          <h2 className="font-heading text-2xl font-semibold text-white mb-2">
            Trigger panic button?
          </h2>
          <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
            Your emergency contacts will be notified with your location.
            Activating automatically in <span className="text-red-400 font-medium">{countdown}s</span> unless you cancel.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleConfirm}
              className="w-full py-3 rounded text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors"
            >
              🆘 Yes, trigger now
            </button>
            <button
              onClick={handleCancel}
              className="btn-outline w-full justify-center"
            >
              Cancel (Esc)
            </button>
          </div>

        </div>
      </div>
    </>
  )
}