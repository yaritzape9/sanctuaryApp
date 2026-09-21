import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import type { Session } from "next-auth";
import { mockSession } from "../../../utils/mockAuth";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
import { auth } from "@/lib/auth";
import { DELETE, PUT } from "@/app/api/contacts/[contactId]/route";

const mockAuth = auth as unknown as Mock<() => Promise<Session | null>>;
const mockFetch = vi.fn();
global.fetch = mockFetch as unknown as typeof fetch;

const params = Promise.resolve({ contactId: "contact-1" });

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("DELETE /api/contacts/[contactId]", () => {
  it("returns 401 when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await DELETE(new Request("http://localhost"), { params });
    expect(res.status).toBe(401);
  });

  it("returns 401 when session has no backendToken", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as any);
    const res = await DELETE(new Request("http://localhost"), { params });
    expect(res.status).toBe(401);
  });

  it("returns an empty 204 body on successful delete", async () => {
    mockAuth.mockResolvedValue(mockSession());
    mockFetch.mockResolvedValueOnce({ status: 204 });

    const res = await DELETE(new Request("http://localhost"), { params });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/contacts/contact-1?userId=user-1"),
      expect.objectContaining({
        method: "DELETE",
        headers: { Authorization: "Bearer backend-jwt-token" },
      })
    );
    expect(res.status).toBe(204);
  });

  it("passes through a non-204 backend status with no body", async () => {
    mockAuth.mockResolvedValue(mockSession());
    mockFetch.mockResolvedValueOnce({ status: 404 });

    const res = await DELETE(new Request("http://localhost"), { params });
    expect(res.status).toBe(404);
  });

  it("returns a generic proxy error with no detail for non-DEV users on fetch failure", async () => {
    mockAuth.mockResolvedValue(mockSession({ role: "USER" }));
    mockFetch.mockRejectedValueOnce(new Error("network down"));

    const res = await DELETE(new Request("http://localhost"), { params });
    const body = await res.json();

    expect(res.status).toBe(502);
    expect(body).toEqual({ error: "Failed to delete contact" });
  });

  it("includes error detail for DEV role sessions", async () => {
    mockAuth.mockResolvedValue(mockSession({ role: "DEV" }));
    mockFetch.mockRejectedValueOnce(new Error("network down"));

    const res = await DELETE(new Request("http://localhost"), { params });
    const body = await res.json();

    expect(body.detail.message).toBe("network down");
  });
});

describe("PUT /api/contacts/[contactId]", () => {
  function putRequest(body: unknown) {
    return new Request("http://localhost", {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  it("returns 401 when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await PUT(putRequest({ name: "Jane" }), { params });
    expect(res.status).toBe(401);
  });

  it("injects the session userId into the outgoing payload", async () => {
    mockAuth.mockResolvedValue(mockSession());
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ id: "contact-1", name: "Jane" }),
    });

    await PUT(putRequest({ name: "Jane" }), { params });

    const [, init] = mockFetch.mock.calls[0];
    expect(JSON.parse(init.body as string)).toEqual({ name: "Jane", userId: "user-1" });
  });

  it("falls back to null data when the backend returns a non-JSON body", async () => {
    mockAuth.mockResolvedValue(mockSession());
    mockFetch.mockResolvedValueOnce({
      status: 500,
      json: async () => {
        throw new Error("not json");
      },
    });

    const res = await PUT(putRequest({ name: "Jane" }), { params });
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data).toBeNull();
  });

  it("returns a generic proxy error with no detail for non-DEV users on fetch failure", async () => {
    mockAuth.mockResolvedValue(mockSession({ role: "USER" }));
    mockFetch.mockRejectedValueOnce(new Error("timeout"));

    const res = await PUT(putRequest({ name: "Jane" }), { params });
    const body = await res.json();

    expect(res.status).toBe(502);
    expect(body).toEqual({ error: "Failed to update contact" });
  });

  it("includes error detail for DEV role sessions", async () => {
    mockAuth.mockResolvedValue(mockSession({ role: "DEV" }));
    mockFetch.mockRejectedValueOnce(new Error("timeout"));

    const res = await PUT(putRequest({ name: "Jane" }), { params });
    const body = await res.json();

    expect(body.detail.message).toBe("timeout");
  });
});