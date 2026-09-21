import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { errorResponse } from "@/lib/apiError";

const API_URL = process.env.SANCTUARY_API_URL;

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.backendToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const res = await fetch(`${API_URL}/api/panic/trigger`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.backendToken}`,
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();

    if (!res.ok) {
      return errorResponse(
        session,
        "POST /api/panic/trigger",
        "Failed to trigger panic alert",
        res.status,
        text || `Backend returned ${res.status}`
      );
    }

    return NextResponse.json({ message: text }, { status: res.status });
  } catch (err) {
    return errorResponse(
      session,
      "POST /api/panic/trigger",
      "Unable to reach panic service",
      502,
      err instanceof Error ? err.message : String(err)
    );
  }
}