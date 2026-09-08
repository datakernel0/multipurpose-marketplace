"use server"

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

async function ensureAuthenticated() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED")
  }
  return session.user.id
}

async function getProductOrThrow(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      status: true,
      moderationStatus: true,
    },
  })

  if (!product) {
    throw new Error("NOT_FOUND")
  }

  if (product.status !== "PUBLISHED" || product.moderationStatus !== "APPROVED") {
    throw new Error("FORBIDDEN")
  }

  return product
}

async function getFavoriteCount(productId: string) {
  return prisma.favorite.count({
    where: { productId },
  })
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const userId = await ensureAuthenticated()
    const { productId } = await params
    await getProductOrThrow(productId)

    try {
      await prisma.favorite.create({
        data: {
          userId,
          productId,
        },
      })
    } catch (error: any) {
      if (error?.code !== "P2002") {
        throw error
      }
      // Ignore unique constraint violations (already favorited)
    }

    const favoriteCount = await getFavoriteCount(productId)

    return NextResponse.json({
      success: true,
      favorited: true,
      favoriteCount,
    })
  } catch (error: any) {
    if (error?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (error?.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }
    if (error?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Product cannot be favorited" }, { status: 403 })
    }

    return NextResponse.json({ error: "Failed to favorite product" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const userId = await ensureAuthenticated()
    const { productId } = await params
    await getProductOrThrow(productId)

    try {
      await prisma.favorite.delete({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
      })
    } catch (error: any) {
      if (error?.code === "P2025") {
        return NextResponse.json({ error: "Favorite not found" }, { status: 404 })
      }
      throw error
    }

    const favoriteCount = await getFavoriteCount(productId)

    return NextResponse.json({
      success: true,
      favorited: false,
      favoriteCount,
    })
  } catch (error: any) {
    if (error?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (error?.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }
    if (error?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Product cannot be unfavorited" }, { status: 403 })
    }

    return NextResponse.json({ error: "Failed to remove favorite" }, { status: 500 })
  }
}

