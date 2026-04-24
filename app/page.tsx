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
    <main className="mobile-screen px-8 md:px-16 lg:px-24 py-16">

      {/* Hero — large, left-aligned, full width */}
      <section className="mb-24">
        <h1 className="display-text mb-3">Sanctuary</h1>
        <p className="font-heading text-2xl md:text-3xl text-neutral-500 tracking-tight mb-8">
          Protect your community.
        </p>
        <div className="divider mb-8" />
        <div className="grid md:grid-cols-2 gap-12 items-end">
          <p className="text-neutral-400 leading-relaxed text-lg">
            Sanctuary gives immigrant communities the tools to stay informed, know
            their rights, and protect each other in real time.
          </p>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Link href="/signup" className="btn-primary">
              Get started
            </Link>
            <Link href="/map" className="btn-outline">
              View the map
            </Link>
          </div>
        </div>
      </section>

      {/* How it works — full width 3 col on desktop */}
      <section className="mb-24">
        <div className="divider mb-10" />
        <p className="section-label mb-8">How it works</p>
        <div className="grid md:grid-cols-3 gap-4">
          {steps.map((step) => (
            <div
              key={step.num}
              className="flex flex-col gap-4 border border-sanctuary-border bg-sanctuary-surface rounded-xl px-6 py-6"
            >
              <p className="text-xs font-mono text-neutral-600">{step.num}</p>
              <div>
                <p className="font-medium text-white mb-2 text-lg">{step.title}</p>
                <p className="text-sm text-neutral-400 leading-relaxed">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick links — full width */}
      <section className="mb-24">
        <div className="divider mb-10" />
        <p className="section-label mb-8">Quick access</p>
        <div className="grid md:grid-cols-3 gap-4">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-start justify-between border border-sanctuary-border bg-sanctuary-surface rounded-xl px-6 py-6 hover:border-white/20 transition-colors"
            >
              <div>
                <p className="font-medium text-white mb-1 text-lg">{link.label}</p>
                <p className="text-sm text-neutral-400 leading-relaxed">{link.description}</p>
              </div>
              <span className="text-neutral-600 group-hover:text-sanctuary-accent transition-colors text-xl ml-4 shrink-0">
                ↗
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Builder note — full width asymmetric */}
      <section>
        <div className="divider mb-10" />
        <div className="grid md:grid-cols-[200px_1fr] gap-8 items-start">
          <p className="section-label pt-1">Why I built this</p>
          <p className="text-neutral-400 leading-relaxed text-lg max-w-2xl">
            I built Sanctuary because I grew up with immigrant parents, and I know
            firsthand how terrifying this time is. No family should have to
            navigate that fear alone. This app is my way of giving back to my
            community — keeping people informed, prepared, and protected.
          </p>
        </div>
      </section>

    </main>
  )
}