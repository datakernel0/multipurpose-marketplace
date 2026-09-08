import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { getIO } from "@/lib/socket"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { receiverId, content, attachments } = body

    const rawContent = typeof content === "string" ? content : ""
    const sanitizedContent = rawContent.trim()
    const attachmentInputs = Array.isArray(attachments) ? attachments : []

    if (!receiverId || (sanitizedContent.length === 0 && attachmentInputs.length === 0)) {
      return NextResponse.json(
        { error: "A message or attachment is required" },
        { status: 400 }
      )
    }

    if (receiverId === session.user.id) {
      return NextResponse.json({ error: "Cannot send message to yourself" }, { status: 400 })
    }

    const [receiver, senderUser] = await Promise.all([
      prisma.user.findUnique({
        where: { id: receiverId },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          image: true,
        },
      }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          image: true,
        },
      }),
    ])

    if (!receiver) {
      return NextResponse.json({ error: "Receiver not found" }, { status: 404 })
    }

    // Find or create chat between users
    // Ensure user1Id < user2Id for consistency (Chat model has unique constraint on [user1Id, user2Id])
    const userIds = [session.user.id, receiverId].sort()
    
    // Try to find existing chat (check both possible orderings)
    let chat = await prisma.chat.findFirst({
      where: {
        OR: [
          {
            user1Id: userIds[0],
            user2Id: userIds[1],
          },
          {
            user1Id: userIds[1],
            user2Id: userIds[0],
          },
        ],
      },
    })

    if (!chat) {
      // Create new chat with sorted IDs
      chat = await prisma.chat.create({
        data: {
          user1Id: userIds[0],
          user2Id: userIds[1],
        },
      })
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        chatId: chat.id,
        senderId: session.user.id,
        receiverId: receiverId,
        content: sanitizedContent,
      },
    })

    const attachmentPayload = attachmentInputs
      .map((attachment: any) => ({
        fileUrl: typeof attachment?.url === "string" ? attachment.url : null,
        fileName: typeof attachment?.fileName === "string" ? attachment.fileName : null,
        mimeType: typeof attachment?.mimeType === "string" ? attachment.mimeType : "application/octet-stream",
        fileSize: Number.isInteger(attachment?.fileSize) ? attachment.fileSize : null,
      }))
      .filter((item) => item.fileUrl && item.fileName && typeof item.fileSize === "number")

    let createdAttachments: Array<{
      id: string
      fileUrl: string
      fileName: string
      mimeType: string
      fileSize: number
      createdAt: Date
    }> = []

    if (attachmentPayload.length > 0) {
      createdAttachments = await prisma.$transaction(async (tx) => {
        await tx.messageAttachment.createMany({
          data: attachmentPayload.map((attachment) => ({
            messageId: message.id,
            fileUrl: attachment.fileUrl!,
            fileName: attachment.fileName!,
            mimeType: attachment.mimeType!,
            fileSize: attachment.fileSize!,
          })),
        })

        return tx.messageAttachment.findMany({
          where: { messageId: message.id },
          orderBy: { createdAt: "asc" },
        })
      })
    }

    await prisma.chat.update({
      where: { id: chat.id },
      data: { updatedAt: new Date() },
    })

    // Create notification for receiver
    await prisma.notification.create({
      data: {
        userId: receiverId,
        title: "New Message",
        message: `You have a new message from ${session.user.name || "Someone"}`,
        type: "message",
        link: `/message?chat=${chat.id}`,
      },
    })

    const attachmentResponse = createdAttachments.map((attachment) => ({
      id: attachment.id,
      fileUrl: attachment.fileUrl,
      fileName: attachment.fileName,
      mimeType: attachment.mimeType,
      fileSize: attachment.fileSize,
      createdAt: attachment.createdAt.toISOString(),
    }))

    const messagePayload = {
      chatId: chat.id,
      message: {
        id: message.id,
        content: message.content,
        createdAt: message.createdAt.toISOString(),
        senderId: message.senderId,
        receiverId: message.receiverId,
        attachments: attachmentResponse,
      },
      sender: {
        id: senderUser?.id || session.user.id,
        name: senderUser?.name ?? session.user.name ?? null,
        username: senderUser?.username ?? null,
        email: senderUser?.email ?? session.user.email ?? null,
        image: senderUser?.image ?? session.user.image ?? null,
      },
      receiver: {
        id: receiver.id,
        name: receiver.name,
        username: receiver.username,
        email: receiver.email,
        image: receiver.image,
      },
    }

    const io = getIO()
    if (io) {
      const rooms = new Set([
        `chat:${chat.id}`,
        `user:${receiverId}`,
        `user:${session.user.id}`,
      ])

      rooms.forEach((room) => {
        io.to(room).emit("message:new", messagePayload)
      })
    }

    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        chatId: chat.id,
        content: message.content,
        createdAt: message.createdAt,
        senderId: message.senderId,
        receiverId: message.receiverId,
        attachments: createdAttachments,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}

