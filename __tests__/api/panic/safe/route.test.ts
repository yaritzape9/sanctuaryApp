import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import type { Session } from "next-auth";
import { mockSession } from "../../../utils/mockAuth";
import type { NextRequest } from "next/server";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
import { auth } from "@/lib/auth";
import { POST } from "@/app/api/panic/safe/route";

const mockAuth = auth as unknown as Mock<() => Promise<Session | null>>;
const mockFetch = vi.fn();
global.fetch = mockFetch as unknown as typeof fetch;

const backend = (status: number, body: unknown) => ({
  ok: status >= 200 && status < 300,
  status,
  text: async () => JSON.stringify(body),
});

function safeRequest(headers: Record<string, string> = {}) {
  return new Request("http://localhost", { method: "POST", headers }) as unknown as NextRequest;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("POST /api/panic/safe", () => {
  it("returns 401 when there is no backendToken", async () => {
    mockAuth.mockResolvedValue({ ...mockSession(), backendToken: undefined });
    const res = await POST(safeRequest());
    expect(res.status).toBe(401);
  });

  it("sends the all-clear and returns the backend's outcome", async () => {
    mockAuth.mockResolvedValue(mockSession());
    mockFetch.mockResolvedValueOnce(backend(200, { status: "sent", sent: 2, failed: 0 }));

    const res = await POST(safeRequest());
    const body = await res.json();

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/panic/safe"),
      expect.objectContaining({
        method: "POST",
        headers: { Authorization: "Bearer backend-jwt-token" },
      })
    );
    expect(res.status).toBe(200);
    expect(body).toEqual({ status: "sent", sent: 2, failed: 0 });
  });

  it.each([
    [200, { status: "partial", sent: 1, failed: 1 }],
    [422, { status: "no_contacts", sent: 0, failed: 0 }],
    [502, { status: "failed", sent: 0, failed: 2 }],
  ])("passes a %i outcome through with the same status", async (status, outcome) => {
    mockAuth.mockResolvedValue(mockSession({ role: "USER" }));
    mockFetch.mockResolvedValueOnce(backend(status, { ...outcome, phone: "+12125550100" }));

    const res = await POST(safeRequest());

    expect(res.status).toBe(status);
    expect(await res.json()).toEqual(outcome);
  });

  it("returns an empty 200, never an error, when a 200 body can't be read", async () => {
    mockAuth.mockResolvedValue(mockSession());
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, text: async () => "Panic cleared" });

    const res = await POST(safeRequest());

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({});
  });

  it("surfaces a non-DEV-safe error when the backend responds with a non-2xx status", async () => {
    mockAuth.mockResolvedValue(mockSession({ role: "USER" }));
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500, text: async () => "" });

    const res = await POST(safeRequest());
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body).toEqual({ error: "Failed to clear panic alert" });
  });

  it("includes the backend's raw text as detail for DEV role sessions", async () => {
    mockAuth.mockResolvedValue(mockSession({ role: "DEV" }));
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500, text: async () => "db locked" });

    const res = await POST(safeRequest());
    const body = await res.json();

    expect(body.detail.message).toBe("db locked");
  });

  it("returns a 502 with no detail for non-DEV users when the fetch itself throws", async () => {
    mockAuth.mockResolvedValue(mockSession({ role: "USER" }));
    mockFetch.mockRejectedValueOnce(new Error("ECONNREFUSED"));

    const res = await POST(safeRequest());
    const body = await res.json();

    expect(res.status).toBe(502);
    expect(body).toEqual({ error: "Unable to reach panic service" });
  });

  it("forwards a valid Idempotency-Key and drops a malformed one", async () => {
    mockAuth.mockResolvedValue(mockSession());
    mockFetch.mockResolvedValue(backend(200, { status: "sent", sent: 1, failed: 0 }));

    await POST(safeRequest({ "Idempotency-Key": "3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90" }));
    await POST(safeRequest({ "Idempotency-Key": "not-a-uuid" }));

    expect(mockFetch.mock.calls[0][1].headers["Idempotency-Key"]).toBe("3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90");
    expect(mockFetch.mock.calls[1][1].headers).not.toHaveProperty("Idempotency-Key");
  });
});
