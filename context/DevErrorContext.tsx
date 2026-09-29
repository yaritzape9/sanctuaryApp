"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
  const { data: session } = useSession()
  const isDev = session?.user?.role === "DEV"
  const [error, setError] = useState<DevError | null>(null)

  // If the user logs out or stops being a DEV, drop any stored error
  useEffect(() => {
    if (!isDev) setError(null)
  }, [isDev])

  // No-op for non-DEV users, so error data never enters React state
  const reportError = useCallback(
    (endpoint: string, message: string) => {
      if (!isDev) return
      setError({ endpoint, message })
    },
    [isDev]
  )

  // Only clears if the success came from the endpoint that is currently failing
  const clearError = useCallback((endpoint: string) => {
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