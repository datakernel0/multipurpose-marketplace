"use client"

import { useState, useEffect } from "react"

export function useScrollToTop() {
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const distanceFromTop = window.pageYOffset || document.documentElement.scrollTop
      setShowScrollTop(distanceFromTop > 117)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return { showScrollTop, scrollToTop }
}

