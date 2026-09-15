/**
 * Decodes the `role` claim out of a backend-issued JWT.
 *
 * Deliberately avoids a jwt-decode dependency and Node's Buffer —
 * this needs to run in both the Node runtime (API routes, lib/auth.ts)
 * and the Edge runtime (middleware.ts), and atob() is the one
 * base64-decoding primitive both environments share.
 *
 * JWTs use base64url (RFC 4648 §5), not standard base64, so '-'/'_'
 * are remapped to '+'/'/' and padding is restored before decoding.
 */
export function decodeRole(jwt: string): string | null {
  try {
    const payload = jwt.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );
    const decoded = JSON.parse(atob(padded));
    return typeof decoded.role === "string" ? decoded.role : null;
  } catch {
    return null;
  }
}