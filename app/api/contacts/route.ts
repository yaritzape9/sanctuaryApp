import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8080"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const res = await fetch(`${BACKEND}/api/contacts/${session.user.id}`, {
    cache: "no-store",
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()

  const res = await fetch(`${BACKEND}/api/contacts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, userId: session.user.id }),
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
