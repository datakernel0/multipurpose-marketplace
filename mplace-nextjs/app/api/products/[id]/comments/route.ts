import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

function normalizeMedia(path: string | null | undefined, fallback: string) {
  if (!path) return fallback
  if (path.startsWith("http://") || path.startsWith("https://")) return path
  return path.startsWith("/") ? path : `/${path}`
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: "Product id is required" }, { status: 400 })
    }

    const product = await prisma.product.findUnique({ select: { id: true }, where: { id } })
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const url = new URL(request.url)
    const pageParam = Number(url.searchParams.get("page") || "1")
    const limitParam = Number(url.searchParams.get("limit") || "4")

    const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1
    const pageSize = Number.isFinite(limitParam) && limitParam > 0 && limitParam <= 50 ? Math.floor(limitParam) : 4

    const totalTopLevel = await prisma.comment.count({
      where: { productId: id, parentId: null },
    })

    const totalComments = await prisma.comment.count({
      where: { productId: id },
    })

    const skip = (page - 1) * pageSize

    const comments = await prisma.comment.findMany({
      where: { productId: id, parentId: null },
      orderBy: { createdAt: "asc" },
      skip,
      take: pageSize,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        replies: {
          orderBy: { createdAt: "asc" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
          },
        },
      },
    })

    const formatted = comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      parentId: comment.parentId,
      user: comment.user
        ? {
            id: comment.user.id,
            name: comment.user.name || "Anonymous",
            username: comment.user.username,
            avatar: normalizeMedia(comment.user.image, "/images/m1.png"),
          }
        : {
            id: "anonymous",
            name: "Anonymous",
            username: null,
            avatar: "/images/m1.png",
          },
      replies: comment.replies.map((reply) => ({
        id: reply.id,
        content: reply.content,
        createdAt: reply.createdAt.toISOString(),
        parentId: reply.parentId,
        user: reply.user
          ? {
              id: reply.user.id,
              name: reply.user.name || "Anonymous",
              username: reply.user.username,
              avatar: normalizeMedia(reply.user.image, "/images/m2.png"),
            }
          : {
              id: "anonymous",
              name: "Anonymous",
              username: null,
              avatar: "/images/m2.png",
            },
        replies: [],
      })),
    }))

    return NextResponse.json({
      comments: formatted,
      pagination: {
        page,
        pageSize,
        totalTopLevel,
        totalPages: Math.max(1, Math.ceil(totalTopLevel / pageSize)),
      },
      counts: {
        totalTopLevel,
        total: totalComments,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to load comments" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    if (!body || typeof body.content !== "string" || !body.content.trim()) {
      return NextResponse.json({ error: "Comment content is required" }, { status: 400 })
    }

    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: "Product id is required" }, { status: 400 })
    }

    const product = await prisma.product.findUnique({ select: { id: true }, where: { id } })
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    if (body.parentId) {
      const parent = await prisma.comment.findUnique({
        where: { id: body.parentId },
        select: { id: true, productId: true },
      })
      if (!parent || parent.productId !== id) {
        return NextResponse.json({ error: "Invalid parent comment" }, { status: 400 })
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content: body.content.trim(),
        parentId: body.parentId ?? null,
        productId: id,
        userId: session.user.id,
      },
      include: {
        user: {
          select: { id: true, name: true, username: true, image: true },
        },
      },
    })

    const topLevelCountPromise = prisma.comment.count({ where: { productId: id, parentId: null } })
    const totalCountPromise = prisma.comment.count({ where: { productId: id } })

    const [topLevelCount, totalCount] = await Promise.all([topLevelCountPromise, totalCountPromise])

    return NextResponse.json({
      comment: {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        user: comment.user
          ? {
              id: comment.user.id,
              name: comment.user.name || "Anonymous",
              username: comment.user.username,
              avatar: normalizeMedia(comment.user.image, "/images/m1.png"),
            }
          : {
              id: "anonymous",
              name: "Anonymous",
              username: null,
              avatar: "/images/m1.png",
            },
        parentId: comment.parentId,
      },
      counts: {
        totalTopLevel: topLevelCount,
        total: totalCount,
      },
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 })
  }
}
