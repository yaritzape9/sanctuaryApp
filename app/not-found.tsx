import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 px-6 text-center">
      
      {/* Icon */}
      <div className="mb-6 text-6xl">🛡️</div>

      {/* Heading */}
      <h1 className="text-7xl font-bold text-white">404</h1>
      <p className="mt-3 text-xl font-semibold text-neutral-300">
        Page not found
      </p>
      <p className="mt-2 max-w-sm text-sm text-neutral-500">
        This page doesn't exist or may have moved. You're still safe — let's
        get you back.
      </p>

      {/* Actions */}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-neutral-200"
        >
          Go Home
        </Link>
        <Link
          href="/know-your-rights"
          className="rounded-full border border-white/20 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          Know Your Rights
        </Link>
      </div>

      {/* Subtle bottom note */}
      <p className="mt-16 text-xs text-neutral-700">
        © {new Date().getFullYear()} Sanctuary
      </p>

    </main>
  );
}