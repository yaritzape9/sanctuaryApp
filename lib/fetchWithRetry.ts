// Statuses where the same request can succeed if sent again later:
// timeouts, rate limits and server errors. Every other 4xx means the
// request itself is wrong (or the user is logged out), so retrying can't help.
const RETRYABLE_STATUSES = new Set([408, 429])

export function isRetryableStatus(status: number) {
  return status >= 500 || RETRYABLE_STATUSES.has(status)
}

export type RetryOptions = {
  /** Total tries, including the first. */
  attempts?: number
  /** Wait before the 2nd try; doubles after each one (500 ms, 1 s, 2 s…). */
  baseDelayMs?: number
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * fetch() with exponential backoff. Retries network errors and retryable
 * statuses only. Resolves with the last Response (check res.ok / res.status),
 * or rejects with the last network error if every try failed to connect.
 */
export async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  { attempts = 3, baseDelayMs = 500 }: RetryOptions = {}
): Promise<Response> {
  let lastError: unknown

  for (let attempt = 0; attempt < attempts; attempt++) {
    if (attempt > 0) await sleep(baseDelayMs * 2 ** (attempt - 1))

    try {
      const res = await fetch(input, init)
      if (res.ok || !isRetryableStatus(res.status) || attempt === attempts - 1) {
        return res
      }
    } catch (err) {
      lastError = err
    }
  }

  throw lastError
}
