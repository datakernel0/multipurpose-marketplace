"use client"

import { useState, useEffect, useRef } from "react"

interface UseCounterOptions {
  delay?: number
  time?: number
  endValue: number
  enabled?: boolean
}

export function useCounter({ delay = 10, time = 1500, endValue, enabled = true }: UseCounterOptions) {
  const [count, setCount] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!enabled) {
      return
    }

    const increment = endValue / (time / delay)
    let current = 0

    intervalRef.current = setInterval(() => {
      current += increment
      if (current >= endValue) {
        setCount(endValue)
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      } else {
        setCount(Math.floor(current))
      }
    }, delay)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [endValue, delay, time, enabled])

  return count
}

