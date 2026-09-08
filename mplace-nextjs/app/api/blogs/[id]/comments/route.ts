import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    const body = await request.json()

    const { name, email, content, parentId } = body

    if (!name || !email || !content) {
      return NextResponse.json(
        { error: "Name, email, and content are required" },
        { status: 400 }
      )
    }

    // Find blog by slug or ID
    const blog = await prisma.blog.findFirst({
      where: {
        OR: [
          { id },
          { slug: id },
        ],
      },
    })

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }

    // Create comment
    const comment = await prisma.blogComment.create({
      data: {
        blogId: blog.id,
        userId: session?.user?.id || null,
        name,
        email,
        content,
        parentId: parentId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    // Update blog comment count
    await prisma.blog.update({
      where: { id: blog.id },
      data: {
        commentCount: {
          increment: 1,
        },
      },
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Find blog by slug or ID
    const blog = await prisma.blog.findFirst({
      where: {
        OR: [
          { id },
          { slug: id },
        ],
      },
    })

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }

    // Get all comments for this blog (only top-level, replies are included via relation)
    const comments = await prisma.blogComment.findMany({
      where: {
        blogId: blog.id,
        parentId: null, // Only top-level comments
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ comments })
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    )
  }
}

