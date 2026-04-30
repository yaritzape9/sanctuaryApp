"use client"

import Link from "next/link"
import { signIn } from "next-auth/react"

const inputClass = `
  w-full border border-sanctuary-border bg-sanctuary-surface rounded
  px-4 py-3 text-sm text-white placeholder-neutral-600
  focus:outline-none focus:border-white/30 transition-colors
`

const labelClass = "section-label block mb-2"

export default function LoginPage() {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // TODO: connect to Spring Boot auth API
  }

  return (
    <main className="mobile-screen px-8 md:px-16 lg:px-24 py-16">
      <div className="grid lg:grid-cols-2 gap-16 items-start">

        {/* Left — branding */}
        <div className="lg:sticky lg:top-24">
          <p className="section-label mb-4">Sanctuary</p>
          <h1 className="font-heading text-5xl md:text-6xl font-semibold leading-none tracking-tight text-white mb-6">
            Welcome back.
          </h1>
          <div className="divider mb-8" />
          <p className="text-neutral-400 leading-relaxed mb-8">
            Log in to access your panic button, view ICE sightings near you,
            and stay connected to your community.
          </p>
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <span className="text-sanctuary-accent mt-0.5">→</span>
              <p className="text-sm text-neutral-400">Real-time sighting alerts near you</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-sanctuary-accent mt-0.5">→</span>
              <p className="text-sm text-neutral-400">One-tap panic button with SMS to contacts</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-sanctuary-accent mt-0.5">→</span>
              <p className="text-sm text-neutral-400">Know your rights in 4 languages</p>
            </div>
          </div>
        </div>

        {/* Right — form */}
        <div>
          {/* Google */}
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-3 border border-sanctuary-border bg-sanctuary-surface rounded px-4 py-3 text-sm text-neutral-300 hover:border-white/20 hover:text-white transition-colors mb-6"
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-xs font-mono text-neutral-600">or</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                required
                className={inputClass}
              />
              <div className="mt-1.5 text-right">
                <Link
                  href="/forgot-password"
                  className="text-xs text-neutral-600 hover:text-white transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full justify-center"
            >
              Log in
            </button>

            <p className="text-center text-sm text-neutral-600">
              Don't have an account?{" "}
              <Link href="/signup" className="text-white font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </form>
        </div>

      </div>
    </main>
  )
}