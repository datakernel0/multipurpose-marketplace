"use client"

import { useState, useEffect, useRef } from "react"

/**
 * Hook to replace jQuery mobile menu functionality
 * Handles dropdown toggling for mobile menu items
 */
export function useMobileMenu() {
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set())

  const toggleDropdown = (key: string) => {
    setOpenDropdowns((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(key)) {
        newSet.delete(key)
      } else {
        // Close other dropdowns (accordion behavior)
        newSet.clear()
        newSet.add(key)
      }
      return newSet
    })
  }

  const closeDropdown = (key: string) => {
    setOpenDropdowns((prev) => {
      const newSet = new Set(prev)
      newSet.delete(key)
      return newSet
    })
  }

  const closeAllDropdowns = () => {
    setOpenDropdowns(new Set())
  }

  return {
    openDropdowns,
    toggleDropdown,
    closeDropdown,
    closeAllDropdowns,
    isOpen: (key: string) => openDropdowns.has(key),
  }
}

