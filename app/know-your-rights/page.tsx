"use client"

import { useState } from "react"
import { translations, languages, type Lang } from "@/lib/translations/knowYourRights"

export default function KnowYourRightsPage() {
  const [lang, setLang] = useState<Lang>("en")
  const d = translations[lang]
  const isRtl = lang === "ar"

  return (
    <main
      className="mobile-screen px-8 md:px-16 lg:px-24 py-16"
      dir={isRtl ? "rtl" : "ltr"}
    >

      {/* Hero + language switcher */}
      <section className="mb-16">
        <div className="grid md:grid-cols-2 gap-8 items-end mb-10">
          <div>
            <p className="section-label mb-4">{d.label}</p>
            <h1 className="font-heading text-5xl md:text-6xl font-semibold leading-none tracking-tight text-white">
              {d.title}
            </h1>
          </div>
          <div className="flex flex-col gap-4 md:items-end">
            <div className="flex gap-2 flex-wrap md:justify-end">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={`px-4 py-1.5 rounded text-sm border transition-colors ${
                    lang === l.code
                      ? "bg-white text-black border-white"
                      : "border-white/20 text-neutral-400 hover:border-white/40 hover:text-white"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <p className="text-neutral-400 leading-relaxed md:text-right">
              {d.subtitle}
            </p>
          </div>
        </div>
        <div className="divider" />
      </section>

      {/* Warning banner */}
      <section className="mb-16">
        <div className="border border-red-500/30 bg-red-500/5 rounded-xl px-8 py-6 grid md:grid-cols-[120px_1fr] gap-4 items-start">
          <p className="section-label text-red-400 pt-1">{d.warnLabel}</p>
          <p className="text-neutral-300 leading-relaxed">{d.warnText}</p>
        </div>
      </section>

      {/* Rights grid */}
      <section>
        <p className="section-label mb-8">Your rights</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {d.rights.map((right) => (
            <div
              key={right.num}
              className="flex flex-col border border-sanctuary-border bg-sanctuary-surface rounded-xl px-6 py-6 gap-4"
            >
              <p className="text-xs font-mono text-neutral-600">{right.num}</p>
              <div>
                <p className="font-medium text-white text-lg mb-2 leading-snug">
                  {right.title}
                </p>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  {right.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </main>
  )
}