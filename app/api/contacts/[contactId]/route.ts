import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8080"

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ contactId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { contactId } = await params

  const res = await fetch(
    `${BACKEND}/api/contacts/${contactId}?userId=${session.user.id}`,
    { method: "DELETE" }
  )

  if (res.status === 204) return new NextResponse(null, { status: 204 })
  return new NextResponse(null, { status: res.status })
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ contactId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { contactId } = await params
  const body = await req.json()

  const res = await fetch(`${BACKEND}/api/contacts/${contactId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, userId: session.user.id }),
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
