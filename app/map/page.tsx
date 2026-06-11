"use client"

import { useCallback, useState } from "react"
import { GoogleMap, useJsApiLoader, Marker, Circle, InfoWindow } from "@react-google-maps/api"
import ReportModal from "@/components/ReportModal"

const mapContainerStyle = { width: "100%", height: "100%" }
const defaultCenter = { lat: 40.7128, lng: -74.006 }
const SINGLE_RADIUS = 800
const CLUSTER_DISTANCE = 1200
const CONFIRM_THRESHOLD = 4

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

export type SightingStatus = "pending" | "confirmed"

export interface Sighting {
  id: string
  lat: number
  lng: number
  location: string
  description: string
  date: string
  time: string
  status: SightingStatus
  confirmations: number
}

// One mock sighting for local testing — remove when backend is wired
const INITIAL_SIGHTINGS: Sighting[] = [
  {
    id: "test-1",
    lat: 40.7158,
    lng: -74.013,
    location: "Canal St & Broadway, Manhattan",
    description: "3 unmarked vehicles, ~6 officers in plain clothes",
    date: "2025-06-09",
    time: "08:30",
    status: "pending",
    confirmations: 0,
  },
]

function distanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371000
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const sinDLat = Math.sin(dLat / 2)
  const sinDLng = Math.sin(dLng / 2)
  const aa =
    sinDLat * sinDLat +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      sinDLng * sinDLng
  return R * 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa))
}

interface Cluster {
  id: string
  center: { lat: number; lng: number }
  radius: number
  status: SightingStatus
  sightings: Sighting[]
}

function buildClusters(sightings: Sighting[]): Cluster[] {
  const used = new Set<string>()
  const clusters: Cluster[] = []

  for (const s of sightings) {
    if (used.has(s.id)) continue
    const nearby = sightings.filter(
      (o) => !used.has(o.id) && distanceMeters(s, o) <= CLUSTER_DISTANCE
    )
    nearby.forEach((o) => used.add(o.id))

    const center = {
      lat: nearby.reduce((sum, o) => sum + o.lat, 0) / nearby.length,
      lng: nearby.reduce((sum, o) => sum + o.lng, 0) / nearby.length,
    }

    clusters.push({
      id: s.id,
      center,
      radius: nearby.length >= 5 ? CLUSTER_DISTANCE : SINGLE_RADIUS,
      status: nearby.some((o) => o.status === "confirmed") ? "confirmed" : "pending",
      sightings: nearby,
    })
  }
  return clusters
}

function MapSkeleton() {
  return (
    <div className="w-full space-y-4">
      <div className="w-full h-[60vh] rounded-xl bg-sanctuary-surface animate-pulse border border-sanctuary-border relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div key={`h-${i}`} className="absolute w-full h-px bg-white/20" style={{ top: `${(i + 1) * 14}%` }} />
          ))}
          {[...Array(8)].map((_, i) => (
            <div key={`v-${i}`} className="absolute h-full w-px bg-white/20" style={{ left: `${(i + 1) * 11}%` }} />
          ))}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-xs text-neutral-700 tracking-widest uppercase">Loading map...</p>
        </div>
      </div>
    </div>
  )
}

