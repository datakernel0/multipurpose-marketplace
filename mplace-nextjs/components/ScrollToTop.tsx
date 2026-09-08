"use client"

import { useScrollToTop } from "@/hooks/useScrollToTop"
import { FaArrowUp } from "react-icons/fa"

export default function ScrollToTop() {
  const { showScrollTop, scrollToTop } = useScrollToTop()

  if (!showScrollTop) return null

  return (
    <div className="go_top" onClick={scrollToTop} role="button" tabIndex={0}>
      <FaArrowUp />
    </div>
  )
}

