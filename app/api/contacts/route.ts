import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { errorResponse } from "@/lib/apiError"

const API_URL = process.env.SANCTUARY_API_URL ?? "http://localhost:8080"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const res = await fetch(`${API_URL}/api/contacts/${session.user.id}`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${session.backendToken}`,
      },
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    return errorResponse(
      session,
      "GET /api/contacts",
      "Proxy error",
      500,
      err instanceof Error ? err.message : String(err)
    )
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()

  try {
    const res = await fetch(`${API_URL}/api/contacts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.backendToken}`,
      },
      body: JSON.stringify({ ...body, userId: session.user.id }),
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    return errorResponse(
      session,
      "POST /api/contacts",
      "Proxy error",
      500,
      err instanceof Error ? err.message : String(err)
    )
  }
}