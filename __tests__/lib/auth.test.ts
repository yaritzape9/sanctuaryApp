// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { authConfig } from "@/lib/auth.config";
import type { Account, Profile, User } from "next-auth";
import type { JWT } from "next-auth/jwt";

const mockFetch = vi.fn();
global.fetch = mockFetch as unknown as typeof fetch;

describe("authConfig.callbacks.jwt", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("sets token.sub to the backend userId on Google sign-in", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        token: "backend-jwt",
        userId: "backend-uuid-123",
      }),
    });

    const token = {} as JWT;
    const account = { provider: "google" } as Account;
    const profile = {
      email: "test@example.com",
      name: "Test User",
      sub: "google-sub-id",
    } as Profile;

    const result = await authConfig.callbacks.jwt({
      token,
      account,
      profile,
      user: undefined,
    });

    expect(result.sub).toBe("backend-uuid-123");
    expect(result.sub).not.toBe("test@example.com");
    expect(result.backendToken).toBe("backend-jwt");
  });

  it("sets token.sub to user.id on Credentials sign-in", async () => {
    const token = {} as JWT;
    const user = {
      id: "backend-uuid-456",
      email: "creds@example.com",
      backendToken: "creds-backend-jwt",
    } as User;

    const result = await authConfig.callbacks.jwt({
      token,
      user,
      account: null,
      profile: undefined,
    });

    expect(result.sub).toBe("backend-uuid-456");
    expect(result.backendToken).toBe("creds-backend-jwt");
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("regression: Google branch wins even when user is also present, token.sub is not clobbered", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        token: "backend-jwt",
        userId: "backend-uuid-789",
      }),
    });

    const token = {} as JWT;
    const account = { provider: "google" } as Account;
    const profile = {
      email: "test@example.com",
      name: "Test User",
      sub: "google-sub-id",
    } as Profile;
    // This is the exact shape that used to leak the email into token.sub —
    // NextAuth passes `user` alongside `account`/`profile` on Google's
    // initial sign-in call.
    const user = {
      id: "test@example.com",
      email: "test@example.com",
    } as User;

    const result = await authConfig.callbacks.jwt({
      token,
      account,
      profile,
      user,
    });

    expect(result.sub).toBe("backend-uuid-789");
    expect(result.sub).not.toBe("test@example.com");
  });
});