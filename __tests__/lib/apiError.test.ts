// lib/apiError.test.ts
// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import type { Session } from "next-auth"
import { errorResponse } from "./apiError"

describe("errorResponse", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  const devSession = { user: { role: "DEV" } } as unknown as Session
  const userSession = { user: { role: "USER" } } as unknown as Session

  it("returns generic body with no detail for non-DEV session", async () => {
    const res = errorResponse(userSession, "/api/sightings", "Something went wrong", 500, "DB connection refused")
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body).toEqual({ error: "Something went wrong" })
    expect(body.detail).toBeUndefined()
  })

  it("includes full detail for DEV session", async () => {
    const res = errorResponse(devSession, "/api/sightings", "Something went wrong", 500, "DB connection refused")
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.error).toBe("Something went wrong")
    expect(body.detail).toEqual({
      endpoint: "/api/sightings",
      message: "DB connection refused",
      status: 500,
    })
  })

  it("excludes detail when session is null", async () => {
    const res = errorResponse(null, "/api/contacts", "Failed to load contacts", 502, "ECONNREFUSED")
    const body = await res.json()

    expect(body).toEqual({ error: "Failed to load contacts" })
  })

  it("excludes detail when session.user is missing", async () => {
    const res = errorResponse({} as Session, "/api/contacts", "Failed to load contacts", 502, "ECONNREFUSED")
    const body = await res.json()

    expect(body).toEqual({ error: "Failed to load contacts" })
  })

  it("excludes detail when role is present but not DEV", async () => {
    const res = errorResponse(
      { user: { role: "ADMIN" } } as unknown as Session,
      "/api/panic/trigger",
      "Unable to trigger alert",
      500,
      "Twilio timeout"
    )
    const body = await res.json()

    expect(body.detail).toBeUndefined()
  })

  it("always logs the full raw error server-side regardless of role", () => {
    errorResponse(userSession, "/api/sightings", "Something went wrong", 500, "DB connection refused")

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
    expect(consoleErrorSpy).toHaveBeenCalledWith("/api/sightings error:", "DB connection refused")
  })

  it("logs even when DEV session includes detail in response", () => {
    errorResponse(devSession, "/api/contacts", "Failed", 400, "Validation failed: email required")

    expect(consoleErrorSpy).toHaveBeenCalledWith("/api/contacts error:", "Validation failed: email required")
  })

  it("sets the response status to the provided status code", async () => {
    const res400 = errorResponse(userSession, "/api/panic/safe", "Bad request", 400, "missing field")
    const res404 = errorResponse(userSession, "/api/panic/safe", "Not found", 404, "no such id")

    expect(res400.status).toBe(400)
    expect(res404.status).toBe(404)
  })

  it("does not leak rawMessage into the body for non-DEV, even if it matches userMessage text", async () => {
    // guards against accidental pass-through if someone refactors the helper
    const res = errorResponse(userSession, "/api/sightings", "DB connection refused", 500, "DB connection refused")
    const body = await res.json()

    expect(Object.keys(body)).toEqual(["error"])
  })
})