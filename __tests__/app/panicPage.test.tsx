import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { useSession } from "next-auth/react";
import { ToastProvider } from "@/context/ToastContext";
import { sessionFor, unauthenticatedSession, loadingSession } from "../utils/mockAuth";

vi.mock("next-auth/react", () => ({ useSession: vi.fn() }));
vi.mock("@/lib/fetchWithRetry", () => ({ fetchWithRetry: vi.fn() }));
import { fetchWithRetry } from "@/lib/fetchWithRetry";
import PanicPage from "@/app/panic/page";

const mockUseSession = vi.mocked(useSession);
const mockFetchWithRetry = vi.mocked(fetchWithRetry);

const response = (status: number) => ({ ok: status >= 200 && status < 300, status }) as Response;

function renderPage() {
  return render(
    <ToastProvider>
      <PanicPage />
    </ToastProvider>
  );
}

function mockLocation(latitude = 40.7, longitude = -74) {
  Object.defineProperty(navigator, "geolocation", {
    configurable: true,
    value: {
      getCurrentPosition: (resolve: PositionCallback) =>
        resolve({ coords: { latitude, longitude } } as GeolocationPosition),
    },
  });
}

function mockLocationDenied() {
  Object.defineProperty(navigator, "geolocation", {
    configurable: true,
    value: {
      getCurrentPosition: (_: PositionCallback, reject: PositionErrorCallback) =>
        reject({ code: 1 } as GeolocationPositionError),
    },
  });
}

const panicButton = () => screen.getByRole("button", { name: /panic/i });

beforeEach(() => {
  vi.clearAllMocks();
  mockUseSession.mockReturnValue(sessionFor("USER"));
  mockLocation();
});

afterEach(() => {
  cleanup();
});

describe("PanicPage", () => {
  it("disables the panic button while the session is loading", () => {
    mockUseSession.mockReturnValue(loadingSession);
    renderPage();
    expect(panicButton()).toBeDisabled();
  });

  it("asks a logged-out user to log in and sends nothing", async () => {
    mockUseSession.mockReturnValue(unauthenticatedSession);
    renderPage();

    fireEvent.click(panicButton());

    expect(await screen.findByText("Please log in before triggering an alert.")).toBeInTheDocument();
    expect(mockFetchWithRetry).not.toHaveBeenCalled();
  });

  it("sends only lat and lng, never a userId or email", async () => {
    mockFetchWithRetry.mockResolvedValueOnce(response(200));
    renderPage();

    fireEvent.click(panicButton());

    await waitFor(() => expect(mockFetchWithRetry).toHaveBeenCalled());
    const [url, init] = mockFetchWithRetry.mock.calls[0];
    expect(url).toBe("/api/panic/trigger");
    expect(JSON.parse(init!.body as string)).toEqual({ lat: 40.7, lng: -74 });
  });

  it("still sends the alert when location is denied", async () => {
    mockLocationDenied();
    mockFetchWithRetry.mockResolvedValueOnce(response(200));
    renderPage();

    fireEvent.click(panicButton());

    await waitFor(() => expect(mockFetchWithRetry).toHaveBeenCalled());
    const [, init] = mockFetchWithRetry.mock.calls[0];
    expect(JSON.parse(init!.body as string)).toEqual({});
  });

  it("shows the triggered state after a successful alert", async () => {
    mockFetchWithRetry.mockResolvedValueOnce(response(200));
    renderPage();

    fireEvent.click(panicButton());

    expect(await screen.findByText("Alert sent to your emergency contacts.")).toBeInTheDocument();
    expect(screen.getByText("Alert triggered.")).toBeInTheDocument();
  });

  it("tells the user to log in again on a 401", async () => {
    mockFetchWithRetry.mockResolvedValueOnce(response(401));
    renderPage();

    fireEvent.click(panicButton());

    expect(await screen.findByText("Your session expired. Log in again, then try again.")).toBeInTheDocument();
    expect(screen.getByText("You are safe.")).toBeInTheDocument();
  });

  it("tells the user to text their contact when the alert fails", async () => {
    mockFetchWithRetry.mockResolvedValueOnce(response(503));
    renderPage();

    fireEvent.click(panicButton());

    expect(
      await screen.findByText("Could not send alert. Text your emergency contact directly.")
    ).toBeInTheDocument();
  });

  it("shows the same fallback when every try failed to connect", async () => {
    mockFetchWithRetry.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    renderPage();

    fireEvent.click(panicButton());

    expect(
      await screen.findByText("Could not send alert. Text your emergency contact directly.")
    ).toBeInTheDocument();
  });

  it("sends the all-clear with no body", async () => {
    mockFetchWithRetry.mockResolvedValueOnce(response(200)).mockResolvedValueOnce(response(200));
    renderPage();

    fireEvent.click(panicButton());
    fireEvent.click(await screen.findByRole("button", { name: "I am safe now" }));

    expect(await screen.findByText("Glad you're safe.")).toBeInTheDocument();
    expect(mockFetchWithRetry).toHaveBeenLastCalledWith("/api/panic/safe", { method: "POST" });
  });
});
