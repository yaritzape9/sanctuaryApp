import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { vi, describe, it, expect, beforeEach } from "vitest"
import Navbar from "@/components/Navbar"

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}))

const { mockUseSession } = vi.hoisted(() => ({
  mockUseSession: vi.fn(),
}))

vi.mock("next-auth/react", () => ({
  useSession: mockUseSession,
  signOut: vi.fn(),
}))

describe("Navbar", () => {
  beforeEach(() => {
    mockUseSession.mockReset()
  })

  describe("logged out", () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({ data: null, status: "unauthenticated" })
    })

    it("shows public nav links", () => {
      render(<Navbar />)
      expect(screen.getByText("Home")).toBeInTheDocument()
      expect(screen.getByText("Map")).toBeInTheDocument()
      expect(screen.getByText("Know Your Rights")).toBeInTheDocument()
    })

    it("shows Login/Signup and hides Profile/Panic (desktop)", () => {
      render(<Navbar />)
      expect(screen.getByText("Log in")).toBeInTheDocument()
      expect(screen.getByText("Sign up")).toBeInTheDocument()
      expect(screen.queryByText("Profile")).not.toBeInTheDocument()
      expect(screen.queryByText(/Panic/)).not.toBeInTheDocument()
    })

    it("shows Login/Signup and hides Profile in mobile menu", async () => {
      const user = userEvent.setup()
      render(<Navbar />)
      await user.click(screen.getByLabelText("Toggle menu"))
      expect(screen.getAllByText("Sign up").length).toBeGreaterThan(0)
      expect(screen.getAllByText("Log in").length).toBeGreaterThan(0)
      expect(screen.queryByText("Profile")).not.toBeInTheDocument()
    })
  })

  describe("logged in", () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: { user: { id: "1", email: "test@example.com" } },
        status: "authenticated",
      })
    })

    it("shows Profile, Panic, Log out and hides Login/Signup (desktop)", () => {
      render(<Navbar />)
      expect(screen.getByText("Profile")).toBeInTheDocument()
      expect(screen.getByText("🆘 Panic")).toBeInTheDocument()
      expect(screen.getByText("Log out")).toBeInTheDocument()
      expect(screen.queryByText("Sign up")).not.toBeInTheDocument()
    })

    it("shows Profile and Panic Button in mobile menu", async () => {
      const user = userEvent.setup()
      render(<Navbar />)
      await user.click(screen.getByLabelText("Toggle menu"))
      expect(screen.getAllByText("Profile").length).toBeGreaterThan(0)
      expect(screen.getAllByText("🆘 Panic Button").length).toBeGreaterThan(0)
    })
  })
})