"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { Lang } from "@/lib/translations/knowYourRights"

interface LanguageContextType {
  lang: Lang
  setLang: (lang: Lang) => void
}

// No default value: without a provider, setLang used to be a silent no-op,
// which is how the language switcher stayed broken unnoticed
const LanguageContext = createContext<LanguageContextType | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en")

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error("useLanguage must be used inside <LanguageProvider>")
  return ctx
}