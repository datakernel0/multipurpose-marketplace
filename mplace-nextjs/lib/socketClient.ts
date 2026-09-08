"use client"

import { io, type Socket } from "socket.io-client"
import { getApiUrl } from "@/utils/paths"

type GlobalWithSocket = typeof globalThis & {
  __messageSocket?: Socket
}

// Get socket path with basePath included
const getSocketPath = (): string => {
  return getApiUrl("/api/socket")
}

export const getSocket = (): Socket => {
  const globalForSocket = globalThis as GlobalWithSocket

  if (!globalForSocket.__messageSocket) {
    const socketPath = getSocketPath()
    globalForSocket.__messageSocket = io({
      path: socketPath,
    })
  }

  return globalForSocket.__messageSocket
}

