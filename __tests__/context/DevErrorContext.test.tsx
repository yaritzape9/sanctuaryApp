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
    it("drops reportError while the session is still loading", () => {
      mockUseSession.mockReturnValue(loadingSession);
      const { result } = renderHook(() => useDevError(), { wrapper });

      act(() => result.current.reportError("/api/sightings", "boom"));

      expect(result.current.error).toBeNull();
    });

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