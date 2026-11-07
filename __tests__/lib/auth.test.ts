// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { authConfig, authorizeCredentials, BackendUnavailableError } from "@/lib/auth.config";
import { BACKEND_UNAVAILABLE_CODE } from "@/lib/authErrors";
import type { Account, Profile, User } from "next-auth";
import type { JWT } from "next-auth/jwt";

// The real next-auth entry point can't load under Vitest (it imports next/server)
vi.mock("next-auth", () => ({
  CredentialsSignin: class extends Error {
    code = "credentials";
  },
}));

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

describe("authorizeCredentials", () => {
  const credentials = { email: "user@example.com", password: "long-enough-password" };

  beforeEach(() => {
    mockFetch.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("returns the user and backend token on success", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ token: "backend-jwt", userId: "user-1" }),
    });

    await expect(authorizeCredentials(credentials)).resolves.toEqual({
      id: "user-1",
      email: "user@example.com",
      backendToken: "backend-jwt",
    });
  });

  it("returns null when the backend refuses the credentials", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401 });

    await expect(authorizeCredentials(credentials)).resolves.toBeNull();
  });

  it("reports the backend as unavailable on a 5xx, not as a wrong password", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 503 });

    const error = await authorizeCredentials(credentials).catch((e) => e);

    expect(error).toBeInstanceOf(BackendUnavailableError);
    expect(error.code).toBe(BACKEND_UNAVAILABLE_CODE);
  });

  it("reports the backend as unavailable when the request fails", async () => {
    mockFetch.mockRejectedValueOnce(new TypeError("connect ECONNREFUSED"));

    await expect(authorizeCredentials(credentials)).rejects.toBeInstanceOf(BackendUnavailableError);
  });

  it("returns null without calling the backend when a field is missing", async () => {
    await expect(authorizeCredentials({ email: "user@example.com" })).resolves.toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
