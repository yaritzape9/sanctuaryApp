"use client"

import { translations, languages, type Lang } from "@/lib/translations/knowYourRights"
import { useLanguage } from "@/components/LanguageContext"

export default function KnowYourRightsPage() {
  const { lang, setLang } = useLanguage()
  const d = translations[lang as Lang]
  const isRtl = lang === "ar"
  const currentLanguage = languages.find((l) => l.code === lang)

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

            {/* Dropdown */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-neutral-400">Pick your language</span>
              <div className="relative">
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value as Lang)}
                  className="appearance-none bg-white/5 border border-white/20 text-white text-sm rounded-lg px-4 py-2.5 pr-9 cursor-pointer hover:border-white/40 focus:outline-none focus:border-white/60 transition-colors"
                >
                  {languages.map((l) => (
                    <option key={l.code} value={l.code} className="bg-neutral-900 text-white">
                      {l.label}
                    </option>
                  ))}
                </select>
                {/* Chevron */}
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
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