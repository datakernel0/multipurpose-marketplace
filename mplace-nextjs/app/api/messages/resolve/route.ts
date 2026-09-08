import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { identifier } = await request.json()
    const value = String(identifier || "").trim()

    if (!value) {
      return NextResponse.json({ error: "Recipient identifier is required" }, { status: 400 })
    }

    const lowered = value.toLowerCase()

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: { equals: value, mode: "insensitive" } },
          { email: { equals: value, mode: "insensitive" } },
          { id: value },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        image: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.id === session.user.id) {
      return NextResponse.json({ error: "Cannot send message to yourself" }, { status: 400 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json({ error: "Failed to resolve recipient" }, { status: 500 })
  }
}
