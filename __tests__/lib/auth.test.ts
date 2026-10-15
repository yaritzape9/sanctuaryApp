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
    const account = { provider: "google", id_token: "google-id-token" } as Account;
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
    const account = { provider: "google", id_token: "google-id-token" } as Account;
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

  it("sends only Google's ID token to oauth-sync, never profile fields", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: "backend-jwt", userId: "backend-uuid-123" }),
    });

    await authConfig.callbacks.jwt({
      token: {} as JWT,
      account: { provider: "google", id_token: "google-id-token" } as Account,
      profile: { email: "test@example.com", name: "Test", sub: "google-sub-id" } as Profile,
      user: undefined,
    });

    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/auth/oauth-sync");
    expect(JSON.parse(init.body as string)).toEqual({ idToken: "google-id-token" });
  });

  it("skips oauth-sync and sets no backend token when Google returns no id_token", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await authConfig.callbacks.jwt({
      token: {} as JWT,
      account: { provider: "google" } as Account,
      profile: { email: "test@example.com", sub: "google-sub-id" } as Profile,
      user: undefined,
    });

    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.backendToken).toBeUndefined();
  });

  it("sets no backend token when the backend refuses the sign-in (409 existing account)", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockFetch.mockResolvedValueOnce({ ok: false, status: 409 });

    const result = await authConfig.callbacks.jwt({
      token: {} as JWT,
      account: { provider: "google", id_token: "google-id-token" } as Account,
      profile: undefined,
      user: undefined,
    });

    expect(result.backendToken).toBeUndefined();
    expect(result.sub).toBeUndefined();
  });
});
