"use client"

import { useState } from "react"

/**
 * Hook to replace jQuery reply comment functionality
 * Manages reply form visibility
 */
export function useReplyComment() {
  const [openReplyForms, setOpenReplyForms] = useState<Set<string>>(new Set())

  const toggleReplyForm = (commentId: string) => {
    setOpenReplyForms((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(commentId)) {
        newSet.delete(commentId)
      } else {
        newSet.add(commentId)
      }
      return newSet
    })
  }

  const isReplyFormOpen = (commentId: string) => {
    return openReplyForms.has(commentId)
  }

  return {
    toggleReplyForm,
    isReplyFormOpen,
  }
}

