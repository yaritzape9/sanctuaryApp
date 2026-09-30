import type { Session } from "next-auth";
import type { useSession } from "next-auth/react";

type SessionOverrides = {
  userId?: string;
  role?: string;
  backendToken?: string;
};

/**
 * Builds a fake NextAuth Session for route-handler tests.
 * Pass overrides to simulate a DEV-role user, a missing backendToken, etc.
 */
export function mockSession(overrides: SessionOverrides = {}): Session {
  const {
    userId = "user-1",
    role = "USER",
    backendToken = "backend-jwt-token",
  } = overrides;

  return {
    user: { id: userId, role },
    backendToken,
  } as unknown as Session;
}

// ---------------------------------------------------------------------------
// Client-side helpers: fake return values for next-auth/react's useSession()
// ---------------------------------------------------------------------------

export type TestRole = "USER" | "DEV" | "ADMIN";
type UseSessionResult = ReturnType<typeof useSession>;

const update = async () => null;

// A signed-in user with the given role. Built on mockSession() so the
// session shape lives in one place.
export function sessionFor(role: TestRole): UseSessionResult {
  return {
    data: { ...mockSession({ role }), expires: "2099-01-01T00:00:00.000Z" },
    status: "authenticated",
    update,
  } as unknown as UseSessionResult;
}

// Logged out.
export const unauthenticatedSession = {
  data: null,
  status: "unauthenticated",
  update,
} as unknown as UseSessionResult;

// Session still resolving (the window yp-devErrorSessionBuffer will fix).
export const loadingSession = {
  data: undefined,
  status: "loading",
  update,
} as unknown as UseSessionResult;