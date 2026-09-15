import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { errorResponse } from "@/lib/apiError"

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080"

export async function POST(req: NextRequest) {
  const session = await auth()

  try {
    const body = await req.json()
    const res = await fetch(`${BACKEND_URL}/api/panic/safe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const text = await res.text()
    return NextResponse.json({ message: text }, { status: res.status })
  } catch (err) {
    return errorResponse(
      session,
      "POST /api/panic/safe",
      "Failed to reach backend",
      502,
      err instanceof Error ? err.message : String(err)
    )
  }
}