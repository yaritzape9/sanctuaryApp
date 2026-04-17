"use client"

import Link from "next/link"
import { signIn } from "next-auth/react"

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "zh", label: "中文" },
  { value: "ar", label: "العربية" },
]

export default function SignupPage() {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // TODO: connect to Spring Boot auth API
  }

  return (
    <main className="max-w-md mx-auto px-8 py-16 min-h-screen">

      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-mono uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">
          Sanctuary
        </p>
        <h1 className="text-4xl font-bold tracking-tight leading-none mb-6">
          Create your account.
        </h1>
        <div className="w-12 h-px bg-gray-300 dark:bg-gray-700" />
      </div>

      {/* Google */}
      <button
        onClick={() => signIn("google", { callbackUrl: "/" })}
        className="w-full flex items-center justify-center gap-3 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-600 transition-colors mb-6"
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
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
        <span className="text-xs font-mono text-gray-400 dark:text-gray-600">or</span>
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-mono uppercase tracking-widest text-gray-400 dark:text-gray-500 block mb-2">
            Full name
          </label>
          <input
            type="text"
            placeholder="Your Name Here"
            required
            className="w-full border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-black placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-colors"
          />
        </div>

        <div>
          <label className="text-xs font-mono uppercase tracking-widest text-gray-400 dark:text-gray-500 block mb-2">
            Email
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            required
            className="w-full border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-black placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-colors"
          />
        </div>

        <div>
          <label className="text-xs font-mono uppercase tracking-widest text-gray-400 dark:text-gray-500 block mb-2">
            Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            required
            className="w-full border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-black placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-colors"
          />
        </div>

        <div>
          <label className="text-xs font-mono uppercase tracking-widest text-gray-400 dark:text-gray-500 block mb-2">
            Confirm password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            required
            className="w-full border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-black placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-colors"
          />
        </div>

        <div>
          <label className="text-xs font-mono uppercase tracking-widest text-gray-400 dark:text-gray-500 block mb-2">
            Phone number
          </label>
          <input
            type="tel"
            placeholder="+1 (555) 555-5555"
            className="w-full border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-black placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-colors"
          />
          <p className="text-xs text-gray-400 dark:text-gray-600 mt-1.5">
            Used for panic button SMS alerts only.
          </p>
        </div>

        <div>
          <label className="text-xs font-mono uppercase tracking-widest text-gray-400 dark:text-gray-500 block mb-2">
            Preferred language
          </label>
          <select className="w-full border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-black focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-colors">
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 transition-opacity"
        >
          Create account
        </button>

        <p className="text-center text-sm text-gray-400 dark:text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-gray-900 dark:text-gray-100 font-medium hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </main>
  )
}