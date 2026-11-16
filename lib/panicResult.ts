// The outcome the backend returns from /api/panic/trigger and /api/panic/safe:
// 200 "sent" | "partial", 422 "no_contacts", 502 "failed". Only counts, never who was texted.
export type PanicResult = {
  status: "sent" | "partial" | "failed" | "no_contacts"
  sent: number
  failed: number
}

const STATUSES = ["sent", "partial", "failed", "no_contacts"]

const isCount = (value: unknown): value is number =>
  Number.isInteger(value) && (value as number) >= 0

/** Rebuilds a PanicResult from only its 3 known fields, or returns null if it isn't one. */
export function parsePanicResult(value: unknown): PanicResult | null {
  if (typeof value !== "object" || value === null) return null
  const { status, sent, failed } = value as Record<string, unknown>
  if (typeof status !== "string" || !STATUSES.includes(status)) return null
  if (!isCount(sent) || !isCount(failed)) return null
  return { status: status as PanicResult["status"], sent, failed }
}

/** Same as parsePanicResult, for a raw response body that may not be JSON. */
export function parsePanicText(text: string): PanicResult | null {
  try {
    return parsePanicResult(JSON.parse(text))
  } catch {
    return null
  }
}
