import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

function normalizeImage(image: string | null | undefined) {
  if (!image) return null
  if (image.startsWith("http://") || image.startsWith("https://")) return image
  const cleaned = image.replace(/\\/g, "/")
  return cleaned.startsWith("/") ? cleaned : `/${cleaned}`
}

// Type definitions for chat data structures
interface ChatRaw {
  id: string
  user1Id: string | null
  user2Id: string | null
  updatedAt: Date
  messages: Array<{
    id: string
    content: string
    createdAt: Date
    senderId: string
    receiverId: string
    read: boolean
    attachments: Array<{ id: string }>
  }>
}

interface ChatUser {
  id: string
  name: string | null
  username: string | null
  email: string
  image: string | null
}

interface ChatWithUsers extends ChatRaw {
  user1: ChatUser | null
  user2: ChatUser | null
}

/**
 * Formats a chat object with partner information and last message
 * @param chat - Chat object with user information
 * @param currentUserId - ID of the current user
 * @param unreadMap - Map of chat IDs to unread message counts
 * @returns Formatted chat object
 */
async function formatChat(chat: ChatWithUsers, currentUserId: string, unreadMap: Map<string, number>) {
  const partner = chat.user1Id === currentUserId ? chat.user2 : chat.user1
  const last = chat.messages?.[0] ?? null
  
  // Ensure partner exists (should be guaranteed by filter, but TypeScript needs this check)
  if (!partner) {
    throw new Error("Chat partner not found")
  }
  
  return {
    id: chat.id,
    partner: {
      id: partner.id,
      name: partner.name,
      username: partner.username,
      email: partner.email,
      image: normalizeImage(partner.image),
    },
    lastMessage: last
      ? {
          id: last.id,
          content: last.content,
          createdAt: last.createdAt,
          senderId: last.senderId,
          receiverId: last.receiverId,
          read: last.read,
          attachmentsCount: Array.isArray(last.attachments) ? last.attachments.length : 0,
        }
      : null,
    unreadCount: unreadMap.get(chat.id) ?? 0,
    updatedAt: chat.updatedAt,
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const { searchParams } = new URL(request.url)
    const limitParam = parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT), 10)
    const limit = Math.min(Math.max(limitParam, 1), MAX_LIMIT)
    const term = (searchParams.get("q") || "").trim().toLowerCase()

    // Fetch chats using select to avoid Prisma relation enforcement issues with broken foreign keys
    const chatsRaw = await prisma.chat.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      orderBy: { updatedAt: "desc" },
      take: limit,
      select: {
        id: true,
        user1Id: true,
        user2Id: true,
        updatedAt: true,
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            content: true,
            createdAt: true,
            senderId: true,
            receiverId: true,
            read: true,
            attachments: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    })

    // Manually fetch users for valid user1Id and user2Id to handle broken foreign keys gracefully
    const userIds = [...new Set(chatsRaw.flatMap((chat: ChatRaw) => [chat.user1Id, chat.user2Id]).filter(Boolean) as string[])]
    const users = userIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            image: true,
          },
        })
      : []
    const userMap = new Map<string, ChatUser>(users.map((u) => [u.id, u as ChatUser]))

    // Attach users to chats (null for invalid userIds) and filter out chats with invalid users
    const chats: ChatWithUsers[] = chatsRaw
      .map((chat: ChatRaw) => ({
        ...chat,
        user1: chat.user1Id ? userMap.get(chat.user1Id) || null : null,
        user2: chat.user2Id ? userMap.get(chat.user2Id) || null : null,
      }))
      .filter((chat: ChatWithUsers) => chat.user1 !== null && chat.user2 !== null)

    const chatIds = chats.map((chat) => chat.id)
    const unreadCounts = chatIds.length
      ? await prisma.message.groupBy({
          by: ["chatId"],
          where: {
            chatId: { in: chatIds },
            receiverId: userId,
            read: false,
          },
          _count: { _all: true },
        })
      : []
    const unreadMap = new Map(unreadCounts.map((item) => [item.chatId, item._count._all]))

    let formatted = await Promise.all(chats.map((chat) => formatChat(chat, userId, unreadMap)))

    if (term) {
      formatted = formatted.filter((chat) => {
        const partnerName = chat.partner.name?.toLowerCase() || ""
        const partnerUsername = chat.partner.username?.toLowerCase() || ""
        const preview = chat.lastMessage?.content?.toLowerCase() || ""
        return partnerName.includes(term) || partnerUsername.includes(term) || preview.includes(term)
      })
    }

    const unreadTotal = formatted.reduce((sum, chat) => sum + chat.unreadCount, 0)

    return NextResponse.json({ chats: formatted, unreadTotal })
  } catch (error) {
    return NextResponse.json({ error: "Failed to load chats" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { partnerId } = await request.json()
    const partner = String(partnerId || "").trim()

    if (!partner) {
      return NextResponse.json({ error: "partnerId is required" }, { status: 400 })
    }

    if (partner === session.user.id) {
      return NextResponse.json({ error: "Cannot start chat with yourself" }, { status: 400 })
    }

    const partnerExists = await prisma.user.findUnique({
      where: { id: partner },
      select: { id: true },
    })

    if (!partnerExists) {
      return NextResponse.json({ error: "Recipient not found" }, { status: 404 })
    }

    const sorted = [session.user.id, partner].sort()

    let chatRaw = await prisma.chat.findFirst({
      where: {
        OR: [
          { user1Id: sorted[0], user2Id: sorted[1] },
          { user1Id: sorted[1], user2Id: sorted[0] },
        ],
      },
      select: {
        id: true,
        user1Id: true,
        user2Id: true,
        updatedAt: true,
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            content: true,
            createdAt: true,
            senderId: true,
            receiverId: true,
            read: true,
            attachments: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    })

    if (!chatRaw) {
      chatRaw = await prisma.chat.create({
        data: {
          user1Id: sorted[0],
          user2Id: sorted[1],
        },
        select: {
          id: true,
          user1Id: true,
          user2Id: true,
          updatedAt: true,
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              id: true,
              content: true,
              createdAt: true,
              senderId: true,
              receiverId: true,
              read: true,
              attachments: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      })
    }

    // Manually fetch users for the chat
    const chatUserIds = [chatRaw.user1Id, chatRaw.user2Id].filter(Boolean)
    const chatUsers = chatUserIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: chatUserIds } },
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            image: true,
          },
        })
      : []
    const chatUserMap = new Map<string, ChatUser>(chatUsers.map((u) => [u.id, u as ChatUser]))

    const chat = {
      ...chatRaw,
      user1: chatRaw.user1Id ? chatUserMap.get(chatRaw.user1Id) || null : null,
      user2: chatRaw.user2Id ? chatUserMap.get(chatRaw.user2Id) || null : null,
    }

    if (!chat.user1 || !chat.user2) {
      return NextResponse.json({ error: "Chat users not found" }, { status: 404 })
    }

    const formatted = await formatChat(chat, session.user.id, new Map())

    return NextResponse.json({ chat: formatted })
  } catch (error) {
    return NextResponse.json({ error: "Failed to start chat" }, { status: 500 })
  }
}
