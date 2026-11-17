import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { errorResponse } from "@/lib/apiError";
import { parsePanicText } from "@/lib/panicResult";

const API_URL = process.env.SANCTUARY_API_URL;

// JSON.stringify drops undefined, so a missing or non-numeric coordinate
// is simply left out and the alert goes without a location
function finiteOrUndefined(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.backendToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    // Forward only the location. The backend takes identity from the JWT,
    // so a client-sent userId (or anything else) never reaches it.
    const { lat, lng } = await req.json();
    const res = await fetch(`${API_URL}/api/panic/trigger`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.backendToken}`,
      },
      body: JSON.stringify({ lat: finiteOrUndefined(lat), lng: finiteOrUndefined(lng) }),
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
        "POST /api/panic/trigger",
        "Failed to trigger panic alert",
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
      "POST /api/panic/trigger",
      "Unable to reach panic service",
      502,
      err instanceof Error ? err.message : String(err)
    );
  }
}