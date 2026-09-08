"use client"

import { ErrorBoundary } from './ErrorBoundary'

/**
 * Client-side wrapper for ErrorBoundary
 * This allows ErrorBoundary to be used in server components
 */
export default function ErrorBoundaryWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return <ErrorBoundary>{children}</ErrorBoundary>
}

