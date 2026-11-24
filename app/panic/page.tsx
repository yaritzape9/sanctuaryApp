"use client"
import { useSession } from "next-auth/react"

import { useState } from "react"
import Link from "next/link"
import { useToast } from "@/context/ToastContext"
import { useDevFetch } from "@/app/hooks/useDevFetch"
import { parsePanicResult, type PanicResult } from "@/lib/panicResult"

type Status = "safe" | "triggered"

const SESSION_EXPIRED = "Your session expired. Log in again, then try again."

// One random key per button press. fetchWithRetry resends the same init, so every
// retry of this press carries the same key and the backend texts contacts only once.
// If the browser can't make one, the alert still goes out, just without the key.
function idempotencyHeaders(): Record<string, string> {
  const key = globalThis.crypto?.randomUUID?.()
  return key ? { "Idempotency-Key": key } : {}
}

async function readResult(res: Response): Promise<PanicResult | null> {
  try {
    return parsePanicResult(await res.json())
  } catch {
    return null
  }
}

export default function PanicPage() {
  const [status, setStatus] = useState<Status>("safe")
  const [locationShared, setLocationShared] = useState(true)
  // Set only after a partial send; null means every contact was reached
  const [reached, setReached] = useState<{ sent: number; total: number } | null>(null)
  const [noContacts, setNoContacts] = useState(false)
  // True from the press until the reply, so a second tap can't send a second alert
  const [sending, setSending] = useState(false)
  const { addToast } = useToast()
  const devFetch = useDevFetch()
  // Identity comes from the backend JWT, so the page only needs to know
  // whether someone is logged in, never who
  const { status: sessionStatus } = useSession()

async function handleTrigger() {
  if (sessionStatus !== "authenticated") {
    addToast("Please log in before triggering an alert.", "error")
    return
  }
  setNoContacts(false)

  let lat: number | undefined
  let lng: number | undefined

  try {
    const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
    )
    lat = pos.coords.latitude
    lng = pos.coords.longitude
  } catch { /* proceed without location */ }

  let res: Response | undefined
  try {
    res = await devFetch(
      "/api/panic/trigger",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", ...idempotencyHeaders() },
        body: JSON.stringify({ lat, lng }),
      },
      { retry: true }
    )
  } catch { /* every try failed to connect */ }

  if (res?.ok) {
    // lat stays undefined when geolocation failed or was denied, and then the
    // backend's SMS says the location could not be shared
    const shared = lat !== undefined && lng !== undefined
    const result = await readResult(res)
    setLocationShared(shared)
    setStatus("triggered")

    if (result?.status === "partial") {
      // Some texts failed. Don't retry: the ones that went out would be sent twice
      const total = result.sent + result.failed
      setReached({ sent: result.sent, total })
      addToast(
        `Alert reached ${result.sent} of ${total} contacts${shared ? "" : ", without your location"}. Text the others directly.`,
        "error"
      )
    } else {
      setReached(null)
      addToast(
        shared
          ? "Alert sent to your emergency contacts."
          : "Alert sent, but your location could not be shared.",
        "success"
      )
    }
  } else if (res?.status === 422) {
    setNoContacts(true)
    addToast("No one was alerted. Add an emergency contact first.", "error")
  } else if (res?.status === 401) {
    addToast(SESSION_EXPIRED, "error")
  } else {
    addToast("Could not send alert. Text your emergency contact directly.", "error")
  }
}

