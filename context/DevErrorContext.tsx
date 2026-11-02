"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { useSession } from "next-auth/react"

export interface DevError {
  endpoint: string
  message: string
}

interface DevErrorContextType {
  error: DevError | null
  reportError: (endpoint: string, message: string) => void
  clearError: (endpoint: string) => void
  dismissError: () => void
}

const DevErrorContext = createContext<DevErrorContextType>({
  error: null,
  reportError: () => {},
  clearError: () => {},
  dismissError: () => {},
})

export function DevErrorProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const isDev = session?.user?.role === "DEV"
  const isLoading = status === "loading"
  const [error, setError] = useState<DevError | null>(null)

  // First error reported before the role is known. Kept in a ref, not state,
  // so it never renders and is thrown away unless the session turns out DEV
  const pendingRef = useRef<DevError | null>(null)

  // Live session values for reportError. Fetches started while the session
  // was loading still hold the reportError from that render, so it can't
  // read isDev from its closure
  const sessionRef = useRef({ isDev, isLoading })

  useEffect(() => {
    sessionRef.current = { isDev, isLoading }
    if (isLoading) return

    // Session resolved: show the held error to a DEV, discard it otherwise
    const pending = pendingRef.current
    pendingRef.current = null
    if (!isDev) {
      // Also covers logging out or stopping being a DEV
      setError(null)
    } else if (pending) {
      setError((prev) => prev ?? pending)
    }
  }, [isDev, isLoading])

  // No-op for non-DEV users, so error data never enters React state
  const reportError = useCallback((endpoint: string, message: string) => {
    const { isDev, isLoading } = sessionRef.current
    if (isDev) {
      setError({ endpoint, message })
    } else if (isLoading && !pendingRef.current) {
      pendingRef.current = { endpoint, message }
    }
  }, [])

  // Only clears if the success came from the endpoint that is currently failing
  const clearError = useCallback((endpoint: string) => {
    if (pendingRef.current?.endpoint === endpoint) pendingRef.current = null
    setError((prev) => (prev?.endpoint === endpoint ? null : prev))
  }, [])

  const dismissError = useCallback(() => setError(null), [])

  const value = useMemo(
    () => ({ error, reportError, clearError, dismissError }),
    [error, reportError, clearError, dismissError]
  )

  return (
    <DevErrorContext.Provider value={value}>
      {children}
    </DevErrorContext.Provider>
  )
}

export function useDevError() {
  return useContext(DevErrorContext)
}