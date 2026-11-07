// Shared by the server (lib/auth.config.ts) and the login and signup pages.
// next-auth puts this code in a URL, so it must never describe the user.
export const BACKEND_UNAVAILABLE_CODE = "backend_unavailable"

export const BACKEND_UNAVAILABLE_MESSAGE =
  "We can't reach the service right now. Please try again in a moment."
