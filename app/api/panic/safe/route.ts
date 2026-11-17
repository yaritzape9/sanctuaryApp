import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { errorResponse } from "@/lib/apiError";
import { parsePanicText } from "@/lib/panicResult";

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

    // 200, 422 and 502 carry the outcome as {status, sent, failed}. Rebuild it from
    // those 3 fields so nothing else from the backend reaches the browser.
    const result = parsePanicText(text);
    if (result) {
      return NextResponse.json(result, { status: res.status });
    }

    if (!res.ok) {
      return errorResponse(
        session,
        "POST /api/panic/safe",
        "Failed to clear panic alert",
        res.status,
        text || `Backend returned ${res.status}`
      );
    }

    // A 200 we can't read still means texts went out. Never turn it into an
    // error, or fetchWithRetry would retry and text the contacts twice.
    return NextResponse.json({}, { status: 200 });
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