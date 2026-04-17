"use client";

import Link from "next/link";
import { useState } from "react";

const languages = [
  { code: "EN", label: "English" },
  { code: "ES", label: "Español" },
  { code: "ZH", label: "中文" },
  { code: "AR", label: "العربية" },
];

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/know-your-rights", label: "Know Your Rights" },
  { href: "/login", label: "Login" },
  { href: "/signup", label: "Sign Up" },
];

export default function Footer() {
  const [activeLang, setActiveLang] = useState("EN");

  return (
    <footer className="w-full border-t border-white/10 bg-neutral-950 px-6 py-10 text-sm text-neutral-400">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6">

        {/* Brand */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-base font-semibold text-white">🛡️ Sanctuary</span>
          <p className="text-xs text-neutral-500">
            Know your rights. Stay safe. Stay connected.
          </p>
        </div>

        {/* Nav links */}
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {footerLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="transition-colors hover:text-white"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Language switcher */}
        <div className="flex items-center gap-2">
          {languages.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => setActiveLang(code)}
              title={label}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeLang === code
                  ? "bg-white text-black"
                  : "bg-white/10 hover:bg-white/20 text-neutral-300"
              }`}
            >
              {code}
            </button>
          ))}
        </div>

        {/* Copyright */}
        <p className="text-xs text-neutral-600">
          © {new Date().getFullYear()} Sanctuary. Built with care for communities.
        </p>

      </div>
    </footer>
  );
}