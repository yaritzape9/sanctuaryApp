import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import type { Session } from "next-auth";
import { mockSession } from "../../../utils/mockAuth";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
import { auth } from "@/lib/auth";
import { POST } from "@/app/api/panic/safe/route";

const mockAuth = auth as unknown as Mock<() => Promise<Session | null>>;
const mockFetch = vi.fn();
global.fetch = mockFetch as unknown as typeof fetch;

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("POST /api/panic/safe", () => {
  it("returns 401 when there is no backendToken", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as any);
    const res = await POST();
    expect(res.status).toBe(401);
  });

  it("returns the backend's confirmation message on success", async () => {
    mockAuth.mockResolvedValue(mockSession());
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => "Panic cleared",
    });

    const res = await POST();
    const body = await res.json();

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/panic/safe"),
      expect.objectContaining({
        method: "POST",
        headers: { Authorization: "Bearer backend-jwt-token" },
      })
    );
    expect(body).toEqual({ message: "Panic cleared" });
  });

  it("surfaces a non-DEV-safe error when the backend responds with a non-2xx status", async () => {
    mockAuth.mockResolvedValue(mockSession({ role: "USER" }));
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500, text: async () => "" });

    const res = await POST();
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body).toEqual({ error: "Failed to clear panic alert" });
  });

  it("includes the backend's raw text as detail for DEV role sessions", async () => {
    mockAuth.mockResolvedValue(mockSession({ role: "DEV" }));
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500, text: async () => "db locked" });

    const res = await POST();
    const body = await res.json();

    expect(body.detail.message).toBe("db locked");
  });

  it("returns a 502 with no detail for non-DEV users when the fetch itself throws", async () => {
    mockAuth.mockResolvedValue(mockSession({ role: "USER" }));
    mockFetch.mockRejectedValueOnce(new Error("ECONNREFUSED"));

    const res = await POST();
    const body = await res.json();

    expect(res.status).toBe(502);
    expect(body).toEqual({ error: "Unable to reach panic service" });
  });
});