export default function MapPage() {
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [pinCoords, setPinCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [sightings, setSightings] = useState<Sighting[]>(INITIAL_SIGHTINGS)
  const [selectedSighting, setSelectedSighting] = useState<Sighting | null>(null)

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  })

  const onLoad = useCallback((m: google.maps.Map) => setMap(m), [])
  const onUnmount = useCallback(() => setMap(null), [])

  function handleMapClick(e: google.maps.MapMouseEvent) {
    if (!e.latLng) return
    setPinCoords({ lat: e.latLng.lat(), lng: e.latLng.lng() })
    setModalOpen(true)
  }

  function handleModalClose() {
    setModalOpen(false)
    setPinCoords(null)
  }

  function handleReportSubmit(data: {
    lat: number
    lng: number
    location: string
    description: string
    date: string
    time: string
  }) {
    const newSighting: Sighting = {
      id: crypto.randomUUID(),
      ...data,
      status: "pending",
      confirmations: 0,
    }
    setSightings((prev) => [...prev, newSighting])
  }

  function handleConfirm(id: string) {
    setSightings((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s
        const confirmations = s.confirmations + 1
        return {
          ...s,
          confirmations,
          status: confirmations >= CONFIRM_THRESHOLD ? "confirmed" : "pending",
        }
      })
    )
    setSelectedSighting((prev) => {
      if (!prev || prev.id !== id) return prev
      const confirmations = prev.confirmations + 1
      return {
        ...prev,
        confirmations,
        status: confirmations >= CONFIRM_THRESHOLD ? "confirmed" : "pending",
      }
    })
  }

  const clusters = buildClusters(sightings)

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
          <div className="flex md:flex-col md:items-end gap-3">
            <button className="btn-primary" onClick={() => setModalOpen(true)}>
              + Report a sighting
            </button>
            {isLoaded && (
              <p className="text-xs text-neutral-600">
                Or click anywhere on the map to drop a pin
              </p>
            )}
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
            {/* Legend */}
            <div className="flex items-center gap-6 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-orange-400 opacity-80" />
                <span className="text-xs text-neutral-500">Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 opacity-80" />
                <span className="text-xs text-neutral-500">Confirmed</span>
              </div>
              <span className="text-xs text-neutral-700 ml-auto">
                {sightings.length} sighting{sightings.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="w-full h-[60vh] rounded-xl overflow-hidden border border-sanctuary-border">
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={defaultCenter}
                zoom={12}
                onLoad={onLoad}
                onUnmount={onUnmount}
                onClick={handleMapClick}
                options={{
                  styles: darkMapStyles,
                  disableDefaultUI: true,
                  zoomControl: true,
                }}
              >
                {/* Radius circles */}
                {clusters.map((cluster) => (
                  <Circle
                    key={`circle-${cluster.id}`}
                    center={cluster.center}
                    radius={cluster.radius}
                    options={{
                      strokeColor: cluster.status === "confirmed" ? "#ef4444" : "#fb923c",
                      strokeOpacity: 0.6,
                      strokeWeight: 1.5,
                      fillColor: cluster.status === "confirmed" ? "#ef4444" : "#fb923c",
                      fillOpacity: 0.08,
                    }}
                  />
                ))}

                {/* Sighting markers */}
                {sightings.map((s) => (
                  <Marker
                    key={s.id}
                    position={{ lat: s.lat, lng: s.lng }}
                    onClick={() => setSelectedSighting(s)}
                    icon={{
                      path: google.maps.SymbolPath.CIRCLE,
                      scale: 7,
                      fillColor: s.status === "confirmed" ? "#ef4444" : "#fb923c",
                      fillOpacity: 1,
                      strokeColor: "#0f0e17",
                      strokeWeight: 2,
                    }}
                  />
                ))}

                {/* InfoWindow on marker click */}
                {selectedSighting && (
                  <InfoWindow
                    position={{ lat: selectedSighting.lat, lng: selectedSighting.lng }}
                    onCloseClick={() => setSelectedSighting(null)}
                  >
                    <div style={{ background: "#1a1a2e", color: "#fff", padding: "12px", maxWidth: "220px", borderRadius: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                        <span style={{
                          fontSize: "10px",
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: "99px",
                          background: selectedSighting.status === "confirmed" ? "#ef444430" : "#fb923c30",
                          color: selectedSighting.status === "confirmed" ? "#ef4444" : "#fb923c",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}>
                          {selectedSighting.status}
                        </span>
                        <span style={{ fontSize: "10px", color: "#6b7280" }}>
                          {selectedSighting.confirmations} confirmation{selectedSighting.confirmations !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <p style={{ fontSize: "12px", fontWeight: 600, marginBottom: "4px", color: "#fff" }}>
                        {selectedSighting.location}
                      </p>
                      <p style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "8px", lineHeight: "1.5" }}>
                        {selectedSighting.description}
                      </p>
                      <p style={{ fontSize: "10px", color: "#6b7280", marginBottom: "10px" }}>
                        {selectedSighting.date} · {selectedSighting.time}
                      </p>
                      {selectedSighting.status === "pending" && (
                        <button
                          onClick={() => handleConfirm(selectedSighting.id)}
                          style={{
                            width: "100%",
                            padding: "6px",
                            fontSize: "11px",
                            fontWeight: 600,
                            background: "#fb923c20",
                            color: "#fb923c",
                            border: "1px solid #fb923c40",
                            borderRadius: "6px",
                            cursor: "pointer",
                          }}
                        >
                          ✓ Confirm this sighting ({CONFIRM_THRESHOLD - selectedSighting.confirmations} more needed)
                        </button>
                      )}
                      {selectedSighting.status === "confirmed" && (
                        <p style={{ fontSize: "10px", color: "#ef4444", textAlign: "center" }}>
                          ✓ Confirmed by the community
                        </p>
                      )}
                    </div>
                  </InfoWindow>
                )}

                {/* Drop pin while reporting */}
                {pinCoords && !modalOpen && (
                  <Marker
                    position={pinCoords}
                    draggable
                    onDragEnd={(e) => {
                      if (!e.latLng) return
                      setPinCoords({ lat: e.latLng.lat(), lng: e.latLng.lng() })
                    }}
                  />
                )}
              </GoogleMap>
            </div>

            {sightings.length === 0 && (
              <div className="mt-6 border border-dashed border-white/10 rounded-xl px-6 py-8 text-center">
                <p className="text-sm text-neutral-600 mb-1">No sightings reported yet.</p>
                <p className="text-xs text-neutral-700">Be the first to report ICE activity in your area.</p>
              </div>
            )}
          </>
        )}
      </section>

      <ReportModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        pinCoords={pinCoords}
        onSubmit={handleReportSubmit}
      />
    </main>
  )
}