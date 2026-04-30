"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

// TODO: replace with real auth session check
const isLoggedIn = false

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Map", href: "/map" },
  { label: "Know Your Rights", href: "/know-your-rights" },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="w-full border-b border-sanctuary-border bg-sanctuary-black/80 backdrop-blur-md sticky top-0 z-50">
      <div className="px-8 md:px-16 lg:px-24 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link
          href="/"
          className="font-heading text-lg font-semibold text-white tracking-tight hover:text-neutral-300 transition-colors"
        >
          🛡️ Sanctuary
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-1.5 rounded text-sm transition-colors ${
                  isActive
                    ? "bg-white/10 text-white font-medium"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <button className="px-4 py-1.5 rounded text-sm border border-sanctuary-border text-neutral-400 hover:border-white/20 hover:text-white transition-colors">
                Log out
              </button>
              <Link
                href="/panic"
                className="px-4 py-1.5 rounded text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors"
              >
                🆘 Panic
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-1.5 rounded text-sm border border-sanctuary-border text-neutral-400 hover:border-white/20 hover:text-white transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="btn-primary py-1.5 px-4 text-sm"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  )
}