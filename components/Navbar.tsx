"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"

// TODO: replace with real auth session check
const isLoggedIn = false

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Map", href: "/map" },
  { label: "Know Your Rights", href: "/know-your-rights" },
]

export default function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [menuOpen])

  return (
    <>
      <nav className="w-full border-b border-sanctuary-border bg-sanctuary-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="px-8 md:px-16 lg:px-24 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link
            href="/"
            className="font-heading text-lg font-semibold text-white tracking-tight hover:text-neutral-300 transition-colors"
          >
            🛡️ Sanctuary
          </Link>

          {/* Desktop nav links */}
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

          {/* Desktop right side */}
          <div className="hidden md:flex items-center gap-2">
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

          {/* Mobile — panic button + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            {isLoggedIn && (
              <Link
                href="/panic"
                className="px-3 py-1.5 rounded text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors"
              >
                🆘
              </Link>
            )}
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Toggle menu"
              className="flex flex-col justify-center items-center w-10 h-10 gap-1.5"
            >
              <span className={`block h-px w-6 bg-white transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block h-px w-6 bg-white transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block h-px w-6 bg-white transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>

        </div>
      </nav>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-sanctuary-black flex flex-col px-8 pt-24 pb-12 md:hidden">

          {/* Nav links */}
          <div className="flex flex-col gap-1 mb-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-3 rounded text-lg transition-colors ${
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

          <div className="divider mb-8" />

          {/* Auth buttons */}
          <div className="flex flex-col gap-3">
            {isLoggedIn ? (
              <>
                <Link
                  href="/panic"
                  className="w-full text-center py-3 rounded text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors"
                >
                  🆘 Panic Button
                </Link>
                <button className="w-full py-3 rounded text-sm border border-sanctuary-border text-neutral-400 hover:border-white/20 hover:text-white transition-colors">
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link href="/signup" className="btn-primary w-full justify-center">
                  Sign up
                </Link>
                <Link
                  href="/login"
                  className="w-full text-center py-3 rounded text-sm border border-sanctuary-border text-neutral-400 hover:border-white/20 hover:text-white transition-colors"
                >
                  Log in
                </Link>
              </>
            )}
          </div>

        </div>
      )}
    </>
  )
}