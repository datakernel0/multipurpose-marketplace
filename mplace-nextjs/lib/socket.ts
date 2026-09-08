import type { Server as SocketIOServer } from "socket.io"

type GlobalWithSocket = typeof globalThis & {
  __io?: SocketIOServer
}

const globalForSocket = globalThis as GlobalWithSocket

export const setIO = (io: SocketIOServer) => {
  globalForSocket.__io = io
}

export const getIO = (): SocketIOServer | undefined => globalForSocket.__io

