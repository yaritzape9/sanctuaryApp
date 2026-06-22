import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${BACKEND_URL}/api/panic/trigger`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    return NextResponse.json({ message: text }, { status: res.status });
  } catch (err) {
    console.error("[panic/trigger]", err);
    return NextResponse.json({ message: "Failed to reach backend" }, { status: 502 });
  }
}
