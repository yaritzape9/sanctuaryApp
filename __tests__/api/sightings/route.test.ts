import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import type { Session } from "next-auth";
import { mockSession } from "../../utils/mockAuth";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
import { auth } from "@/lib/auth";
import { GET, POST } from "@/app/api/sightings/route";

const mockAuth = auth as unknown as Mock<() => Promise<Session | null>>;const mockFetch = vi.fn();
global.fetch = mockFetch as unknown as typeof fetch;

function postRequest(body: unknown = { latitude: 1, longitude: 2 }) {
  return new Request("http://localhost", { method: "POST", body: JSON.stringify(body) }) as any;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("GET /api/sightings", () => {
  it("does not require authentication", async () => {
    mockAuth.mockResolvedValue(null);
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => [{ id: "s1" }] });

    const res = await GET();
    expect(await res.json()).toEqual([{ id: "s1" }]);
  });

  it("returns a generic proxy error with no detail for anonymous callers on a bad backend status", async () => {
    mockAuth.mockResolvedValue(null);
    mockFetch.mockResolvedValueOnce({ ok: false, status: 503 });

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(503);
    expect(body).toEqual({ error: "Failed to fetch sightings" });
  });

  it("includes detail for DEV role sessions even on GET", async () => {
    mockAuth.mockResolvedValue(mockSession({ role: "DEV" }));
    mockFetch.mockResolvedValueOnce({ ok: false, status: 503 });

    const res = await GET();
    const body = await res.json();

    expect(body.detail.status).toBe(503);
  });

  it("returns a 502 with no detail when the fetch itself throws", async () => {
    mockAuth.mockResolvedValue(null);
    mockFetch.mockRejectedValueOnce(new Error("DNS failure"));

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(502);
    expect(body).toEqual({ error: "Unable to reach sightings service" });
  });
});

describe("POST /api/sightings", () => {
  it("returns 401 when there is no backendToken", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as any);
    const res = await POST(postRequest());
    expect(res.status).toBe(401);
  });

  it("returns the created sighting on success", async () => {
    mockAuth.mockResolvedValue(mockSession());
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ id: "s1", status: "pending" }) });

    const res = await POST(postRequest({ latitude: 5, longitude: 6 }));
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body).toEqual({ id: "s1", status: "pending" });
  });

  it("uses the backend's message for both the response and the log when present", async () => {
    mockAuth.mockResolvedValue(mockSession({ role: "USER" }));
    mockFetch.mockResolvedValueOnce({ ok: false, status: 422, json: async () => ({ message: "Duplicate sighting" }) });

    const res = await POST(postRequest());
    const body = await res.json();

    expect(res.status).toBe(422);
    expect(body).toEqual({ error: "Duplicate sighting" });
  });

  it("falls back to a generic message when the backend body has no message", async () => {
    mockAuth.mockResolvedValue(mockSession({ role: "USER" }));
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500, json: async () => null });

    const res = await POST(postRequest());
    const body = await res.json();

    expect(body).toEqual({ error: "Failed to create sighting" });
  });

  it("includes detail for DEV role sessions", async () => {
    mockAuth.mockResolvedValue(mockSession({ role: "DEV" }));
    mockFetch.mockResolvedValueOnce({ ok: false, status: 422, json: async () => ({ message: "Duplicate sighting" }) });

    const res = await POST(postRequest());
    const body = await res.json();

    expect(body.detail.message).toBe("Duplicate sighting");
  });

  it("returns a 502 with no detail when the fetch itself throws", async () => {
    mockAuth.mockResolvedValue(mockSession({ role: "USER" }));
    mockFetch.mockRejectedValueOnce(new Error("timeout"));

    const res = await POST(postRequest());
    const body = await res.json();

    expect(res.status).toBe(502);
    expect(body).toEqual({ error: "Unable to reach sightings service" });
  });
});