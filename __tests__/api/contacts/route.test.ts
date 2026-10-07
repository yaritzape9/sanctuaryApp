import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import type { Session } from "next-auth";
import { mockSession } from "../../utils/mockAuth";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
import { auth } from "@/lib/auth";
import { GET, POST } from "@/app/api/contacts/route";

const mockAuth = auth as unknown as Mock<() => Promise<Session | null>>;
const mockFetch = vi.fn();
global.fetch = mockFetch as unknown as typeof fetch;

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("GET /api/contacts", () => {
  it("returns 401 when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("proxies to the backend with only the token, never a userId in the URL", async () => {
    mockAuth.mockResolvedValue(mockSession());
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [{ id: "c1" }],
    });

    const res = await GET();
    const data = await res.json();

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/contacts$/),
      expect.objectContaining({
        headers: { Authorization: "Bearer backend-jwt-token" },
      })
    );
    expect(data).toEqual([{ id: "c1" }]);
  });

  it("returns a generic proxy error with no detail for non-DEV users", async () => {
    mockAuth.mockResolvedValue(mockSession({ role: "USER" }));
    mockFetch.mockRejectedValueOnce(new Error("ECONNREFUSED"));

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body).toEqual({ error: "Proxy error" });
  });

  it("includes error detail for DEV role sessions", async () => {
    mockAuth.mockResolvedValue(mockSession({ role: "DEV" }));
    mockFetch.mockRejectedValueOnce(new Error("ECONNREFUSED"));

    const res = await GET();
    const body = await res.json();

    expect(body.detail.message).toBe("ECONNREFUSED");
  });
});

describe("POST /api/contacts", () => {
  it("returns 401 when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const req = new Request("http://localhost/api/contacts", {
      method: "POST",
      body: JSON.stringify({ name: "Jane" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("never forwards a userId, even when the client sends one", async () => {
    mockAuth.mockResolvedValue(mockSession());
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ id: "c1" }),
    });

    const req = new Request("http://localhost/api/contacts", {
      method: "POST",
      body: JSON.stringify({ name: "Jane", userId: "victim-user" }),
    });
    await POST(req);

    const [, init] = mockFetch.mock.calls[0];
    expect(JSON.parse(init.body as string)).toEqual({ name: "Jane" });
  });

  it("returns a generic proxy error on fetch failure", async () => {
    mockAuth.mockResolvedValue(mockSession());
    mockFetch.mockRejectedValueOnce(new Error("timeout"));

    const req = new Request("http://localhost/api/contacts", {
      method: "POST",
      body: JSON.stringify({ name: "Jane" }),
    });
    const res = await POST(req);

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Proxy error" });
  });
});