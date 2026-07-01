import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.SANCTUARY_API_URL;
const DEV_JWT = process.env.SANCTUARY_DEV_JWT;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const res = await fetch(`${API_URL}/api/sightings/${id}/confirm`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DEV_JWT}`,
      },
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.message ?? "Failed to confirm sighting" },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (err) {

    return NextResponse.json(
      { error: "Unable to reach sightings service" },
      { status: 502 }
    );
  }
}