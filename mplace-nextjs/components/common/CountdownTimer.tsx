"use client"

import { useCountdown } from "@/hooks/useCountdown"

interface CountdownTimerProps {
  targetDate: string | Date
  className?: string
}

export default function CountdownTimer({ targetDate, className = "" }: CountdownTimerProps) {
  const { days, hours, minutes, seconds } = useCountdown(targetDate)

  return (
    <ul className={`countdown ${className}`}>
      <li>
        {days}
        <span>days</span>
      </li>
      <li>
        {hours}
        <span>hours</span>
      </li>
      <li>
        {minutes}
        <span>minutes</span>
      </li>
      <li>
        {seconds}
        <span>seconds</span>
      </li>
    </ul>
  )
}

