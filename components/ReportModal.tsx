// TODO: Add "Use my location" button
// - Use navigator.geolocation.getCurrentPosition() to get lat/lng
// - Reverse geocode with Google Maps Geocoding API to get a human-readable address
// - Auto-fill the location field with the result
// - Show a pin on the map at the user's current position

// TODO: Click on map to drop a pin
// - Add an onClick handler to the GoogleMap component in map/page.tsx
// - On click, capture the lat/lng from the map click event
// - Pass the coordinates up to the modal via state
// - Reverse geocode to get address and auto-fill the location field
// - Show a draggable marker so the user can adjust the pin position
"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/hooks/useToast"
import ToastContainer from "@/components/Toast"

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  pinCoords?: { lat: number; lng: number } | null
  onSubmit?: (data: {
    lat: number
    lng: number
    location: string
    description: string
    date: string
    time: string
  }) => void
}


const inputClass = `
  w-full border border-sanctuary-border bg-sanctuary-black rounded
  px-4 py-3 text-sm text-white placeholder-neutral-600
  focus:outline-none focus:border-white/30 transition-colors
`

const labelClass = "section-label block mb-2"

export default function ReportModal({ isOpen, onClose, pinCoords, onSubmit }: ReportModalProps) {
  const { toasts, addToast, removeToast } = useToast()
const [location, setLocation] = useState("")
const [description, setDescription] = useState("")
const [date, setDate] = useState("")
const [time, setTime] = useState("")
const [submitting, setSubmitting] = useState(false)
const [locating, setLocating] = useState(false)

  // Close on Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

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

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault()
    setSubmitting(true)

    // TODO: POST to Spring Boot sightings API
    // Sighting should be saved with status: "pending"
    // Status upgrades to "confirmed" after 4-5 unique user confirmations
    // Fields: location, description, date, time, reportedBy (user id), status, confirmations[]

    setTimeout(() => {
    setSubmitting(false)
    if (pinCoords && onSubmit) {
        onSubmit({
        lat: pinCoords.lat,
        lng: pinCoords.lng,
        location,
        description,
        date,
        time,
        })
    }
    setLocation("")
    setDescription("")
    setDate("")
    setTime("")
    onClose()
    addToast("Sighting reported. It will show on the map once confirmed by others.", "success")
    }, 600)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none">
        <div className="w-full max-w-lg bg-sanctuary-surface border border-sanctuary-border rounded-xl p-6 pointer-events-auto">

          {/* Header */}
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

          {/* Pending notice */}
          <div className="border border-sanctuary-accent/20 bg-sanctuary-accent/5 rounded px-4 py-3 mb-6">
            <p className="text-xs text-sanctuary-accent leading-relaxed">
              Your report will appear as <span className="font-semibold">pending</span> on the map until 4–5 people confirm the same sighting. This helps keep the map accurate.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Corner of Main St and 5th Ave, Brooklyn"
                required
                className={inputClass}
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className={`${inputClass} [color-scheme:dark]`}
                />
              </div>
              <div>
                <label className={labelClass}>Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className={`${inputClass} [color-scheme:dark]`}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting..." : "Submit report"}
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