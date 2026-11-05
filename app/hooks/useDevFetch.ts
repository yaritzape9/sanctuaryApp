"use client"

import { useCallback } from "react"
import { useDevError } from "@/context/DevErrorContext"
import { fetchWithRetry } from "@/lib/fetchWithRetry"

export type DevFetchOptions = {
  /** Use fetchWithRetry (backoff on network errors, 5xx, 408, 429). */
  retry?: boolean
}

/**
 * Returns a fetch() that reports failures to the DEV error banner.
 *
 * The proxy routes only add `detail` to error bodies for DEV sessions
 * (lib/apiError.ts), and reportError is a no-op for everyone else, so
 * regular users never get error data in state. Callers still check
 * res.ok and catch network errors for their own user-facing message.
 */
export function useDevFetch() {
  const { reportError, clearError } = useDevError()

  return useCallback(
    async (url: string, init?: RequestInit, { retry = false }: DevFetchOptions = {}) => {
      // Same "METHOD /path" shape the proxies log, so a later success on
      // the same request clears the banner
      const endpoint = `${init?.method ?? "GET"} ${url}`

      let res: Response
      try {
        res = retry ? await fetchWithRetry(url, init) : await fetch(url, init)
      } catch (err) {
        reportError(endpoint, `Network error: ${err instanceof Error ? err.message : String(err)}`)
        throw err
      }

      if (res.ok) {
        clearError(endpoint)
      } else {
        reportError(endpoint, await readDetail(res))
      }
      return res
    },
    [reportError, clearError]
  )
}

// Reads the DEV-only detail from a copy, so the caller can still read the body
async function readDetail(res: Response): Promise<string> {
  try {
    const body = await res.clone().json()
    const message = body?.detail?.message
    if (typeof message === "string") return `${res.status}: ${message}`
  } catch {
    // Not JSON (e.g. a Next.js error page)
  }
  return `HTTP ${res.status}`
}
