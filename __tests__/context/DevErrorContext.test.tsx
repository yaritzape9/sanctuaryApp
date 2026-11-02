import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, cleanup } from "@testing-library/react";
import type { ReactNode } from "react";
import { useSession } from "next-auth/react";
import { DevErrorProvider, useDevError } from "@/context/DevErrorContext";
import {
  sessionFor,
  unauthenticatedSession,
  loadingSession,
} from "../utils/mockAuth";

vi.mock("next-auth/react", () => ({ useSession: vi.fn() }));
const mockUseSession = vi.mocked(useSession);

function wrapper({ children }: { children: ReactNode }) {
  return <DevErrorProvider>{children}</DevErrorProvider>;
}

describe("DevErrorContext", () => {
  beforeEach(() => {
    mockUseSession.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  describe("non-DEV users never get an error stored", () => {
    it("ignores reportError for a USER", () => {
      mockUseSession.mockReturnValue(sessionFor("USER"));
      const { result } = renderHook(() => useDevError(), { wrapper });

      act(() => result.current.reportError("/api/sightings", "boom"));

      expect(result.current.error).toBeNull();
    });

    it("ignores reportError for an ADMIN (only DEV qualifies)", () => {
      mockUseSession.mockReturnValue(sessionFor("ADMIN"));
      const { result } = renderHook(() => useDevError(), { wrapper });

      act(() => result.current.reportError("/api/sightings", "boom"));

      expect(result.current.error).toBeNull();
    });

    it("ignores reportError when unauthenticated", () => {
      mockUseSession.mockReturnValue(unauthenticatedSession);
      const { result } = renderHook(() => useDevError(), { wrapper });

      act(() => result.current.reportError("/api/sightings", "boom"));

      expect(result.current.error).toBeNull();
    });

    // Documents CURRENT behavior. yp-devErrorSessionBuffer will change this
    // test to expect the error to be buffered and shown once the session resolves.
    it("clears a stored error when the user stops being a DEV", () => {
      mockUseSession.mockReturnValue(sessionFor("DEV"));
      const { result, rerender } = renderHook(() => useDevError(), { wrapper });

      act(() => result.current.reportError("/api/sightings", "boom"));
      expect(result.current.error).not.toBeNull();

      // Simulate logout
      mockUseSession.mockReturnValue(unauthenticatedSession);
      rerender();

      expect(result.current.error).toBeNull();
    });
  });

  describe("errors reported while the session is loading", () => {
    // Render while loading, report errors, then resolve the session
    function reportWhileLoading(...errors: [string, string][]) {
      mockUseSession.mockReturnValue(loadingSession);
      const hook = renderHook(() => useDevError(), { wrapper });
      for (const [endpoint, message] of errors) {
        act(() => hook.result.current.reportError(endpoint, message));
      }
      return hook;
    }

    it("keeps nothing in state while the role is unknown", () => {
      const { result } = reportWhileLoading(["/api/sightings", "boom"]);

      expect(result.current.error).toBeNull();
    });

    it("shows the first held error once the session loads as DEV", () => {
      const { result, rerender } = reportWhileLoading(
        ["/api/sightings", "first"],
        ["/api/contacts", "second"]
      );

      mockUseSession.mockReturnValue(sessionFor("DEV"));
      rerender();

      expect(result.current.error).toEqual({
        endpoint: "/api/sightings",
        message: "first",
      });
    });

    it("throws the held error away once the session loads as USER", () => {
      const { result, rerender } = reportWhileLoading(["/api/sightings", "boom"]);

      mockUseSession.mockReturnValue(sessionFor("USER"));
      rerender();

      expect(result.current.error).toBeNull();
    });

    it("throws the held error away once the session loads logged out", () => {
      const { result, rerender } = reportWhileLoading(["/api/sightings", "boom"]);

      mockUseSession.mockReturnValue(unauthenticatedSession);
      rerender();

      expect(result.current.error).toBeNull();
    });

    it("does not resurface a held error for a later DEV login", () => {
      const { result, rerender } = reportWhileLoading(["/api/sightings", "boom"]);

      mockUseSession.mockReturnValue(sessionFor("USER"));
      rerender();
      mockUseSession.mockReturnValue(sessionFor("DEV"));
      rerender();

      expect(result.current.error).toBeNull();
    });

    it("drops the held error if the same endpoint succeeds before the session loads", () => {
      const { result, rerender } = reportWhileLoading(["/api/sightings", "boom"]);

      act(() => result.current.clearError("/api/sightings"));
      mockUseSession.mockReturnValue(sessionFor("DEV"));
      rerender();

      expect(result.current.error).toBeNull();
    });

    it("works for a reportError captured during loading but called after", () => {
      // A fetch started on page load keeps the reportError from that render
      const { result, rerender } = reportWhileLoading();
      const reportFromLoadingRender = result.current.reportError;

      mockUseSession.mockReturnValue(sessionFor("DEV"));
      rerender();
      act(() => reportFromLoadingRender("/api/sightings", "late"));

      expect(result.current.error).toEqual({
        endpoint: "/api/sightings",
        message: "late",
      });
    });
  });

  describe("DEV users", () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue(sessionFor("DEV"));
    });

    it("stores the endpoint and message", () => {
      const { result } = renderHook(() => useDevError(), { wrapper });

      act(() => result.current.reportError("/api/sightings", "boom"));

      expect(result.current.error).toEqual({
        endpoint: "/api/sightings",
        message: "boom",
      });
    });

    it("keeps only the latest error", () => {
      const { result } = renderHook(() => useDevError(), { wrapper });

      act(() => result.current.reportError("/api/sightings", "first"));
      act(() => result.current.reportError("/api/contacts", "second"));

      expect(result.current.error).toEqual({
        endpoint: "/api/contacts",
        message: "second",
      });
    });

    it("clearError removes the error when the SAME endpoint succeeds", () => {
      const { result } = renderHook(() => useDevError(), { wrapper });

      act(() => result.current.reportError("/api/sightings", "boom"));
      act(() => result.current.clearError("/api/sightings"));

      expect(result.current.error).toBeNull();
    });

    it("clearError keeps the error when a DIFFERENT endpoint succeeds", () => {
      const { result } = renderHook(() => useDevError(), { wrapper });

      act(() => result.current.reportError("/api/sightings", "boom"));
      act(() => result.current.clearError("/api/contacts"));

      expect(result.current.error).toEqual({
        endpoint: "/api/sightings",
        message: "boom",
      });
    });

    it("dismissError clears the error regardless of endpoint", () => {
      const { result } = renderHook(() => useDevError(), { wrapper });

      act(() => result.current.reportError("/api/sightings", "boom"));
      act(() => result.current.dismissError());

      expect(result.current.error).toBeNull();
    });
  });
});