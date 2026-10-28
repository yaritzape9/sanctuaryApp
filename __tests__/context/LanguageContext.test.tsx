import { describe, it, expect, vi, afterEach } from "vitest";
import { render, renderHook, screen, cleanup, fireEvent, act } from "@testing-library/react";
import { LanguageProvider, useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations/knowYourRights";
import Footer from "@/components/Footer";
import KnowYourRightsPage from "@/app/know-your-rights/page";

vi.mock("next/navigation", () => ({ usePathname: () => "/know-your-rights" }));

const pageTitle = () => screen.getByRole("heading", { level: 1 });

describe("LanguageContext", () => {
  afterEach(() => {
    cleanup();
  });

  it("starts in English", () => {
    const { result } = renderHook(() => useLanguage(), { wrapper: LanguageProvider });
    expect(result.current.lang).toBe("en");
  });

  it("updates the language when setLang is called", () => {
    const { result } = renderHook(() => useLanguage(), { wrapper: LanguageProvider });

    act(() => result.current.setLang("es"));

    expect(result.current.lang).toBe("es");
  });

  it("throws when used outside LanguageProvider, instead of silently doing nothing", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useLanguage())).toThrow(
      "useLanguage must be used inside <LanguageProvider>"
    );
  });

  it("the Footer switcher changes the Know Your Rights page language", () => {
    render(
      <LanguageProvider>
        <KnowYourRightsPage />
        <Footer />
      </LanguageProvider>
    );
    expect(pageTitle()).toHaveTextContent(translations.en.title);

    fireEvent.click(screen.getByRole("button", { name: "ES" }));

    expect(pageTitle()).toHaveTextContent(translations.es.title);
  });

  it("the Know Your Rights picker changes the Footer's selected language", () => {
    render(
      <LanguageProvider>
        <KnowYourRightsPage />
        <Footer />
      </LanguageProvider>
    );

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "ar" } });

    expect(screen.getByRole("button", { name: "ع" })).toHaveClass("bg-white");
    expect(screen.getByRole("button", { name: "EN" })).not.toHaveClass("bg-white");
  });
});
