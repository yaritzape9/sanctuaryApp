"use client"

import { useCallback, useState } from "react"
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api"

const mapContainerStyle = {
  width: "100%",
  height: "100%",
}

const defaultCenter = {
  lat: 40.7128,
  lng: -74.006, // New York — update to your target city
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

export default function MapPage() {
  const [map, setMap] = useState<google.maps.Map | null>(null)

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
              onClick={() => {
                // TODO: open report sighting form/modal
              }}
            >
              + Report a sighting
            </button>
          </div>
        </div>
        <div className="divider" />
      </section>

      {/* Map */}
      <section>
        <div className="w-full h-[60vh] rounded-xl overflow-hidden border border-sanctuary-border">
          {loadError && (
            <div className="w-full h-full flex items-center justify-center bg-sanctuary-surface">
              <p className="text-neutral-400 text-sm">Failed to load map. Check your API key.</p>
            </div>
          )}

          {!isLoaded && !loadError && (
            <div className="w-full h-full flex items-center justify-center bg-sanctuary-surface animate-pulse">
              <p className="text-neutral-600 text-sm">Loading map...</p>
            </div>
          )}

          {isLoaded && (
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
          )}
        </div>

        {/* Empty state */}
        <div className="mt-6 border border-dashed border-white/10 rounded-xl px-6 py-8 text-center">
          <p className="text-sm text-neutral-600 mb-1">No sightings reported yet.</p>
          <p className="text-xs text-neutral-700">
            Be the first to report ICE activity in your area.
          </p>
        </div>
      </section>

    </main>
  )
}