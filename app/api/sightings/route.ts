import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { errorResponse } from "@/lib/apiError"

const API_URL = process.env.SANCTUARY_API_URL

export async function GET() {
  const session = await auth()

  try {
    const res = await fetch(`${API_URL}/api/sightings`, {
      method: "GET",
      cache: "no-store",
    })
    if (!res.ok) {
      return errorResponse(
        session,
        "GET /api/sightings",
        "Failed to fetch sightings",
        res.status,
        `Backend returned ${res.status}`
      )
    }
    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    return errorResponse(
      session,
      "GET /api/sightings",
      "Unable to reach sightings service",
      502,
      err instanceof Error ? err.message : String(err)
    )
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()

  if (!session?.backendToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const res = await fetch(`${API_URL}/api/sightings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.backendToken}`,
      },
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => null)
    if (!res.ok) {
      return errorResponse(
        session,
        "POST /api/sightings",
        data?.message ?? "Failed to create sighting",
        res.status,
        data?.message ?? `Backend returned ${res.status}`
      )
    }
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return errorResponse(
      session,
      "POST /api/sightings",
      "Unable to reach sightings service",
      502,
      err instanceof Error ? err.message : String(err)
    )
  }
}