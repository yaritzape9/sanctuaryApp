import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { useSession } from "next-auth/react";
import { ToastProvider } from "@/context/ToastContext";
import { sessionFor } from "../utils/mockAuth";

vi.mock("next-auth/react", () => ({ useSession: vi.fn() }));
import ProfilePage from "@/app/profile/page";

const mockUseSession = vi.mocked(useSession);
const mockFetch = vi.fn();

function renderPage() {
  return render(
    <ToastProvider>
      <ProfilePage />
    </ToastProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", mockFetch);
  mockUseSession.mockReturnValue(sessionFor("USER"));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("ProfilePage contacts load", () => {
  it("shows an error toast when the contacts request fails", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Unable to load contacts" }), { status: 500 })
    );
    renderPage();

    expect(await screen.findByText("Failed to load contacts.")).toBeInTheDocument();
  });

  it("shows no error toast when the contacts request succeeds", async () => {
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200 }));
    renderPage();

    await vi.waitFor(() => expect(mockFetch).toHaveBeenCalledWith("/api/contacts", undefined));
    expect(screen.queryByText("Failed to load contacts.")).not.toBeInTheDocument();
  });
});
