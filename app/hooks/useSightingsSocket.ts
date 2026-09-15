"use client"

import { useEffect, useRef, useState } from "react"
import { Client, type IMessage } from "@stomp/stompjs"
import SockJS from "sockjs-client"
import type { Sighting } from "@/app/map/page"

const WS_BASE = process.env.NEXT_PUBLIC_SANCTUARY_API_URL

/**
 * Opens a STOMP-over-SockJS connection to the backend and keeps a
 * sightings list in sync with live create/confirm/delete events.
 *
 * Only connects when a JWT is available — StompAuthInterceptor rejects
 * unauthenticated CONNECT frames, so logged-out users simply don't get
 * live updates (they still see the initial REST-fetched list).
 */
export function useSightingsSocket(
  token: string | undefined,
  setSightings: React.Dispatch<React.SetStateAction<Sighting[]>>
) {
  const [connected, setConnected] = useState(false)
  const clientRef = useRef<Client | null>(null)

  useEffect(() => {
    if (!token || !WS_BASE) return

    const client = new Client({
      webSocketFactory: () => new SockJS(`${WS_BASE}/ws`) as WebSocket,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true)

        client.subscribe("/topic/sightings/create", (message: IMessage) => {
          const incoming: Sighting = JSON.parse(message.body)
          setSightings((prev) =>
            prev.some((s) => s.id === incoming.id) ? prev : [...prev, incoming]
          )
        })

        client.subscribe("/topic/sightings/confirm", (message: IMessage) => {
          const updated: Sighting = JSON.parse(message.body)
          setSightings((prev) =>
            prev.map((s) => (s.id === updated.id ? updated : s))
          )
        })

        client.subscribe("/topic/sightings/delete", (message: IMessage) => {
          const removed: Sighting = JSON.parse(message.body)
          setSightings((prev) => prev.filter((s) => s.id !== removed.id))
        })
      },
      onDisconnect: () => setConnected(false),
      onStompError: () => setConnected(false),
    })

    clientRef.current = client
    client.activate()

    return () => {
      client.deactivate()
      clientRef.current = null
      setConnected(false)
    }
  }, [token, setSightings])

  return { connected }
}