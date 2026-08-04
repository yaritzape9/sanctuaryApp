import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8080"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const res = await fetch(`${BACKEND}/api/contacts/${session.user.id}`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${session.backendToken}`,
      },
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error("GET /api/contacts failed:", err)
    return NextResponse.json({ error: "Proxy error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()

  try {
    const res = await fetch(`${BACKEND}/api/contacts`, {
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
    console.error("POST /api/contacts failed:", err)
    return NextResponse.json({ error: "Proxy error" }, { status: 500 })
  }
}