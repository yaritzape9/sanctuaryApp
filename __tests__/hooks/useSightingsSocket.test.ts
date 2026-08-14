import { renderHook, act } from "@testing-library/react"
import { vi, describe, it, expect, beforeEach, beforeAll } from "vitest"

// Mock @stomp/stompjs's Client so we control connect/disconnect/subscribe
// without ever opening a real socket. vi.hoisted lets these refs be used
// inside vi.mock factories below (which run before imports).
const { activateMock, deactivateMock, subscribeMock, clientConfigs, ClientMock } = vi.hoisted(() => {
  const activateMock = vi.fn()
  const deactivateMock = vi.fn()
  const subscribeMock = vi.fn()
  const clientConfigs: any[] = []

    const ClientMock = vi.fn().mockImplementation(function (config: any) {
    clientConfigs.push(config)
    return {
        activate: activateMock,
        deactivate: deactivateMock,
        subscribe: subscribeMock,
    }
    })

  return { activateMock, deactivateMock, subscribeMock, clientConfigs, ClientMock }
})

vi.mock("@stomp/stompjs", () => ({
  Client: ClientMock,
}))

// sockjs-client is only ever invoked inside webSocketFactory, which our
// mocked Client never calls — but it must resolve cleanly on import.
vi.mock("sockjs-client", () => ({
  default: vi.fn().mockImplementation(() => ({})),
}))

// WS_BASE is read from process.env at module import time, so the env var
// must be stubbed before useSightingsSocket is imported. Dynamic import
// after vi.stubEnv guarantees ordering without touching global test config.
let useSightingsSocket: typeof import("@/app/hooks/useSightingsSocket").useSightingsSocket

beforeAll(async () => {
  vi.stubEnv("NEXT_PUBLIC_SANCTUARY_API_URL", "http://localhost:8080")
  ;({ useSightingsSocket } = await import("@/app/hooks/useSightingsSocket"))
})

function getSubscribedCallback(topic: string) {
  const call = subscribeMock.mock.calls.find(([t]) => t === topic)
  if (!call) throw new Error(`No subscription registered for topic: ${topic}`)
  return call[1] as (message: { body: string }) => void
}

describe("useSightingsSocket", () => {
  beforeEach(() => {
    activateMock.mockClear()
    deactivateMock.mockClear()
    subscribeMock.mockClear()
    ClientMock.mockClear()
    clientConfigs.length = 0
  })

  it("does not create a connection when token is undefined", () => {
    const setSightings = vi.fn()
    renderHook(() => useSightingsSocket(undefined, setSightings))

    expect(ClientMock).not.toHaveBeenCalled()
    expect(activateMock).not.toHaveBeenCalled()
  })

  it("creates and activates a client with the token as a Bearer auth header", () => {
    const setSightings = vi.fn()
    renderHook(() => useSightingsSocket("fake-jwt", setSightings))

    expect(ClientMock).toHaveBeenCalledTimes(1)
    expect(clientConfigs[0].connectHeaders).toEqual({ Authorization: "Bearer fake-jwt" })
    expect(clientConfigs[0].reconnectDelay).toBe(5000)
    expect(activateMock).toHaveBeenCalledTimes(1)
  })

  it("reports connected true after onConnect and false after onDisconnect", () => {
    const setSightings = vi.fn()
    const { result } = renderHook(() => useSightingsSocket("fake-jwt", setSightings))

    expect(result.current.connected).toBe(false)

    act(() => clientConfigs[0].onConnect())
    expect(result.current.connected).toBe(true)

    act(() => clientConfigs[0].onDisconnect())
    expect(result.current.connected).toBe(false)
  })

  it("reports connected false after onStompError", () => {
    const setSightings = vi.fn()
    const { result } = renderHook(() => useSightingsSocket("fake-jwt", setSightings))

    act(() => clientConfigs[0].onConnect())
    expect(result.current.connected).toBe(true)

    act(() => clientConfigs[0].onStompError())
    expect(result.current.connected).toBe(false)
  })

  it("appends a new sighting on create and dedups by id", () => {
    const setSightings = vi.fn()
    renderHook(() => useSightingsSocket("fake-jwt", setSightings))
    act(() => clientConfigs[0].onConnect())

    const onCreate = getSubscribedCallback("/topic/sightings/create")
    const incoming = { id: "s1", lat: 1, lng: 1 }

    act(() => onCreate({ body: JSON.stringify(incoming) }))

    const updater = setSightings.mock.calls[0][0]
    expect(updater([])).toEqual([incoming])
    expect(updater([incoming])).toEqual([incoming]) // already present — no duplicate
  })

  it("finds and replaces the matching sighting on confirm", () => {
    const setSightings = vi.fn()
    renderHook(() => useSightingsSocket("fake-jwt", setSightings))
    act(() => clientConfigs[0].onConnect())

    const onConfirm = getSubscribedCallback("/topic/sightings/confirm")
    const updated = { id: "s1", lat: 5, lng: 5 }

    act(() => onConfirm({ body: JSON.stringify(updated) }))

    const updater = setSightings.mock.calls[0][0]
    const prev = [{ id: "s1", lat: 1, lng: 1 }, { id: "s2", lat: 2, lng: 2 }]
    expect(updater(prev)).toEqual([updated, prev[1]])
  })

  it("filters out the matching sighting on delete", () => {
    const setSightings = vi.fn()
    renderHook(() => useSightingsSocket("fake-jwt", setSightings))
    act(() => clientConfigs[0].onConnect())

    const onDelete = getSubscribedCallback("/topic/sightings/delete")

    act(() => onDelete({ body: JSON.stringify({ id: "s1" }) }))

    const updater = setSightings.mock.calls[0][0]
    const prev = [{ id: "s1" }, { id: "s2" }]
    expect(updater(prev)).toEqual([{ id: "s2" }])
  })

  it("deactivates the client on unmount", () => {
    const setSightings = vi.fn()
    const { unmount } = renderHook(() => useSightingsSocket("fake-jwt", setSightings))

    unmount()

    expect(deactivateMock).toHaveBeenCalledTimes(1)
  })

  it("deactivates the existing client and does not reconnect when token becomes undefined", () => {
    const setSightings = vi.fn()
    const { rerender } = renderHook(
      ({ token }: { token: string | undefined }) => useSightingsSocket(token, setSightings),
      { initialProps: { token: "fake-jwt" as string | undefined } }
    )

    expect(activateMock).toHaveBeenCalledTimes(1)

    rerender({ token: undefined })

    expect(deactivateMock).toHaveBeenCalledTimes(1)
    expect(ClientMock).toHaveBeenCalledTimes(1) // no second client created
  })
})