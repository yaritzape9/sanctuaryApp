// @vitest-environment node
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest"
import { POST } from "@/app/api/auth/register/route"

const mockFetch = vi.fn()

function request(body: string) {
  return new Request("http://localhost/api/auth/register", { method: "POST", body })
}

const valid = () =>
  request(JSON.stringify({ email: "new@example.com", password: "long-enough-password" }))

function backendReturns(status: number, body: unknown = {}) {
  mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(body), { status }))
}

describe("POST /api/auth/register proxy", () => {
  let consoleError: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    mockFetch.mockReset()
    vi.stubGlobal("fetch", mockFetch)
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    consoleError.mockRestore()
  })

  it("forwards only email and password, dropping every other field", async () => {
    backendReturns(200, { userId: "u1", token: "jwt" })

    await POST(
      request(
        JSON.stringify({
          email: "new@example.com",
          password: "long-enough-password",
          role: "ADMIN",
          phone: "+15555555555",
        })
      )
    )

    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toMatch(/\/api\/auth\/register$/)
    expect(JSON.parse(init.body)).toEqual({
      email: "new@example.com",
      password: "long-enough-password",
    })
  })

  it("never passes the backend's token or user ID to the browser", async () => {
    backendReturns(200, { userId: "secret-user-id", token: "secret-jwt" })

    const res = await POST(valid())

    expect(res.status).toBe(201)
    expect(await res.json()).toEqual({ success: true })
  })

  it("maps a duplicate email to a fixed 409 message", async () => {
    backendReturns(409, { error: "backend wording" })

    const res = await POST(valid())

    expect(res.status).toBe(409)
    expect(await res.json()).toEqual({ error: "An account with this email already exists." })
  })

  it("maps a backend 400 to a fixed message", async () => {
    backendReturns(400, { message: "Invalid fields: password" })

    const res = await POST(valid())
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toContain("12 to 72 characters")
    expect(JSON.stringify(body)).not.toContain("Invalid fields")
  })

  it("returns a generic 502 with no detail when the backend fails, and logs no credentials", async () => {
    backendReturns(500, { message: "internal text" })

    const res = await POST(valid())
    const body = await res.json()

    expect(res.status).toBe(502)
    expect(body).toEqual({ error: "Unable to create account" })
    const logged = JSON.stringify(consoleError.mock.calls)
    expect(logged).not.toContain("new@example.com")
    expect(logged).not.toContain("long-enough-password")
  })

  it("returns a generic 502 when the backend can't be reached", async () => {
    mockFetch.mockRejectedValueOnce(new TypeError("connect ECONNREFUSED"))

    const res = await POST(valid())

    expect(res.status).toBe(502)
    expect(await res.json()).toEqual({ error: "Unable to create account" })
  })

  it("rejects malformed JSON without calling the backend", async () => {
    const res = await POST(request("{not json"))

    expect(res.status).toBe(400)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it("rejects non-string fields without calling the backend", async () => {
    const res = await POST(request(JSON.stringify({ email: { $ne: "" }, password: 123 })))

    expect(res.status).toBe(400)
    expect(mockFetch).not.toHaveBeenCalled()
  })
})
