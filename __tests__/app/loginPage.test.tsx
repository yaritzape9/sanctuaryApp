import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { signIn } from "next-auth/react";
import { ToastProvider } from "@/context/ToastContext";
import { BACKEND_UNAVAILABLE_CODE } from "@/lib/authErrors";

const { mockPush } = vi.hoisted(() => ({ mockPush: vi.fn() }));

vi.mock("next-auth/react", () => ({ signIn: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mockPush }) }));
import LoginPage from "@/app/login/page";

const mockSignIn = vi.mocked(signIn);

function submit() {
  const { container } = render(
    <ToastProvider>
      <LoginPage />
    </ToastProvider>
  );
  fireEvent.submit(container.querySelector("form")!);
}

beforeEach(() => vi.clearAllMocks());
afterEach(cleanup);

describe("LoginPage errors", () => {
  it("says the password is wrong when the credentials are refused", async () => {
    mockSignIn.mockResolvedValueOnce({ error: "CredentialsSignin", code: "credentials" } as never);

    submit();

    expect(await screen.findByText("Invalid email or password.")).toBeInTheDocument();
  });

  it("says the service is unreachable when the backend is down, not that the password is wrong", async () => {
    mockSignIn.mockResolvedValueOnce({
      error: "CredentialsSignin",
      code: BACKEND_UNAVAILABLE_CODE,
    } as never);

    submit();

    expect(await screen.findByText(/can't reach the service/)).toBeInTheDocument();
    expect(screen.queryByText("Invalid email or password.")).not.toBeInTheDocument();
  });

  it("says the service is unreachable when signIn itself throws", async () => {
    mockSignIn.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    submit();

    expect(await screen.findByText(/can't reach the service/)).toBeInTheDocument();
  });

  it("goes home after a successful login", async () => {
    mockSignIn.mockResolvedValueOnce({ error: undefined } as never);

    submit();

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/"));
  });
});
