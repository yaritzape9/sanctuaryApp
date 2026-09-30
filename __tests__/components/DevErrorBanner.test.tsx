import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { useSession } from "next-auth/react";
import { DevErrorProvider, useDevError } from "@/context/DevErrorContext";
import DevErrorBanner from "@/components/DevErrorBanner";
import { sessionFor } from "../utils/mockAuth";

vi.mock("next-auth/react", () => ({ useSession: vi.fn() }));
const mockUseSession = vi.mocked(useSession);

// Tiny helper so the test can trigger an error the same way real fetches will.
function Reporter() {
  const { reportError } = useDevError();
  return (
    <button onClick={() => reportError("/api/sightings", "Network down")}>
      report
    </button>
  );
}

function renderBanner() {
  return render(
    <DevErrorProvider>
      <DevErrorBanner />
      <Reporter />
    </DevErrorProvider>
  );
}

describe("DevErrorBanner", () => {
  beforeEach(() => {
    mockUseSession.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders nothing when there is no error", () => {
    mockUseSession.mockReturnValue(sessionFor("DEV"));
    renderBanner();

    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("never renders for a non-DEV user, even after an error is reported", () => {
    mockUseSession.mockReturnValue(sessionFor("USER"));
    renderBanner();

    fireEvent.click(screen.getByText("report"));

    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.queryByText("Network down")).toBeNull();
  });

  it("shows the DEV MODE label, endpoint, and message for a DEV user", () => {
    mockUseSession.mockReturnValue(sessionFor("DEV"));
    renderBanner();

    fireEvent.click(screen.getByText("report"));

    const banner = screen.getByRole("alert");
    expect(banner.textContent).toContain("DEV MODE ON");
    expect(banner.textContent).toContain("/api/sightings");
    expect(banner.textContent).toContain("Network down");
  });

  it("hides the banner when the dismiss button is clicked", () => {
    mockUseSession.mockReturnValue(sessionFor("DEV"));
    renderBanner();

    fireEvent.click(screen.getByText("report"));
    fireEvent.click(screen.getByLabelText("Dismiss dev error"));

    expect(screen.queryByRole("alert")).toBeNull();
  });
});