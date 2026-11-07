import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { signIn, useSession } from "next-auth/react";
import { ToastProvider } from "@/context/ToastContext";
import { DevErrorProvider } from "@/context/DevErrorContext";
import { sessionFor } from "../utils/mockAuth";

const { mockPush } = vi.hoisted(() => ({ mockPush: vi.fn() }));

vi.mock("next-auth/react", () => ({ useSession: vi.fn(), signIn: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mockPush }) }));
import SignupPage from "@/app/signup/page";

const mockSignIn = vi.mocked(signIn);
const mockFetch = vi.fn();
const PASSWORD = "long-enough-password";

function submit({ password = PASSWORD, confirm = PASSWORD } = {}) {
  render(
    <DevErrorProvider>
      <ToastProvider>
        <SignupPage />
      </ToastProvider>
    </DevErrorProvider>
  );
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "new@example.com" } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: password } });
  fireEvent.change(screen.getByLabelText("Confirm password"), { target: { value: confirm } });
  fireEvent.click(screen.getByRole("button", { name: "Create account" }));
}

const respond = (status: number, body: unknown) =>
  mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(body), { status }));

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", mockFetch);
  vi.mocked(useSession).mockReturnValue(sessionFor("USER"));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("SignupPage", () => {
  it("doesn't ask for a name, phone number or language", () => {
    render(
      <DevErrorProvider>
        <ToastProvider>
          <SignupPage />
        </ToastProvider>
      </DevErrorProvider>
    );

    expect(screen.queryByLabelText("Full name")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Phone number")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Preferred language")).not.toBeInTheDocument();
  });

  it("requires 12 to 72 characters in the password field", () => {
    render(
      <DevErrorProvider>
        <ToastProvider>
          <SignupPage />
        </ToastProvider>
      </DevErrorProvider>
    );

    const password = screen.getByLabelText("Password");
    expect(password).toHaveAttribute("minLength", "12");
    expect(password).toHaveAttribute("maxLength", "72");
  });

  it("stops before any request when the passwords don't match", async () => {
    submit({ confirm: "a-different-password" });

    expect(await screen.findByText("Passwords don't match.")).toBeInTheDocument();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("sends only email and password, once, then signs in and goes home", async () => {
    respond(201, { success: true });
    mockSignIn.mockResolvedValueOnce({ error: undefined } as never);

    submit();

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/"));
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe("/api/auth/register");
    expect(JSON.parse(init.body)).toEqual({ email: "new@example.com", password: PASSWORD });
    expect(mockSignIn).toHaveBeenCalledWith("credentials", {
      email: "new@example.com",
      password: PASSWORD,
      redirect: false,
    });
    expect(await screen.findByText("Account created successfully!")).toBeInTheDocument();
  });

  it("shows the proxy's message for a duplicate email and stays on the page", async () => {
    respond(409, { error: "An account with this email already exists." });

    submit();

    expect(
      await screen.findByText("An account with this email already exists.")
    ).toBeInTheDocument();
    expect(mockSignIn).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("shows a generic message when the error body isn't JSON", async () => {
    mockFetch.mockResolvedValueOnce(new Response("<html>oops</html>", { status: 500 }));

    submit();

    expect(await screen.findByText("Something went wrong. Please try again.")).toBeInTheDocument();
  });

  it("doesn't retry on a network failure, and says the service is unreachable", async () => {
    mockFetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    submit();

    expect(await screen.findByText(/can't reach the service/)).toBeInTheDocument();
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it("sends the user to log in when the account exists but sign-in is refused", async () => {
    respond(201, { success: true });
    mockSignIn.mockResolvedValueOnce({ error: "CredentialsSignin" } as never);

    submit();

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/login"));
    expect(await screen.findByText("Account created. Please log in.")).toBeInTheDocument();
  });

  it("sends the user to log in when sign-in itself fails after the account is created", async () => {
    respond(201, { success: true });
    mockSignIn.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    submit();

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/login"));
    expect(screen.queryByText(/can't reach the service/)).not.toBeInTheDocument();
  });
});
