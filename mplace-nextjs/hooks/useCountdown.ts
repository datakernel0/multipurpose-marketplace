"use client"

import { useState, useEffect } from "react"

interface CountdownDate {
  days: number
  hours: number
  minutes: number
  seconds: number
}

/**
 * Hook to replace jQuery countdown plugin
 * @param targetDate - Target date string in format 'YYYY/MM/DD' or Date object
 * @returns Countdown object with days, hours, minutes, seconds
 */
export function useCountdown(targetDate: string | Date): CountdownDate {
  const [countdown, setCountdown] = useState<CountdownDate>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const target = typeof targetDate === "string" ? new Date(targetDate) : targetDate

    const updateCountdown = () => {
      const now = new Date().getTime()
      const distance = target.getTime() - now

      if (distance < 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      setCountdown({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      })
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [targetDate])

  return countdown
}

