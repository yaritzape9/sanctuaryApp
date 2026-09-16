import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import type { Session } from "next-auth";
import { mockSession } from "../../../../utils/mockAuth";
import type { NextRequest } from "next/server";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
import { auth } from "@/lib/auth";
import { POST } from "@/app/api/sightings/[id]/confirm/route";

const mockAuth = auth as unknown as Mock<() => Promise<Session | null>>;
const mockFetch = vi.fn();
global.fetch = mockFetch as unknown as typeof fetch;

const params = Promise.resolve({ id: "sighting-1" });

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("POST /api/sightings/[id]/confirm", () => {
  it("returns 401 when there is no backendToken", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as any);
    const res = await POST(new Request("http://localhost") as unknown as NextRequest, { params });    expect(res.status).toBe(401);
  });

  it("confirms the sighting and returns the updated record", async () => {
    mockAuth.mockResolvedValue(mockSession());
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ id: "sighting-1", confirmations: 2 }) });

    const res = await POST(new Request("http://localhost") as unknown as NextRequest, { params });    const body = await res.json();

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/sightings/sighting-1/confirm"),
      expect.objectContaining({
        method: "POST",
        headers: { Authorization: "Bearer backend-jwt-token" },
      })
    );
    expect(body).toEqual({ id: "sighting-1", confirmations: 2 });
  });

  it("uses the backend's message when present on a non-2xx response", async () => {
    mockAuth.mockResolvedValue(mockSession({ role: "USER" }));
    mockFetch.mockResolvedValueOnce({ ok: false, status: 409, json: async () => ({ message: "Already confirmed by this user" }) });

    const res = await POST(new Request("http://localhost") as unknown as NextRequest, { params });    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body).toEqual({ error: "Already confirmed by this user" });
  });

  it("falls back to a generic message when the backend body has no message", async () => {
    mockAuth.mockResolvedValue(mockSession({ role: "USER" }));
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500, json: async () => null });

    const res = await POST(new Request("http://localhost") as unknown as NextRequest, { params });    const body = await res.json();

    expect(body).toEqual({ error: "Failed to confirm sighting" });
  });

  it("includes detail for DEV role sessions", async () => {
    mockAuth.mockResolvedValue(mockSession({ role: "DEV" }));
    mockFetch.mockResolvedValueOnce({ ok: false, status: 409, json: async () => ({ message: "Already confirmed" }) });

    const res = await POST(new Request("http://localhost") as unknown as NextRequest, { params });
    const body = await res.json();

    expect(body.detail.message).toBe("Already confirmed");
  });

  it("returns a 502 with no detail when the fetch itself throws", async () => {
    mockAuth.mockResolvedValue(mockSession({ role: "USER" }));
    mockFetch.mockRejectedValueOnce(new Error("timeout"));

    const res = await POST(new Request("http://localhost") as unknown as NextRequest, { params });
    const body = await res.json();

    expect(res.status).toBe(502);
    expect(body).toEqual({ error: "Unable to reach sightings service" });
  });
});