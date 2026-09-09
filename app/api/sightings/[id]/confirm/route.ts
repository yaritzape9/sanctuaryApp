import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { errorResponse } from "@/lib/apiError"

const API_URL = process.env.SANCTUARY_API_URL

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()

  if (!session?.backendToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const res = await fetch(`${API_URL}/api/sightings/${id}/confirm`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.backendToken}`,
      },
    })
    const data = await res.json().catch(() => null)
    if (!res.ok) {
      return errorResponse(
        session,
        `POST /api/sightings/${id}/confirm`,
        data?.message ?? "Failed to confirm sighting",
        res.status,
        data?.message ?? `Backend returned ${res.status}`
      )
    }
    return NextResponse.json(data)
  } catch (err) {
    return errorResponse(
      session,
      `POST /api/sightings/${id}/confirm`,
      "Unable to reach sightings service",
      502,
      err instanceof Error ? err.message : String(err)
    )
  }
}