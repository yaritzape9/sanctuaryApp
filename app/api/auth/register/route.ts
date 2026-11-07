import { NextResponse } from "next/server"
import { errorResponse } from "@/lib/apiError"

const API_URL = process.env.SANCTUARY_API_URL ?? "http://localhost:8080"
const ENDPOINT = "POST /api/auth/register"
const INVALID_MESSAGE = "Enter a valid email and a password of 12 to 72 characters."

// Public signup. Forwards only email and password. The backend's JWT stays here:
// the page gets its session by signing in through NextAuth afterwards.
// Messages are fixed, so no backend text reaches the browser.
export async function POST(req: Request) {
  let email: unknown
  let password: unknown
  try {
    ;({ email, password } = await req.json())
  } catch {
    return NextResponse.json({ error: INVALID_MESSAGE }, { status: 400 })
  }

  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: INVALID_MESSAGE }, { status: 400 })
  }

  try {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    if (res.ok) {
      return NextResponse.json({ success: true }, { status: 201 })
    }
    if (res.status === 409) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      )
    }
    if (res.status === 400) {
      return NextResponse.json({ error: INVALID_MESSAGE }, { status: 400 })
    }

    return errorResponse(null, ENDPOINT, "Unable to create account", 502, `Backend returned ${res.status}`)
  } catch (err) {
    return errorResponse(
      null,
      ENDPOINT,
      "Unable to create account",
      502,
      err instanceof Error ? err.message : String(err)
    )
  }
}
