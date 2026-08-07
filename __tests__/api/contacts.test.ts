// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from "vitest"

const { mockAuth } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
}))

vi.mock("@/lib/auth", () => ({
  auth: mockAuth,
}))

import { GET, POST } from "@/app/api/contacts/route"
import { DELETE, PUT } from "@/app/api/contacts/[contactId]/route"

const SESSION = {
  user: { id: "user-123" },
  backendToken: "fake-jwt-token",
}

function mockFetchOnce(body: unknown, status = 200) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  })
}

describe("contacts proxy routes — Authorization header", () => {
  beforeEach(() => {
    mockAuth.mockReset()
    mockAuth.mockResolvedValue(SESSION)
  })

  it("GET /api/contacts forwards Bearer token", async () => {
    mockFetchOnce([])

    await GET()

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(`/api/contacts/${SESSION.user.id}`),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: `Bearer ${SESSION.backendToken}`,
        }),
      })
    )
  })

  it("GET /api/contacts returns 401 and skips fetch when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null)
    global.fetch = vi.fn()

    const res = await GET()

    expect(res.status).toBe(401)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it("POST /api/contacts forwards Bearer token", async () => {
    mockFetchOnce({ id: "contact-1" }, 201)
    const req = { json: async () => ({ name: "Ana", phone: "555-1234" }) } as unknown as Request

    await POST(req)

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/contacts"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: `Bearer ${SESSION.backendToken}`,
        }),
      })
    )
  })

  it("DELETE /api/contacts/[contactId] forwards Bearer token", async () => {
    mockFetchOnce(null, 204)
    const req = {} as Request
    const params = Promise.resolve({ contactId: "contact-1" })

    await DELETE(req, { params })

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/contacts/contact-1"),
      expect.objectContaining({
        method: "DELETE",
        headers: expect.objectContaining({
          Authorization: `Bearer ${SESSION.backendToken}`,
        }),
      })
    )
  })

  it("DELETE /api/contacts/[contactId] returns 401 and skips fetch when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null)
    global.fetch = vi.fn()
    const req = {} as Request
    const params = Promise.resolve({ contactId: "contact-1" })

    const res = await DELETE(req, { params })

    expect(res.status).toBe(401)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it("PUT /api/contacts/[contactId] forwards Bearer token", async () => {
    mockFetchOnce({ id: "contact-1", name: "Ana Updated" }, 200)
    const req = { json: async () => ({ name: "Ana Updated", phone: "555-1234" }) } as unknown as Request
    const params = Promise.resolve({ contactId: "contact-1" })

    await PUT(req, { params })

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/contacts/contact-1"),
      expect.objectContaining({
        method: "PUT",
        headers: expect.objectContaining({
          Authorization: `Bearer ${SESSION.backendToken}`,
        }),
      })
    )
  })

  it("PUT /api/contacts/[contactId] falls back to null body instead of throwing when backend returns a non-JSON/empty error", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => {
        throw new SyntaxError("Unexpected end of JSON input")
      },
    })
    const req = { json: async () => ({ name: "Ana Updated" }) } as unknown as Request
    const params = Promise.resolve({ contactId: "contact-1" })

    const res = await PUT(req, { params })
    const body = await res.json()

    expect(res.status).toBe(403)
    expect(body).toBeNull()
  })
})