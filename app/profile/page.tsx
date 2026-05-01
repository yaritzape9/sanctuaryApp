"use client"

import { useState } from "react"

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "zh", label: "中文" },
  { value: "ar", label: "العربية" },
]

interface EmergencyContact {
  id: number
  name: string
  phone: string
}

export default function ProfilePage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [language, setLanguage] = useState("en")
  const [contacts, setContacts] = useState<EmergencyContact[]>([])
  const [editingInfo, setEditingInfo] = useState(false)

  function addContact() {
    if (contacts.length >= 5) return
    setContacts((prev) => [...prev, { id: Date.now(), name: "", phone: "" }])
  }

  function updateContact(id: number, field: "name" | "phone", value: string) {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    )
  }

  function removeContact(id: number) {
    setContacts((prev) => prev.filter((c) => c.id !== id))
  }

  function handleSaveInfo(e: React.FormEvent) {
    e.preventDefault()
    setEditingInfo(false)
    // TODO: connect to Spring Boot API
  }

  const inputClass = `
    w-full border border-sanctuary-border bg-sanctuary-surface rounded
    px-4 py-3 text-sm text-white placeholder-neutral-600
    focus:outline-none focus:border-white/30 transition-colors
  `

  const labelClass = "section-label block mb-2"

  return (
    <main className="mobile-screen px-8 md:px-16 lg:px-24 py-16">

      {/* Header */}
      <section className="mb-16">
        <p className="section-label mb-4">Account</p>
        <h1 className="font-heading text-5xl md:text-6xl font-semibold leading-none tracking-tight text-white mb-6">
          Your profile.
        </h1>
        <div className="divider" />
      </section>

      <div className="grid lg:grid-cols-[1fr_2fr] gap-16 items-start">

        {/* Left — section labels */}
        <div className="hidden lg:flex flex-col gap-16 lg:sticky lg:top-24">
          <div>
            <p className="section-label mb-2">Basic info</p>
            <p className="text-xs text-neutral-600">Your name, email, and phone number.</p>
          </div>
          <div>
            <p className="section-label mb-2">Language</p>
            <p className="text-xs text-neutral-600">Preferred language for alerts and content.</p>
          </div>
          <div>
            <p className="section-label mb-2">Emergency contacts</p>
            <p className="text-xs text-neutral-600">Up to 5 contacts notified when you trigger the panic button.</p>
          </div>
        </div>

        {/* Right — content */}
        <div className="flex flex-col gap-10">

          {/* Basic info */}
          <section className="border border-sanctuary-border bg-sanctuary-surface rounded-xl px-6 py-6">
            <div className="flex items-center justify-between mb-6">
              <p className="section-label">Basic info</p>
              <button
                onClick={() => setEditingInfo((prev) => !prev)}
                className="text-xs text-neutral-400 hover:text-white transition-colors"
              >
                {editingInfo ? "Cancel" : "Edit"}
              </button>
            </div>

            {editingInfo ? (
              <form onSubmit={handleSaveInfo} className="space-y-4">
                <div>
                  <label className={labelClass}>Full name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Phone number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 555-5555"
                    className={inputClass}
                  />
                </div>
                <button type="submit" className="btn-primary">
                  Save changes
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                {[
                  { label: "Full name", value: name },
                  { label: "Email", value: email },
                  { label: "Phone", value: phone },
                ].map(({ label, value }) => (
                  <div key={label} className="grid grid-cols-[120px_1fr] gap-4 items-start">
                    <p className="text-xs text-neutral-600 pt-0.5">{label}</p>
                    <p className="text-sm text-neutral-300">
                      {value || <span className="text-neutral-600 italic">Not set</span>}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Language preference */}
          <section className="border border-sanctuary-border bg-sanctuary-surface rounded-xl px-6 py-6">
            <p className="section-label mb-6">Language preference</p>
            <div className="flex flex-wrap gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => setLanguage(lang.value)}
                  className={`px-4 py-1.5 rounded text-sm border transition-colors ${
                    language === lang.value
                      ? "bg-white text-black border-white"
                      : "border-sanctuary-border text-neutral-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-neutral-600 mt-4">
              This sets your default language for alerts and the Know Your Rights page.
            </p>
          </section>

          {/* Emergency contacts */}
          <section className="border border-sanctuary-border bg-sanctuary-surface rounded-xl px-6 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="section-label mb-1">Emergency contacts</p>
                <p className="text-xs text-neutral-600">{contacts.length}/5 added</p>
              </div>
              {contacts.length < 5 && (
                <button
                  onClick={addContact}
                  className="text-xs text-neutral-400 hover:text-white transition-colors"
                >
                  + Add contact
                </button>
              )}
            </div>

            {contacts.length === 0 ? (
              <div className="border border-dashed border-white/10 rounded-xl px-6 py-8 text-center">
                <p className="text-sm text-neutral-600 mb-3">No emergency contacts added yet.</p>
                <button
                  onClick={addContact}
                  className="btn-outline text-sm py-2 px-4"
                >
                  Add your first contact
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {contacts.map((contact, i) => (
                  <div
                    key={contact.id}
                    className="grid grid-cols-[1fr_1fr_auto] gap-3 items-center"
                  >
                    <input
                      type="text"
                      value={contact.name}
                      onChange={(e) => updateContact(contact.id, "name", e.target.value)}
                      placeholder={`Contact ${i + 1} name`}
                      className={inputClass}
                    />
                    <input
                      type="tel"
                      value={contact.phone}
                      onChange={(e) => updateContact(contact.id, "phone", e.target.value)}
                      placeholder="Phone number"
                      className={inputClass}
                    />
                    <button
                      onClick={() => removeContact(contact.id)}
                      className="text-neutral-600 hover:text-red-400 transition-colors text-lg leading-none"
                      aria-label="Remove contact"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button className="btn-primary mt-2">
                  Save contacts
                </button>
              </div>
            )}
          </section>

        </div>
      </div>
    </main>
  )
}