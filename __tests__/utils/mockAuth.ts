import type { Session } from "next-auth";

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