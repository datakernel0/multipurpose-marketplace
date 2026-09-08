"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export default function Preloader() {
  const pathname = usePathname()

  useEffect(() => {
    // The imported overlay can remain above the page in proxied previews.
    // Keep this component for route compatibility, but never block content.
    document.body.classList.remove("preload")
  }, [pathname])

  return null
}