async function handleReset() {
  let res: Response | undefined
  try {
    res = await devFetch(
      "/api/panic/safe",
      { method: "POST", headers: idempotencyHeaders() },
      { retry: true }
    )
  } catch { /* every try failed to connect */ }

  if (res?.ok) {
    const result = await readResult(res)
    setStatus("safe")
    setReached(null)
    addToast(
      result?.status === "partial"
        ? `All-clear reached ${result.sent} of ${result.sent + result.failed} contacts. Tell the others you're safe.`
        : "Glad you're safe.",
      result?.status === "partial" ? "info" : "success"
    )
  } else if (res?.status === 422) {
    // Their contacts were deleted while the alert was active
    setStatus("safe")
    setReached(null)
    addToast("You're marked safe. There were no contacts to notify.", "info")
  } else if (res?.status === 401) {
    addToast(SESSION_EXPIRED, "error")
  } else {
    addToast("Could not send safe status. Try again.", "error")
  }
}

  async function whileSending(action: () => Promise<void>) {
    setSending(true)
    try {
      await action()
    } finally {
      setSending(false)
    }
  }

  const contactsText = reached
    ? `${reached.sent} of your ${reached.total} emergency contacts`
    : "your emergency contacts"

  return (
    <main className="mobile-screen px-8 md:px-16 lg:px-24 py-16">

      {/* Header */}
      <section className="mb-16">
        <p className="section-label mb-4">Panic Button</p>
        <h1 className="font-heading text-5xl md:text-6xl font-semibold leading-none tracking-tight text-white mb-6">
          {status === "safe" ? "You are safe." : "Alert triggered."}
        </h1>
        <div className="divider" />
      </section>

      <div className="grid lg:grid-cols-2 gap-16 items-start">

        {/* Left — button */}
        <div className="flex flex-col items-center justify-center gap-8">

          {status === "safe" ? (
            <>
              <p className="text-neutral-400 text-center leading-relaxed max-w-sm">
                Press the button below if you are in danger. Your emergency contacts
                will be notified immediately with your location.
              </p>

              {/* Panic button */}
              <button
                onClick={() => whileSending(handleTrigger)}
                disabled={sending || sessionStatus === "loading"}
                className="relative w-48 h-48 rounded-full bg-red-500 hover:bg-red-600 active:scale-95 transition-all duration-150 shadow-lg shadow-red-500/30 flex items-center justify-center flex-col gap-2 group disabled:opacity-50 disabled:cursor-wait"
              >
                <span className="text-4xl">🆘</span>
                <span className="text-white font-semibold text-sm tracking-wide uppercase">
                  Panic
                </span>
                {/* Pulse ring */}
                <span className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping opacity-20" />
              </button>

              {noContacts && (
                <div role="alert" className="border border-red-500/40 bg-red-500/5 rounded-xl px-5 py-4 text-sm text-neutral-300 text-center max-w-sm">
                  No one was alerted: you have no emergency contacts.{" "}
                  <Link href="/profile" className="text-white underline">
                    Add an emergency contact
                  </Link>
                </div>
              )}

              <p className="text-xs text-neutral-600 text-center max-w-xs">
                Make sure your{" "}
                <Link href="/profile" className="text-neutral-400 hover:text-white underline transition-colors">
                  emergency contacts
                </Link>{" "}
                are set up before you need them.
              </p>
            </>
          ) : (
            <>
              <p className="text-neutral-400 text-center leading-relaxed max-w-sm">
                {reached
                  ? `Your alert reached ${reached.sent} of ${reached.total} emergency contacts. Text the others if you can.`
                  : "Your emergency contacts have been notified."}{" "}
                Stay calm and assert your rights. Help is on the way.
              </p>

              {/* Triggered state button */}
              <div className="relative w-48 h-48 rounded-full bg-red-600 shadow-lg shadow-red-500/40 flex items-center justify-center flex-col gap-2">
                <span className="text-4xl">🆘</span>
                <span className="text-white font-semibold text-sm tracking-wide uppercase">
                  Active
                </span>
                <span className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping opacity-30" />
              </div>

              <button
                onClick={() => whileSending(handleReset)}
                disabled={sending}
                className="btn-outline px-6 py-2 disabled:opacity-50 disabled:cursor-wait"
              >
                I am safe now
              </button>
            </>
          )}
        </div>

        {/* Right — status + info */}
        <div className="flex flex-col gap-6">

          {/* Status card */}
          <div className={`border rounded-xl px-6 py-6 transition-colors ${
            status === "triggered"
              ? "border-red-500/40 bg-red-500/5"
              : "border-sanctuary-border bg-sanctuary-surface"
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-2 h-2 rounded-full ${
                status === "triggered" ? "bg-red-500 animate-pulse" : "bg-green-500"
              }`} />
              <p className="section-label">
                {status === "triggered" ? "Alert active" : "Status: Safe"}
              </p>
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed">
              {status === "triggered"
                ? locationShared
                  ? `An SMS alert has been sent to ${contactsText} with your current location. You can cancel this alert once you are safe.`
                  : `An SMS alert has been sent to ${contactsText}, but your location could not be shared. Tell them where you are if you can. You can cancel this alert once you are safe.`
                : "No active alerts. Your emergency contacts will be notified the moment you trigger the panic button."}
            </p>
          </div>

          {/* Know your rights reminder */}
          <div className="border border-sanctuary-border bg-sanctuary-surface rounded-xl px-6 py-6">
            <p className="section-label mb-4">Remember your rights</p>
            <div className="flex flex-col gap-3">
              {[
                "You have the right to remain silent.",
                "You do not have to open the door without a warrant.",
                "You have the right to speak with a lawyer.",
                "Do not sign any documents without legal counsel.",
              ].map((right) => (
                <div key={right} className="flex items-start gap-3">
                  <span className="text-sanctuary-accent mt-0.5 shrink-0">→</span>
                  <p className="text-sm text-neutral-400">{right}</p>
                </div>
              ))}
            </div>
            <Link
              href="/know-your-rights"
              className="btn-outline mt-6 inline-flex text-sm py-2 px-4"
            >
              Full rights guide →
            </Link>
          </div>

        </div>
      </div>
    </main>
  )
}