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

  const where: any = {
    role: "SELLER",
  }

  if (statusParam) {
    const statuses = statusParam.split(",").map((value) => value.trim()).filter(Boolean)
    if (statuses.length > 0) {
      where.sellerStatus = { in: statuses }
    }
  }

  if (searchTerm) {
    where.OR = [
      { name: { contains: searchTerm, mode: "insensitive" } },
      { email: { contains: searchTerm, mode: "insensitive" } },
      { username: { contains: searchTerm, mode: "insensitive" } },
    ]
  }

  const skip = (page - 1) * limit

  const [sellers, total, metrics] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        sellerStatus: true,
        createdAt: true,
        country: true,
        sellerVerificationNotes: true,
        sellerVerifiedAt: true,
      },
    }),
    prisma.user.count({ where }),
    prisma.user.groupBy({
      by: ["sellerStatus"],
      where: { role: "SELLER" },
      _count: { _all: true },
    }),
  ])

  const totalPages = Math.max(Math.ceil(total / limit), 1)

  const statusMetrics = metrics.reduce<Record<string, number>>((accumulator, item) => {
    accumulator[item.sellerStatus] = item._count._all
    return accumulator
  }, {})

  return NextResponse.json({
    sellers,
    metrics: statusMetrics,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  })
}
