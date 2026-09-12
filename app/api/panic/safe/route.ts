import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { errorResponse } from "@/lib/apiError";

const API_URL = process.env.SANCTUARY_API_URL;

export async function POST() {
  const session = await auth();

  if (!session?.backendToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const res = await fetch(`${API_URL}/api/panic/safe`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.backendToken}`,
      },
    });

    const text = await res.text();

    if (!res.ok) {
      return errorResponse(
        session,
        "POST /api/panic/safe",
        "Failed to clear panic alert",
        res.status,
        text || `Backend returned ${res.status}`
      );
    }

    return NextResponse.json({ message: text }, { status: res.status });
  } catch (err) {
    return errorResponse(
      session,
      "POST /api/panic/safe",
      "Unable to reach panic service",
      502,
      err instanceof Error ? err.message : String(err)
    );
  }
}