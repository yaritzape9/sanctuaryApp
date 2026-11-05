import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, cleanup } from "@testing-library/react";
import type { ReactNode } from "react";
import { useSession } from "next-auth/react";
import { DevErrorProvider, useDevError } from "@/context/DevErrorContext";
import { useDevFetch } from "@/app/hooks/useDevFetch";
import { sessionFor } from "../utils/mockAuth";

vi.mock("next-auth/react", () => ({ useSession: vi.fn() }));
vi.mock("@/lib/fetchWithRetry", () => ({ fetchWithRetry: vi.fn() }));
import { fetchWithRetry } from "@/lib/fetchWithRetry";

const mockUseSession = vi.mocked(useSession);
const mockFetchWithRetry = vi.mocked(fetchWithRetry);
const mockFetch = vi.fn();

function wrapper({ children }: { children: ReactNode }) {
  return <DevErrorProvider>{children}</DevErrorProvider>;
}

// The hook under test plus the banner state it writes to
function renderDevFetch() {
  return renderHook(() => ({ devFetch: useDevFetch(), ...useDevError() }), { wrapper });
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const withDetail = (status: number, message: string) =>
  json(status, { error: "Something went wrong", detail: { endpoint: "x", message, status } });

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", mockFetch);
  mockUseSession.mockReturnValue(sessionFor("DEV"));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("useDevFetch", () => {
  describe("DEV users", () => {
    it("reports the proxy's detail message with the method and path", async () => {
      mockFetch.mockResolvedValueOnce(withDetail(500, "Backend returned 500"));
      const { result } = renderDevFetch();

      await act(() => result.current.devFetch("/api/sightings"));

      expect(result.current.error).toEqual({
        endpoint: "GET /api/sightings",
        message: "500: Backend returned 500",
      });
    });

    it("falls back to the status when the body has no detail", async () => {
      mockFetch.mockResolvedValueOnce(json(502, { error: "Unavailable" }));
      const { result } = renderDevFetch();

      await act(() => result.current.devFetch("/api/contacts", { method: "POST" }));

      expect(result.current.error).toEqual({
        endpoint: "POST /api/contacts",
        message: "HTTP 502",
      });
    });

    it("falls back to the status when the body isn't JSON", async () => {
      mockFetch.mockResolvedValueOnce(new Response("<html>oops</html>", { status: 500 }));
      const { result } = renderDevFetch();

      await act(() => result.current.devFetch("/api/sightings"));

      expect(result.current.error?.message).toBe("HTTP 500");
    });

    it("clears the error when the same request later succeeds", async () => {
      mockFetch
        .mockResolvedValueOnce(withDetail(500, "boom"))
        .mockResolvedValueOnce(json(200, []));
      const { result } = renderDevFetch();

      await act(() => result.current.devFetch("/api/sightings"));
      await act(() => result.current.devFetch("/api/sightings"));

      expect(result.current.error).toBeNull();
    });

    it("keeps the error when a different request succeeds", async () => {
      mockFetch
        .mockResolvedValueOnce(withDetail(500, "boom"))
        .mockResolvedValueOnce(json(200, []));
      const { result } = renderDevFetch();

      await act(() => result.current.devFetch("/api/sightings"));
      await act(() => result.current.devFetch("/api/contacts"));

      expect(result.current.error?.endpoint).toBe("GET /api/sightings");
    });

    it("reports a network failure and still throws it to the caller", async () => {
      mockFetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));
      const { result } = renderDevFetch();

      await act(async () => {
        await expect(result.current.devFetch("/api/sightings")).rejects.toThrow("Failed to fetch");
      });

      expect(result.current.error).toEqual({
        endpoint: "GET /api/sightings",
        message: "Network error: Failed to fetch",
      });
    });

    it("leaves the body readable for the caller", async () => {
      mockFetch.mockResolvedValueOnce(withDetail(500, "boom"));
      const { result } = renderDevFetch();

      let body: unknown;
      await act(async () => {
        const res = await result.current.devFetch("/api/sightings");
        body = await res.json();
      });

      expect(body).toMatchObject({ error: "Something went wrong" });
    });

    it("uses fetchWithRetry when retry is set", async () => {
      mockFetchWithRetry.mockResolvedValueOnce(json(200, {}));
      const init = { method: "POST" };
      const { result } = renderDevFetch();

      await act(() => result.current.devFetch("/api/panic/safe", init, { retry: true }));

      expect(mockFetchWithRetry).toHaveBeenCalledWith("/api/panic/safe", init);
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("non-DEV users", () => {
    it("never stores an error, even if a body carries detail", async () => {
      mockUseSession.mockReturnValue(sessionFor("USER"));
      mockFetch.mockResolvedValueOnce(withDetail(500, "should not be seen"));
      const { result } = renderDevFetch();

      const res = await act(() => result.current.devFetch("/api/sightings"));

      expect(res.status).toBe(500);
      expect(result.current.error).toBeNull();
    });
  });
});
