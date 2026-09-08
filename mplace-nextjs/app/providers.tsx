"use client"

import { SessionProvider } from "next-auth/react"
import { useEffect, useState } from "react"

export function Providers({ children }: { children: React.ReactNode }) {
  const [apiBasePath, setApiBasePath] = useState("/api/auth")

  useEffect(() => {
    // Detect basePath from window location or environment variable
    let basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""
    
    // If not set in env, try to detect from current pathname
    if (!basePath && typeof window !== "undefined") {
      const pathname = window.location.pathname
      // Check if pathname starts with a basePath pattern (e.g., /martplace-nextjs)
      const segments = pathname.split("/").filter(Boolean)
      if (segments.length > 0) {
        const firstSegment = segments[0]
        // Common basePath patterns (not routes)
        if (
          firstSegment.startsWith("martplace") ||
          (firstSegment !== "admin" &&
            firstSegment !== "dashboard" &&
            firstSegment !== "api" &&
            firstSegment !== "auth" &&
            firstSegment !== "login" &&
            firstSegment !== "register" &&
            firstSegment !== "single-product" &&
            firstSegment !== "single-blog" &&
            firstSegment !== "all-products" &&
            firstSegment !== "blog" &&
            firstSegment !== "search-product")
        ) {
          basePath = `/${firstSegment}`
        }
      }
    }

    // Set the API base path
    const apiPath = basePath ? `${basePath}/api/auth` : "/api/auth"
    setApiBasePath(apiPath)
  }, [])

  return (
    <SessionProvider
      basePath={apiBasePath}
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      {children}
    </SessionProvider>
  )
}

