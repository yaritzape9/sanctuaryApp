// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { errorResponse } from "@/lib/apiError";
import { mockSession } from "../utils/mockAuth";

describe("errorResponse", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("logs the raw message to the server console", () => {
    errorResponse(null, "GET /api/test", "Something went wrong", 500, "db timeout");
    expect(console.error).toHaveBeenCalledWith("GET /api/test error:", "db timeout");
  });

  it("omits detail for unauthenticated callers", async () => {
    const res = errorResponse(null, "GET /api/test", "Something went wrong", 500, "db timeout");
    const body = await res.json();
    expect(body).toEqual({ error: "Something went wrong" });
  });

  it("omits detail for non-DEV roles", async () => {
    const res = errorResponse(mockSession({ role: "USER" }), "GET /api/test", "Something went wrong", 500, "db timeout");
    const body = await res.json();
    expect(body.detail).toBeUndefined();
  });

  it("includes detail for DEV role sessions", async () => {
    const res = errorResponse(mockSession({ role: "DEV" }), "GET /api/test", "Something went wrong", 500, "db timeout");
    const body = await res.json();
    expect(body.detail).toEqual({ endpoint: "GET /api/test", message: "db timeout", status: 500 });
  });

  it("preserves the given status code", async () => {
    const res = errorResponse(null, "POST /api/test", "Bad request", 400, "validation failed");
    expect(res.status).toBe(400);
  });
});