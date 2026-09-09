import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { errorResponse } from "@/lib/apiError"

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8080"

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ contactId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id || !session?.backendToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { contactId } = await params

  try {
    const res = await fetch(
      `${BACKEND}/api/contacts/${contactId}?userId=${session.user.id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.backendToken}` },
      }
    )

    if (res.status === 204) return new NextResponse(null, { status: 204 })
    return new NextResponse(null, { status: res.status })
  } catch (err) {
    return errorResponse(
      session,
      `DELETE /api/contacts/${contactId}`,
      "Failed to delete contact",
      502,
      err instanceof Error ? err.message : String(err)
    )
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ contactId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id || !session?.backendToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { contactId } = await params
  const body = await req.json()

  try {
    const res = await fetch(`${BACKEND}/api/contacts/${contactId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.backendToken}`,
      },
      body: JSON.stringify({ ...body, userId: session.user.id }),
    })

    let data = null
    try {
      data = await res.json()
    } catch {
      // backend returned a non-JSON or empty body (e.g. an error response)
    }

    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    return errorResponse(
      session,
      `PUT /api/contacts/${contactId}`,
      "Failed to update contact",
      502,
      err instanceof Error ? err.message : String(err)
    )
  }
}