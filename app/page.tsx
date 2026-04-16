"use client"

import Link from "next/link"

const steps = [
  {
    num: "01",
    title: "Report a sighting",
    body: "See ICE activity in your area? Pin it on the map so your community knows immediately.",
  },
  {
    num: "02",
    title: "Stay informed",
    body: "Get real-time alerts when sightings are reported near you. Knowledge is protection.",
  },
  {
    num: "03",
    title: "Trigger the panic button",
    body: "If you're targeted, one tap notifies up to 5 emergency contacts with your location.",
  },
]

const quickLinks = [
  {
    label: "View the map",
    description: "See real-time ICE sightings in your community.",
    href: "/map",
  },
  {
    label: "Know your rights",
    description: "What to do if ICE approaches you or your home.",
    href: "/know-your-rights",
  },
  {
    label: "Set up panic button",
    description: "Register your emergency contacts before you need them.",
    href: "/signup",
  },
]

export default function HomePage() {
  return (
    <main className="max-w-3xl mx-auto px-8 py-16 min-h-screen">

      {/* Hero */}
      <section className="mb-16">
        <p className="text-xs font-mono uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">
          Sanctuary
        </p>
        <h1 className="text-5xl font-bold tracking-tight leading-none mb-6">
          Protect your<br />community.
        </h1>
        <div className="w-12 h-px bg-gray-300 dark:bg-gray-700 mb-6" />
        <p className="text-gray-500 dark:text-gray-400 leading-relaxed max-w-lg mb-8">
          Sanctuary gives immigrant communities the tools to stay informed, know
          their rights, and protect each other in real time.
        </p>
        <div className="flex gap-3">
          <Link
            href="/signup"
            className="px-6 py-2.5 rounded-full text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 transition-opacity"
          >
            Get started
          </Link>
          <Link
            href="/map"
            className="px-6 py-2.5 rounded-full text-sm border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-500 transition-colors"
          >
            View the map
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="mb-16">
        <p className="text-xs font-mono uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-8">
          How it works
        </p>
        <div className="space-y-4">
          {steps.map((step) => (
            <div
              key={step.num}
              className="flex gap-6 border border-gray-200 dark:border-gray-800 rounded-xl px-6 py-5"
            >
              <p className="text-xs font-mono text-gray-400 dark:text-gray-600 mt-0.5 shrink-0">
                {step.num}
              </p>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                  {step.title}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {step.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick links */}
      <section className="mb-16">
        <p className="text-xs font-mono uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-8">
          Quick access
        </p>
        <div className="space-y-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-center justify-between border border-gray-200 dark:border-gray-800 rounded-xl px-6 py-4 hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100 mb-0.5">
                  {link.label}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {link.description}
                </p>
              </div>
              <span className="text-gray-300 dark:text-gray-700 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors text-lg">
                ↗
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Builder note */}
      <section className="border-t border-gray-200 dark:border-gray-800 pt-12">
        <p className="text-xs font-mono uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">
          Why I built this
        </p>
        <p className="text-gray-500 dark:text-gray-400 leading-relaxed max-w-lg">
          I built Sanctuary because I grew up with immigrant parents, and I know
          firsthand how terrifying this time is. No family should have to
          navigate that fear alone. This app is my way of giving back to my
          community — keeping people informed, prepared, and protected.
        </p>
      </section>

    </main>
  )
}