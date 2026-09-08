"use client"

import { useState } from "react"

/**
 * Hook to replace jQuery starring functionality
 * Manages favorite/star state
 */
export function useStarring(initialState: boolean = false) {
  const [isStarred, setIsStarred] = useState(initialState)

  const toggleStar = () => {
    setIsStarred((prev) => !prev)
  }

  return {
    isStarred,
    toggleStar,
    setStarred: setIsStarred,
  }
}

