"use client"

import { useCallback, useState } from "react"
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api"
import { SkeletonMap } from "@/components/Skeleton"
import ReportModal from "@/components/ReportModal"

const mapContainerStyle = {
  width: "100%",
  height: "100%",
}

const defaultCenter = {
  lat: 40.7128,
  lng: -74.006,
}

const darkMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#0f0e17" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0f0e17" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#16151f" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#1f2835" }] },
]

function MapSkeleton() {
  return (
    <div className="w-full space-y-4">
      {/* Map area skeleton */}
      <div className="w-full h-[60vh] rounded-xl bg-sanctuary-surface animate-pulse border border-sanctuary-border relative overflow-hidden">
        {/* Fake map grid lines */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div
              key={`h-${i}`}
              className="absolute w-full h-px bg-white/20"
              style={{ top: `${(i + 1) * 14}%` }}
            />
          ))}
          {[...Array(8)].map((_, i) => (
            <div
              key={`v-${i}`}
              className="absolute h-full w-px bg-white/20"
              style={{ left: `${(i + 1) * 11}%` }}
            />
          ))}
        </div>
        {/* Fake zoom controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-1">
          <div className="w-8 h-8 rounded bg-white/5" />
          <div className="w-8 h-8 rounded bg-white/5" />
        </div>
        {/* Loading label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-xs text-neutral-700 tracking-widest uppercase">
            Loading map...
          </p>
        </div>
      </div>

      {/* Empty state skeleton */}
      <div className="border border-dashed border-white/5 rounded-xl px-6 py-8">
        <div className="flex flex-col items-center gap-2">
          <div className="h-3 w-48 rounded bg-white/5 animate-pulse" />
          <div className="h-2 w-36 rounded bg-white/5 animate-pulse" />
        </div>
      </div>
    </div>
  )
}

export default function MapPage() {
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  })

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
  }, [])

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  return (
    <main className="mobile-screen px-8 md:px-16 lg:px-24 py-16">

      {/* Header */}
      <section className="mb-10">
        <div className="grid md:grid-cols-2 gap-8 items-end mb-8">
          <div>
            <p className="section-label mb-4">ICE Sightings</p>
            <h1 className="font-heading text-5xl md:text-6xl font-semibold leading-none tracking-tight text-white">
              Sightings map.
            </h1>
          </div>
          <div className="flex md:justify-end">
            <button
              className="btn-primary"
              onClick={() => setModalOpen(true)}
            >
              + Report a sighting
            </button>
          </div>
        </div>
        <div className="divider" />
      </section>

      {/* Map */}
      <section>
        {loadError && (
          <div className="w-full h-[60vh] rounded-xl border border-sanctuary-border bg-sanctuary-surface flex items-center justify-center">
            <div className="text-center">
              <p className="text-neutral-400 text-sm mb-1">Failed to load map.</p>
              <p className="text-neutral-600 text-xs">Check your API key in .env.local</p>
            </div>
          </div>
        )}

        {!isLoaded && !loadError && <MapSkeleton />}

        {isLoaded && (
          <>
            <div className="w-full h-[60vh] rounded-xl overflow-hidden border border-sanctuary-border">
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={defaultCenter}
                zoom={12}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={{
                  styles: darkMapStyles,
                  disableDefaultUI: true,
                  zoomControl: true,
                  streetViewControl: false,
                  fullscreenControl: false,
                }}
              />
            </div>

            {/* Empty state */}
            <div className="mt-6 border border-dashed border-white/10 rounded-xl px-6 py-8 text-center">
              <p className="text-sm text-neutral-600 mb-1">No sightings reported yet.</p>
              <p className="text-xs text-neutral-700">
                Be the first to report ICE activity in your area.
              </p>
            </div>
          </>
        )}
      </section>
      {/* Modal */}
      <ReportModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />

    </main>
  )
}