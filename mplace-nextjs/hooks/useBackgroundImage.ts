"use client"

import { useEffect, useRef } from "react"

/**
 * Hook to replicate jQuery behavior: set background-image from img src
 * Used for .bg_image_holder elements
 */
export function useBackgroundImage() {
  const holderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!holderRef.current) return

    const holder = holderRef.current
    const img = holder.querySelector("img") as HTMLImageElement

    if (!img) return

    const setBackground = () => {
      if (img.src) {
        holder.style.backgroundImage = `url(${img.src})`
        holder.style.opacity = "1"
        holder.style.backgroundSize = "cover"
        holder.style.backgroundPosition = "center center"
        img.style.display = "none"
      }
    }

    if (img.complete && img.naturalWidth > 0) {
      setBackground()
    } else {
      img.onload = setBackground
      // Fallback in case onload doesn't fire
      setTimeout(setBackground, 100)
    }
  }, [])

  return holderRef
}

/**
 * Hook to set background images for multiple elements
 */
export function useBackgroundImages(selector: string) {
  useEffect(() => {
    const setBackgroundImages = () => {
      const holders = document.querySelectorAll<HTMLElement>(selector)
      holders.forEach((holder) => {
        const img = holder.querySelector("img") as HTMLImageElement
        if (img) {
          const setBackground = () => {
            if (img.src) {
              holder.style.backgroundImage = `url(${img.src})`
              holder.style.opacity = "1"
              holder.style.backgroundSize = "cover"
              holder.style.backgroundPosition = "center center"
              img.style.display = "none"
            }
          }

          if (img.complete && img.naturalWidth > 0) {
            setBackground()
          } else {
            img.onload = setBackground
            setTimeout(setBackground, 100)
          }
        }
      })
    }

    setBackgroundImages()
    const timeout = setTimeout(setBackgroundImages, 100)
    return () => clearTimeout(timeout)
  }, [selector])
}

