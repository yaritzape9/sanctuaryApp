"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    ref.current.animate(
      [
        { opacity: 0, transform: "translateY(6px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 200, easing: "ease-out", fill: "forwards" }
    )
  }, [pathname])

  return (
    <div ref={ref}>
      {children}
    </div>
  )
}