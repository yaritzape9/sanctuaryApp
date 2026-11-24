import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import type { Session } from "next-auth";
import { mockSession } from "../../../utils/mockAuth";
import type { NextRequest } from "next/server";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
import { auth } from "@/lib/auth";
import { POST } from "@/app/api/panic/trigger/route";

const mockAuth = auth as unknown as Mock<() => Promise<Session | null>>;
const mockFetch = vi.fn();
global.fetch = mockFetch as unknown as typeof fetch;

const backend = (status: number, body: unknown) => ({
  ok: status >= 200 && status < 300,
  status,
  text: async () => JSON.stringify(body),
});

function triggerRequest(body: unknown = { lat: 1, lng: 2 }, headers: Record<string, string> = {}) {
  return new Request("http://localhost", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("POST /api/panic/trigger", () => {
  it("returns 401 when there is no backendToken", async () => {
    mockAuth.mockResolvedValue({ ...mockSession(), backendToken: undefined });
    const res = await POST(triggerRequest());
    expect(res.status).toBe(401);
  });

  it("forwards lat and lng to the backend and returns its outcome", async () => {
    mockAuth.mockResolvedValue(mockSession());
    mockFetch.mockResolvedValueOnce(backend(200, { status: "sent", sent: 2, failed: 0 }));

    const res = await POST(triggerRequest({ lat: 10, lng: 20 }));
    const body = await res.json();

    const [, init] = mockFetch.mock.calls[0];
    expect(JSON.parse(init.body as string)).toEqual({ lat: 10, lng: 20 });
    expect(res.status).toBe(200);
    expect(body).toEqual({ status: "sent", sent: 2, failed: 0 });
  });

  it.each([
    [200, { status: "partial", sent: 2, failed: 1 }],
    [422, { status: "no_contacts", sent: 0, failed: 0 }],
    [502, { status: "failed", sent: 0, failed: 3 }],
  ])("passes a %i outcome through with the same status", async (status, outcome) => {
    mockAuth.mockResolvedValue(mockSession({ role: "USER" }));
    mockFetch.mockResolvedValueOnce(backend(status, outcome));

    const res = await POST(triggerRequest());

    expect(res.status).toBe(status);
    expect(await res.json()).toEqual(outcome);
  });

  it("keeps only status, sent and failed from the backend's body", async () => {
    mockAuth.mockResolvedValue(mockSession());
    mockFetch.mockResolvedValueOnce(
      backend(200, { status: "sent", sent: 1, failed: 0, phone: "+12125550100", userId: "u1" })
    );

    const body = await (await POST(triggerRequest())).json();

    expect(body).toEqual({ status: "sent", sent: 1, failed: 0 });
  });

  it("returns an empty 200, never an error, when a 200 body can't be read", async () => {
    mockAuth.mockResolvedValue(mockSession());
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, text: async () => "Alert sent" });

    const res = await POST(triggerRequest());

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({});
  });

  it("drops userId, email and any other field the client sends", async () => {
    mockAuth.mockResolvedValue(mockSession());
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, text: async () => "Alert sent" });

    await POST(triggerRequest({ lat: 10, lng: 20, userId: "someone-else", email: "a@x.com", role: "ADMIN" }));

    const [, init] = mockFetch.mock.calls[0];
    expect(JSON.parse(init.body as string)).toEqual({ lat: 10, lng: 20 });
  });

  it("leaves out coordinates that aren't finite numbers", async () => {
    mockAuth.mockResolvedValue(mockSession());
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, text: async () => "Alert sent" });

    await POST(triggerRequest({ lat: "40.7", lng: null }));

    const [, init] = mockFetch.mock.calls[0];
    expect(JSON.parse(init.body as string)).toEqual({});
  });

  it("surfaces a non-DEV-safe error when the backend responds with a non-2xx status", async () => {
    mockAuth.mockResolvedValue(mockSession({ role: "USER" }));
    mockFetch.mockResolvedValueOnce({ ok: false, status: 400, text: async () => "missing contacts" });

    const res = await POST(triggerRequest());
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual({ error: "Failed to trigger panic alert" });
  });

  it("includes the backend's raw text as detail for DEV role sessions", async () => {
    mockAuth.mockResolvedValue(mockSession({ role: "DEV" }));
    mockFetch.mockResolvedValueOnce({ ok: false, status: 400, text: async () => "missing contacts" });

    const res = await POST(triggerRequest());
    const body = await res.json();

    expect(body.detail.message).toBe("missing contacts");
  });

  it("returns a 502 with no detail for non-DEV users when the fetch itself throws", async () => {
    mockAuth.mockResolvedValue(mockSession({ role: "USER" }));
    mockFetch.mockRejectedValueOnce(new Error("ECONNREFUSED"));

    const res = await POST(triggerRequest());
    const body = await res.json();

    expect(res.status).toBe(502);
    expect(body).toEqual({ error: "Unable to reach panic service" });
  });

  it("forwards a valid Idempotency-Key and drops a malformed one", async () => {
    mockAuth.mockResolvedValue(mockSession());
    mockFetch.mockResolvedValue(backend(200, { status: "sent", sent: 1, failed: 0 }));

    await POST(triggerRequest(undefined, { "Idempotency-Key": "3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90" }));
    await POST(triggerRequest(undefined, { "Idempotency-Key": "x".repeat(5000) }));

    expect(mockFetch.mock.calls[0][1].headers["Idempotency-Key"]).toBe("3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90");
    expect(mockFetch.mock.calls[1][1].headers).not.toHaveProperty("Idempotency-Key");
  });
});
