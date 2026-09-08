"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export default function Preloader() {
  const [loading, setLoading] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // Show preloader on route change
    setLoading(true)
    setFadeOut(false)
    document.body.classList.add("preload")

    // Replicate jQuery behavior: $(window).load() equivalent
    const handleLoad = () => {
      // Fade out preloader inner first
      setFadeOut(true)
      
      // Then fade out background after delay, matching jQuery .delay('500').fadeOut(1000)
      setTimeout(() => {
        setLoading(false)
        document.body.classList.remove("preload")
      }, 1500) // 500ms delay + 1000ms fade
    }

    // Check if page is already loaded
    if (document.readyState === "complete") {
      // Small delay to show preloader briefly on route change
      setTimeout(handleLoad, 300)
    } else {
      window.addEventListener("load", handleLoad)
      return () => window.removeEventListener("load", handleLoad)
    }
  }, [pathname])

  if (!loading) return null

  return (
    <>
      <div className={`preloader-bg ${fadeOut ? "fade-out" : ""}`}></div>
      <div className={`preloader_inner ${fadeOut ? "fade-out" : ""}`}>
        <div className="preloader_inner_content">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    </>
  )
}

