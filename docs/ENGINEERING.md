# Engineering Writeup — Sanctuary

## Problem

Sanctuary is a community safety app for immigrant communities in the US. It provides a real-time ICE sighting map, a panic button that SMS-alerts emergency contacts, and a multilingual Know Your Rights guide (13 languages). Because the user base is at-risk, security and privacy decisions run through the whole stack, not just the auth layer.

## Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS v4, NextAuth.js v5
- **Backend:** Java 17, Spring Boot, PostgreSQL, Twilio SMS
- **Realtime:** STOMP over SockJS for live map updates
- **Testing:** Vitest + React Testing Library (frontend), JUnit + Mockito (backend)
- **Deploy target:** Vercel (frontend) + Railway (backend)

## Architecture

### Auth: BFF pattern
NextAuth acts as a backend-for-frontend rather than owning auth directly. It calls Spring Boot's `/api/auth/login` or `/api/auth/oauth-sync`, and the resulting backend JWT is stored as `session.backendToken`. Role (`USER` / `DEV` / `ADMIN`) is carried as a string claim on `session.user.role`, decoded via a dependency-free, Edge-runtime-safe base64url decoder — standard `atob()` doesn't handle base64url, so `-`/`_` need remapping to `+`/`/` with padding restored before decoding.

Google OAuth accounts auto-link to existing local accounts by email, distinguished by an `AuthProvider` enum (`LOCAL` / `GOOGLE`) on the User entity.

### Security-first data exposure
- Vote-threshold constants (`CONFIRM_THRESHOLD`, `DISPUTE_THRESHOLD`) are backend-only and never serialized into API responses, so counts can't be gamed from the client.
- Error details are gated server-side, not just hidden in the UI — client-side-only hiding still leaks raw errors through the browser's Network tab. `errorResponse()` checks `session.user.role === "DEV"` server-side before including a `detail` field at all.
- Sightings use soft deletes (a `removed` flag) rather than hard deletes, preserving the confirmation list and audit trail. The `SightingResponse` DTO deliberately omits `removed` — WebSocket delete events are identified by topic name (`/topic/sightings/delete`), not by inspecting DTO content.

### Realtime updates
Live map updates run over STOMP/SockJS. A `StompAuthInterceptor` bug pattern worth documenting: the interceptor has to call `accessor.setLeaveMutable(true)` before rebuilding the message via `MessageBuilder.createMessage()` with mutated headers — returning the original message silently drops the authenticated principal.

## Notable bug fix: NextAuth `jwt` callback ordering

**Symptom:** After Google sign-in, `token.sub` (the correct backend UUID) was occasionally overwritten by `user.id` (an email string), causing a user-ID mismatch downstream.

**Root cause:** NextAuth passes `user` alongside `account`/`profile` on Google's *initial* sign-in. The callback had two independent `if` blocks — a Google branch, then a separate `if (user)` branch — instead of `if/else if`. Both ran on the same call, so the second silently clobbered what the first had just set correctly.

**Fix:** Changed to `if (...) { ... } else if (user) { ... }`. This also required splitting `lib/auth.ts` into `lib/auth.config.ts` (exports `authConfig`, no `NextAuth` import) plus a thin `lib/auth.ts` wrapper — `NextAuth()` pulls in `next/server` internally and can't be imported in a test environment, so tests import `authConfig` directly instead.

## Testing approach

- Small, scoped PRs, one concern each — tests generally ship in dedicated follow-up PRs, with an explicit exception for security-relevant changes (auth/panic-route tests ship inline with the fix).
- API route tests use a per-file `// @vitest-environment node` override to avoid clashing with the global `jsdom` environment.
- Backend tests split cleanly by dependency: pure-Mockito tests (`JwtUtilTest`, `AuthServiceTest`) run with no DB; `@SpringBootTest` full-context tests need the real Postgres container running.

---
*Repo: [github.com/yaritzape9/sanctuaryApp](https://github.com/yaritzape9/sanctuaryApp)*