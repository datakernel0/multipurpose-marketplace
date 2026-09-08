import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { Prisma, ProductStatus, ModerationStatus } from "@prisma/client"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ensureAdmin } from "@/lib/adminAuth"
import { prisma } from "@/lib/prisma"

const DEFAULT_LIMIT = 20
const STATUS_VALUES = new Set<string>(Object.values(ProductStatus))
const MODERATION_VALUES = new Set<string>(Object.values(ModerationStatus))

const SORT_MAP: Record<string, Prisma.ProductOrderByWithRelationInput> = {
  newest: { createdAt: "desc" },
  oldest: { createdAt: "asc" },
  "price-high": { price: "desc" },
  "price-low": { price: "asc" },
  downloads: { downloads: "desc" },
  views: { views: "desc" },
  rating: { rating: "desc" },
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  ensureAdmin(session, { roles: ["SUPERADMIN", "ADMIN", "MODERATOR"], allowSuperAdmin: true })

  const { searchParams } = new URL(request.url)
  const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1)
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT), 10), 1), 100)
  const skip = (page - 1) * limit

  const statusParam = searchParams.get("status")
  const moderationParam = searchParams.get("moderationStatus")
  const featuredParam = searchParams.get("featured")
  const categoryParam = searchParams.get("category")
  const sellerParam = searchParams.get("seller")
  const searchTerm = searchParams.get("q")?.trim()
  const sortParam = searchParams.get("sort")?.trim().toLowerCase()

  const where: Prisma.ProductWhereInput = {}

  if (statusParam) {
    const statuses = statusParam
      .split(",")
      .map((value) => value.trim().toUpperCase())
      .filter((value) => STATUS_VALUES.has(value))
    if (statuses.length > 0) {
      where.status = { in: statuses as ProductStatus[] }
    }
  }

  if (moderationParam) {
    const moderationStatuses = moderationParam
      .split(",")
      .map((value) => value.trim().toUpperCase())
      .filter((value) => MODERATION_VALUES.has(value))
    if (moderationStatuses.length > 0) {
      where.moderationStatus = { in: moderationStatuses as ModerationStatus[] }
    }
  }

  if (featuredParam === "true") {
    where.featured = true
  } else if (featuredParam === "false") {
    where.featured = false
  }

  if (categoryParam) {
    where.categoryId = categoryParam
  }

  if (sellerParam) {
    where.sellerId = sellerParam
  }

  if (searchTerm) {
    where.OR = [
      { title: { contains: searchTerm, mode: "insensitive" } },
      { slug: { contains: searchTerm, mode: "insensitive" } },
      { seller: { name: { contains: searchTerm, mode: "insensitive" } } },
      { seller: { email: { contains: searchTerm, mode: "insensitive" } } },
      { seller: { username: { contains: searchTerm, mode: "insensitive" } } },
    ]
  }

  const orderBy = SORT_MAP[sortParam || ""] || SORT_MAP.newest

  const [products, total, statusMetrics, moderationMetrics, featuredTotal] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            sellerStatus: true,
          },
        },
      },
    }),
    prisma.product.count({ where }),
    prisma.product.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.product.groupBy({
      by: ["moderationStatus"],
      _count: { _all: true },
    }),
    prisma.product.count({ where: { featured: true } }),
  ])

  const totalPages = Math.max(Math.ceil(total / limit), 1)

  const summaryStatus = statusMetrics.reduce<Record<string, number>>((acc, metric) => {
    acc[metric.status] = metric._count._all
    return acc
  }, {})

  const summaryModeration = moderationMetrics.reduce<Record<string, number>>((acc, metric) => {
    acc[metric.moderationStatus] = metric._count._all
    return acc
  }, {})

  const formattedProducts = products.map((product) => ({
    id: product.id,
    title: product.title,
    slug: product.slug,
    price: product.price,
    salePrice: product.salePrice,
    status: product.status,
    moderationStatus: product.moderationStatus,
    featured: product.featured,
    downloads: product.downloads,
    views: product.views,
    rating: product.rating,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    category: product.category
      ? {
          id: product.category.id,
          name: product.category.name,
          slug: product.category.slug,
        }
      : null,
    seller: product.seller
      ? {
          id: product.seller.id,
          name: product.seller.name,
          email: product.seller.email,
          username: product.seller.username,
          status: product.seller.sellerStatus,
        }
      : null,
    thumbnail: Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null,
    moderationNotes: product.moderationNotes,
  }))

  return NextResponse.json({
    products: formattedProducts,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
    summary: {
      status: summaryStatus,
      moderation: summaryModeration,
      featured: featuredTotal,
    },
  })
}
