"use client"

import { useState } from "react"
import Link from "next/link"

type Status = "safe" | "triggered"

export default function PanicPage() {
  const [status, setStatus] = useState<Status>("safe")

  function handleTrigger() {
    setStatus("triggered")
    // TODO: call Spring Boot API → Twilio SMS to emergency contacts
  }

  function handleReset() {
    setStatus("safe")
    // TODO: notify contacts that user is safe
  }

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
                onClick={handleTrigger}
                className="relative w-48 h-48 rounded-full bg-red-500 hover:bg-red-600 active:scale-95 transition-all duration-150 shadow-lg shadow-red-500/30 flex items-center justify-center flex-col gap-2 group"
              >
                <span className="text-4xl">🆘</span>
                <span className="text-white font-semibold text-sm tracking-wide uppercase">
                  Panic
                </span>
                {/* Pulse ring */}
                <span className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping opacity-20" />
              </button>

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
                Your emergency contacts have been notified. Stay calm and assert
                your rights. Help is on the way.
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
                onClick={handleReset}
                className="btn-outline px-6 py-2"
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
                ? "An SMS alert has been sent to your emergency contacts with your current location. You can cancel this alert once you are safe."
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