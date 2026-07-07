# Sanctuary App — Frontend

Community safety web app for immigrant communities: ICE sighting map, panic
button, multilingual Know Your Rights guide, user profiles.

Repo: github.com/yaritzape9/sanctuaryApp
Backend sibling repo: ../sanctuary-backend

## Stack
Next.js 15 App Router, TypeScript, Tailwind CSS v4, NextAuth.js v5

## Built pages
/, /know-your-rights, /login, /signup, /map, /panic, /profile, /not-found

## Key components
Navbar, Footer (language switcher), BackToTop, Spinner, Skeleton,
Toast/useToast, PageTransition, PanicShortcut, ReportModal

## Conventions
- LanguageContext lives at components/LanguageContext.tsx (not context/)
- Lang type + languages array exported from lib/translations/knowYourRights.ts
- NextAuth v5 needs an explicit `callbacks` block to pipe token.sub into
  session.user.id
- Next.js 15 dynamic route `params` must be awaited as a Promise
- .env.local (gitignored): SANCTUARY_API_URL, plus dev stub
  SANCTUARY_DEV_JWT / SANCTUARY_DEV_USER_ID (being phased out via yp-auth* PRs)

## PR naming
yp-[featureName]

## Current status (update in the same commit as each PR)
- Completed: panic UI, contacts UI, sightings proxy routes, sightings UI
  (live map data, status pill only, no confirmation counts shown)
- In progress: yp-authCredentials (bridge NextAuth credentials login to
  backend JWT), then yp-authOAuth (Google sync), then yp-protectedRoutes
  (middleware; /map stays public with gated report/pin actions; /panic and
  /profile are nav-hidden + redirected for logged-out users)
- Backlog: unit tests + CI, Vercel deploy, /engineering page, footer language
  switcher wired to global state (blocked on backend translations API)
