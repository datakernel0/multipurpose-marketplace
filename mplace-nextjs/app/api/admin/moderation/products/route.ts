import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ensureAdmin } from "@/lib/adminAuth"
import { prisma } from "@/lib/prisma"

const DEFAULT_LIMIT = 20

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  ensureAdmin(session, { roles: ["SUPERADMIN", "ADMIN", "MODERATOR"], allowSuperAdmin: true })

  const { searchParams } = new URL(request.url)
  const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1)
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT), 10), 1), 100)
  const statusParam = searchParams.get("status")
  const searchTerm = searchParams.get("q")?.trim()

  const where: any = {}

  if (statusParam) {
    const statuses = statusParam.split(",").map((value) => value.trim()).filter(Boolean)
    if (statuses.length > 0) {
      where.moderationStatus = { in: statuses }
    }
  } else {
    where.moderationStatus = {
      in: ["PENDING_REVIEW", "IN_REVIEW", "NEEDS_REVISION"],
    }
  }

  if (searchTerm) {
    where.OR = [
      { title: { contains: searchTerm, mode: "insensitive" } },
      { seller: { name: { contains: searchTerm, mode: "insensitive" } } },
      { seller: { email: { contains: searchTerm, mode: "insensitive" } } },
    ]
  }

  const skip = (page - 1) * limit

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            sellerStatus: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ])

  const totalPages = Math.max(Math.ceil(total / limit), 1)

  const data = products.map((product) => ({
    id: product.id,
    title: product.title,
    slug: product.slug,
    status: product.status,
    moderationStatus: product.moderationStatus,
    category: product.category ? { id: product.category.id, name: product.category.name } : null,
    seller: product.seller,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }))

  return NextResponse.json({
    products: data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  })
}
