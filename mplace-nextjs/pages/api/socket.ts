import type { NextApiRequest } from "next"
import type { NextApiResponse } from "next"
import type { Server as HTTPServer } from "http"
import type { Socket } from "net"
import { Server as SocketIOServer } from "socket.io"

import { setIO } from "@/lib/socket"

type NextApiResponseWithSocket = NextApiResponse & {
  socket: Socket & {
    server: HTTPServer & {
      io?: SocketIOServer
    }
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}

export default function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (!res.socket.server.io) {
    // Get basePath from environment variable
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""
    const cleanBasePath = basePath.replace(/\/$/, "")
    // Socket.io path should include basePath to match client connection
    const socketPath = cleanBasePath ? `${cleanBasePath}/api/socket` : "/api/socket"
    
    const io = new SocketIOServer(res.socket.server, {
      path: socketPath,
      // Allow CORS if needed
      cors: {
        origin: process.env.NEXT_PUBLIC_SITE_URL || "*",
        methods: ["GET", "POST"],
      },
    })

    setIO(io)

    io.on("connection", (socket) => {
      socket.on("user:join", (userId: unknown) => {
        if (typeof userId === "string" && userId.trim()) {
          socket.join(`user:${userId}`)
        }
      })

      socket.on("chat:join", (chatId: unknown) => {
        if (typeof chatId === "string" && chatId.trim()) {
          socket.join(`chat:${chatId}`)
        }
      })

      socket.on("chat:typing", (payload: { chatId?: string; userId?: string; userName?: string | null; isTyping?: boolean }) => {
        if (!payload?.chatId || !payload?.userId) return
        io.to(`chat:${payload.chatId}`).emit("chat:typing", {
          chatId: payload.chatId,
          userId: payload.userId,
          userName: payload.userName ?? null,
          isTyping: Boolean(payload.isTyping),
        })
      })
    })

    res.socket.server.io = io
  }

  res.end()
}

