import { NextResponse } from "next/server"
import type { Session } from "next-auth"

/**
 * Builds a JSON error response for API proxy routes.
 * Always logs full detail server-side via console.error.
 * Only includes the `detail` field in the response body if the
 * caller's session role is DEV — regular users get a generic
 * response with no trace of the underlying error, even in devtools.
 */
export function errorResponse(
  session: Session | null,
  endpoint: string,
  userMessage: string,
  status: number,
  rawMessage: string
) {
  console.error(`${endpoint} error:`, rawMessage)

  const body: Record<string, unknown> = { error: userMessage }
  if (session?.user?.role === "DEV") {
    body.detail = { endpoint, message: rawMessage, status }
  }

  return NextResponse.json(body, { status })
}