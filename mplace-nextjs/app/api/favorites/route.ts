"use server"

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

interface FavoriteProductResponse {
  id: string
  productId: string
  title: string
  slug: string
  price: number
  salePrice: number | null
  images: string[]
  livePreviewUrl: string | null
  description: string | null
  createdAt: Date
  updatedAt: Date
  rating: number
  reviewCount: number
  favoriteCount: number
  downloads: number
  views: number
  favoritedAt: Date
  seller: {
    id: string
    name: string | null
    image: string | null
    username: string | null
  } | null
  category: {
    id: string
    name: string | null
    slug: string | null
  } | null
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limitParam = parseInt(searchParams.get("limit") || "100", 10)
    const limit = Math.min(Math.max(limitParam, 1), 200)

    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        product: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                image: true,
                username: true,
              },
            },
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            reviews: {
              select: {
                rating: true,
              },
            },
            favorites: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    })

    const formatted = favorites.reduce<FavoriteProductResponse[]>((acc, favorite) => {
        const product = favorite.product
        if (!product || product.status !== "PUBLISHED" || product.moderationStatus !== "APPROVED") {
          return acc
        }

        const ratings = product.reviews || []
        const avgRating = ratings.length > 0 ? ratings.reduce((sum, review) => sum + review.rating, 0) / ratings.length : 0

        acc.push({
          id: favorite.id,
          productId: product.id,
          title: product.title,
          slug: product.slug,
          price: Number(product.price),
          salePrice: product.salePrice != null ? Number(product.salePrice) : null,
          images: product.images || [],
          livePreviewUrl: product.livePreviewUrl,
          description: product.description,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
          rating: avgRating,
          reviewCount: ratings.length,
          favoriteCount: product.favorites?.length ?? 0,
          downloads: product.downloads ?? 0,
          views: product.views ?? 0,
          favoritedAt: favorite.createdAt,
          seller: product.seller
            ? {
                id: product.seller.id,
                name: product.seller.name,
                image: product.seller.image,
                username: product.seller.username,
              }
            : null,
          category: product.category
            ? {
                id: product.category.id,
                name: product.category.name,
                slug: product.category.slug,
              }
            : null,
        })

        return acc
      }, [])

    return NextResponse.json({
      favorites: formatted,
      total: formatted.length,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to load favorites" }, { status: 500 })
  }
}

