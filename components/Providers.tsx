"use client"

import { SessionProvider } from "next-auth/react"
import { DevErrorProvider } from "@/context/DevErrorContext"
import DevErrorBanner from "@/components/DevErrorBanner"
import { ToastProvider } from "@/context/ToastContext"

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <DevErrorProvider>
        <DevErrorBanner />
        <ToastProvider>{children}</ToastProvider>
      </DevErrorProvider>
    </SessionProvider>
  )
}