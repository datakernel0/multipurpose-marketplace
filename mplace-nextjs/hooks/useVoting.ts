"use client"

import { useState } from "react"

/**
 * Hook to replace jQuery voting functionality
 * Manages upvote/downvote state
 */
export function useVoting(initialVote?: "up" | "down" | null) {
  const [vote, setVote] = useState<"up" | "down" | null>(initialVote || null)

  const handleUpvote = () => {
    setVote((prev) => (prev === "up" ? null : "up"))
  }

  const handleDownvote = () => {
    setVote((prev) => (prev === "down" ? null : "down"))
  }

  return {
    vote,
    handleUpvote,
    handleDownvote,
    isUpvoted: vote === "up",
    isDownvoted: vote === "down",
  }
}

