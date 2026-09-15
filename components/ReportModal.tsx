"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/hooks/useToast"
import ToastContainer from "@/components/Toast"

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  pinCoords?: { lat: number; lng: number } | null
  onSubmit?: () => void
  onUseMyLocation?: () => void
  locatingUser?: boolean
}

const inputClass = `
  w-full border border-sanctuary-border bg-sanctuary-black rounded
  px-4 py-3 text-sm text-white placeholder-neutral-600
  focus:outline-none focus:border-white/30 transition-colors
`

const labelClass = "section-label block mb-2"

export default function ReportModal({
  isOpen,
  onClose,
  pinCoords,
  onSubmit,
  onUseMyLocation,
  locatingUser,
}: ReportModalProps) {
  const { toasts, addToast, removeToast } = useToast()
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [locating, setLocating] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  // Reverse geocode whenever pinCoords changes
  useEffect(() => {
    if (!pinCoords) return
    setLocating(true)
    fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${pinCoords.lat}&lon=${pinCoords.lng}&format=json`
    )
      .then((res) => res.json())
      .then((data) => {
        setLocation(data.display_name || `${pinCoords.lat.toFixed(5)}, ${pinCoords.lng.toFixed(5)}`)
      })
      .catch(() => {
        setLocation(`${pinCoords.lat.toFixed(5)}, ${pinCoords.lng.toFixed(5)}`)
      })
      .finally(() => setLocating(false))
  }, [pinCoords])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!pinCoords) {
      addToast("Drop a pin on the map first to set the location.", "error")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/sightings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: pinCoords.lat,
          lng: pinCoords.lng,
          location,
          description,
        }),
      })

      if (!res.ok) throw new Error()

      setLocation("")
      setDescription("")
      onClose()
      onSubmit?.()
      addToast("Sighting reported. It will appear on the map once confirmed by others.", "success")
    } catch {
      addToast("Failed to submit report. Please try again.", "error")
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none">
        <div className="w-full max-w-lg bg-sanctuary-surface border border-sanctuary-border rounded-xl p-6 pointer-events-auto">

          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="section-label mb-1">Map</p>
              <h2 className="font-heading text-2xl font-semibold text-white">
                Report a sighting
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-600 hover:text-white transition-colors text-xl leading-none mt-1"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className="border border-sanctuary-accent/20 bg-sanctuary-accent/5 rounded px-4 py-3 mb-6">
            <p className="text-xs text-sanctuary-accent leading-relaxed">
              Your report will appear as <span className="font-semibold">pending</span> until
              enough community members confirm the same sighting.
            </p>
          </div>

          {/* Pin status + Use my location */}
          <div className="border border-sanctuary-border rounded px-4 py-3 mb-4 flex items-center justify-between gap-4">
            <div>
              {pinCoords ? (
                <p className="text-xs text-green-400">📍 Pin placed — click the map to move it</p>
              ) : (
                <p className="text-xs text-neutral-500">No pin placed yet. Use your location or click the map.</p>
              )}
            </div>
            <button
              type="button"
              onClick={onUseMyLocation}
              disabled={locatingUser}
              className="btn-outline text-xs px-3 py-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {locatingUser ? "Locating…" : "📍 Use my location"}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>Location</label>
              <input
                type="text"
                value={locating ? "Locating…" : location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Corner of Main St and 5th Ave, Brooklyn"
                required
                disabled={locating}
                className={`${inputClass} disabled:opacity-50`}
              />
            </div>

            <div>
              <label className={labelClass}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What did you see? How many officers? Vehicles?"
                required
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting || locating}
                className="btn-primary flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting…" : "Submit report"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-outline px-6"
              >
                Cancel
              </button>
            </div>
          </form>

        </div>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  )
}