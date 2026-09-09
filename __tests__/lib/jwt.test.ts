import { describe, it, expect } from "vitest";
import { decodeRole } from "@/lib/jwt";

function buildFakeJwt(payload: object): string {
  const header = { alg: "HS256", typ: "JWT" };
  const base64url = (obj: object) =>
    Buffer.from(JSON.stringify(obj))
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

  return `${base64url(header)}.${base64url(payload)}.fake-signature`;
}

describe("decodeRole", () => {
  it("extracts the role claim from a valid token", () => {
    const token = buildFakeJwt({ sub: "user-1", role: "DEV" });
    expect(decodeRole(token)).toBe("DEV");
  });

  it("returns null when the role claim is missing", () => {
    const token = buildFakeJwt({ sub: "user-1" });
    expect(decodeRole(token)).toBeNull();
  });

  it("returns null when the role claim is not a string", () => {
    const token = buildFakeJwt({ sub: "user-1", role: 123 });
    expect(decodeRole(token)).toBeNull();
  });

  it("returns null for a malformed token", () => {
    expect(decodeRole("not-a-real-jwt")).toBeNull();
  });

  it("returns null for an empty string", () => {
    expect(decodeRole("")).toBeNull();
  });
});
