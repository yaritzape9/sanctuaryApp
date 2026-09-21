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

function triggerRequest(body: unknown = { latitude: 1, longitude: 2 }) {
  return new Request("http://localhost", {
    method: "POST",
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("POST /api/panic/trigger", () => {
  it("returns 401 when there is no backendToken", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as any);
    const res = await POST(triggerRequest());
    expect(res.status).toBe(401);
  });

  it("forwards the request body to the backend and returns its message", async () => {
    mockAuth.mockResolvedValue(mockSession());
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, text: async () => "Alert sent" });

    const res = await POST(triggerRequest({ latitude: 10, longitude: 20 }));
    const body = await res.json();

    const [, init] = mockFetch.mock.calls[0];
    expect(JSON.parse(init.body as string)).toEqual({ latitude: 10, longitude: 20 });
    expect(body).toEqual({ message: "Alert sent" });
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
});