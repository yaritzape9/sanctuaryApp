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
    <nav className="w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
      <div className="max-w-5xl mx-auto px-8 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="text-base font-medium tracking-tight text-gray-900 dark:text-gray-100">
          Sanctuary
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                  isActive
                    ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900 font-medium"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-900"
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <button className="px-4 py-1.5 rounded-full text-sm border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-500 transition-colors">
                Log out
              </button>
              <Link
                href="/panic"
                className="px-4 py-1.5 rounded-full text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors"
              >
                Panic Button
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-1.5 rounded-full text-sm border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-500 transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="px-4 py-1.5 rounded-full text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 transition-opacity"
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