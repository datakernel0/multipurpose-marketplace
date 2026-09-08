import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

function normalizeImage(image: string | null | undefined) {
  if (!image) return null
  if (image.startsWith("http://") || image.startsWith("https://")) return image
  const cleaned = image.replace(/\\/g, "/")
  return cleaned.startsWith("/") ? cleaned : `/${cleaned}`
}

interface MessageWithRelations {
  id: string
  content: string
  createdAt: Date
  senderId: string
  receiverId: string
  read: boolean
  sender: {
    id: string | null
    name: string | null
    username: string | null
    email: string | null
    image: string | null
  }
  attachments: Array<{
    id: string
    fileUrl: string
    fileName: string
    mimeType: string
    fileSize: number
    createdAt: Date
  }>
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { chatId } = await params
    const userId = session.user.id

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            image: true,
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            image: true,
          },
        },
      },
    })

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 })
    }

    if (chat.user1Id !== userId && chat.user2Id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const partner = chat.user1Id === userId ? chat.user2 : chat.user1

    const { searchParams } = new URL(request.url)
    const limitParam = parseInt(searchParams.get("limit") || "50", 10)
    const limit = Math.min(Math.max(limitParam, 1), 200)

    const messageQueryArgs: any = {
      where: { chatId },
      orderBy: { createdAt: "asc" },
      take: limit,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            image: true,
          },
        },
        attachments: {
          select: {
            id: true,
            fileUrl: true,
            fileName: true,
            mimeType: true,
            fileSize: true,
            createdAt: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    }

    const messages = (await prisma.message.findMany(messageQueryArgs)) as unknown as MessageWithRelations[]

    await prisma.message.updateMany({
      where: {
        chatId,
        receiverId: userId,
        read: false,
      },
      data: { read: true },
    })

    return NextResponse.json({
      chatId,
      partner: {
        id: partner.id,
        name: partner.name,
        username: partner.username,
        email: partner.email,
        image: normalizeImage(partner.image),
      },
      messages: messages.map((message) => ({
        id: message.id,
        content: message.content,
        createdAt: message.createdAt,
        senderId: message.senderId,
        receiverId: message.receiverId,
        read: message.read,
        sender: {
          id: message.sender.id,
          name: message.sender.name,
          username: message.sender.username,
          email: message.sender.email,
          image: normalizeImage(message.sender.image),
        },
        attachments: message.attachments.map((attachment) => ({
          id: attachment.id,
          fileUrl: attachment.fileUrl,
          fileName: attachment.fileName,
          mimeType: attachment.mimeType,
          fileSize: attachment.fileSize,
          createdAt: attachment.createdAt,
        })),
      })),
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to load conversation" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { chatId } = await params
    const userId = session.user.id

    const payload = await request.json().catch(() => ({}))
    const action = String(payload?.action || "").toLowerCase()
    const messageId = typeof payload?.messageId === "string" ? payload.messageId : undefined

    if (!action || (action !== "markread" && action !== "markunread")) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      select: {
        id: true,
        user1Id: true,
        user2Id: true,
      },
    })

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 })
    }

    if (chat.user1Id !== userId && chat.user2Id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    let targetMessageId: string | null = null

    if (action === "markread") {
      if (messageId) {
        const message = await prisma.message.findFirst({
          where: {
            id: messageId,
            chatId,
            receiverId: userId,
          },
          select: { id: true, read: true },
        })

        if (!message) {
          return NextResponse.json({ error: "Message not found" }, { status: 404 })
        }

        if (!message.read) {
          await prisma.message.update({
            where: { id: message.id },
            data: { read: true },
          })
        }

        targetMessageId = message.id
      } else {
        await prisma.message.updateMany({
          where: {
            chatId,
            receiverId: userId,
            read: false,
          },
          data: { read: true },
        })
      }
    } else if (action === "markunread") {
      if (messageId) {
        const message = await prisma.message.findFirst({
          where: {
            id: messageId,
            chatId,
            receiverId: userId,
          },
          select: { id: true },
        })

        if (!message) {
          return NextResponse.json({ error: "Message not found" }, { status: 404 })
        }

        await prisma.message.update({
          where: { id: message.id },
          data: { read: false },
        })

        targetMessageId = message.id
      } else {
        const latest = await prisma.message.findFirst({
          where: {
            chatId,
            receiverId: userId,
          },
          orderBy: { createdAt: "desc" },
          select: { id: true },
        })

        if (!latest) {
          return NextResponse.json({ error: "No messages to mark unread" }, { status: 409 })
        }

        await prisma.message.update({
          where: { id: latest.id },
          data: { read: false },
        })

        targetMessageId = latest.id
      }
    }

    const unreadCount = await prisma.message.count({
      where: {
        chatId,
        receiverId: userId,
        read: false,
      },
    })

    return NextResponse.json({
      success: true,
      action,
      chatId,
      messageId: targetMessageId,
      unreadCount,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update chat state" }, { status: 500 })
  }
}
