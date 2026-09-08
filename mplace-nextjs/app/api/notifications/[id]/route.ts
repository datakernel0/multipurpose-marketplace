import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { params } = context
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: "Notification id is required" }, { status: 400 })
    }

    const result = await prisma.notification.deleteMany({
      where: { id, userId: session.user.id },
    })

    if (result.count === 0) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    const unreadCount = await prisma.notification.count({ where: { userId: session.user.id, read: false } })

    return NextResponse.json({ success: true, unreadCount })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 })
  }
}
