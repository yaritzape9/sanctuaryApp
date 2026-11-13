import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
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

describe("ProfilePage contacts save", () => {
  const PHONE_ERROR = "Enter a 10-digit US phone number, like (212) 555-0100.";

  async function submitContact(phone: string) {
    mockFetch
      .mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ status: 400, message: "Invalid fields: phone" }), { status: 400 })
      );
    renderPage();

    fireEvent.click(await screen.findByRole("button", { name: "Add your first contact" }));
    fireEvent.change(screen.getByPlaceholderText("Contact 1 name"), { target: { value: "Maria" } });
    fireEvent.change(screen.getByPlaceholderText("(212) 555-0100"), { target: { value: phone } });
    fireEvent.click(screen.getByRole("button", { name: "Save contacts" }));
  }

  it("shows a US phone message under the row when the backend rejects the phone", async () => {
    await submitContact("+44 20 7946 0958");

    expect(await screen.findByRole("alert")).toHaveTextContent(PHONE_ERROR);
    expect(screen.getByPlaceholderText("(212) 555-0100")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("1 contact(s) failed to save.")).toBeInTheDocument();
  });

  it("clears the row's error once the user edits it", async () => {
    await submitContact("12345");
    await screen.findByText(PHONE_ERROR);

    fireEvent.change(screen.getByPlaceholderText("(212) 555-0100"), {
      target: { value: "(212) 555-0100" },
    });

    expect(screen.queryByText(PHONE_ERROR)).not.toBeInTheDocument();
  });
});
