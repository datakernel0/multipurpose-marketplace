import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

async function resolveAuthor(identifier: string) {
  const decoded = decodeURIComponent(identifier || "").trim()
  if (!decoded) return null

  let author = await prisma.user.findUnique({
    where: { username: decoded },
    select: { id: true },
  })

  if (!author) {
    author = await prisma.user.findUnique({
      where: { id: decoded },
      select: { id: true },
    })
  }

  return author
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { username } = await params

    const author = await resolveAuthor(username)

    if (!author) {
      return NextResponse.json({ error: "Author not found" }, { status: 404 })
    }

    if (author.id === session.user.id) {
      return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 })
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: author.id,
        },
      },
    })

    if (existingFollow) {
      return NextResponse.json({ error: "Already following this author" }, { status: 400 })
    }

    // Create follow relationship
    await prisma.follow.create({
      data: {
        followerId: session.user.id,
        followingId: author.id,
      },
    })

    return NextResponse.json({ success: true, message: "Successfully followed author" })
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to follow author" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { username } = await params

    const author = await resolveAuthor(username)

    if (!author) {
      return NextResponse.json({ error: "Author not found" }, { status: 404 })
    }

    // Delete follow relationship
    await prisma.follow.deleteMany({
      where: {
        followerId: session.user.id,
        followingId: author.id,
      },
    })

    return NextResponse.json({ success: true, message: "Successfully unfollowed author" })
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to unfollow author" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ isFollowing: false })
    }

    const { username } = await params

    const author = await resolveAuthor(username)

    if (!author) {
      return NextResponse.json({ isFollowing: false })
    }

    // Check if following
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: author.id,
        },
      },
    })

    return NextResponse.json({ isFollowing: !!follow })
  } catch (error: any) {
    return NextResponse.json({ isFollowing: false })
  }
}

