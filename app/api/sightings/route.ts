import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const API_URL = process.env.SANCTUARY_API_URL;

export async function GET() {
  try {
    const res = await fetch(`${API_URL}/api/sightings`, {
      method: "GET",
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch sightings" },
        { status: res.status }
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("GET /api/sightings error:", err);
    return NextResponse.json(
      { error: "Unable to reach sightings service" },
      { status: 502 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.backendToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const res = await fetch(`${API_URL}/api/sightings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.backendToken}`,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return NextResponse.json(
        { error: data?.message ?? "Failed to create sighting" },
        { status: res.status }
      );
    }
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("POST /api/sightings error:", err);
    return NextResponse.json(
      { error: "Unable to reach sightings service" },
      { status: 502 }
    );
  }
}