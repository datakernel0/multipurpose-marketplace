import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ensureAdmin } from "@/lib/adminAuth"
import { prisma } from "@/lib/prisma"

const DEFAULT_LIMIT = 25

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  ensureAdmin(session, { roles: ["SUPERADMIN", "ADMIN", "SUPPORT"], allowSuperAdmin: true })

  const { searchParams } = new URL(request.url)
  const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1)
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT), 10), 1), 200)
  const skip = (page - 1) * limit
  const query = searchParams.get("q")?.trim()

  const filters = query
    ? {
        OR: [{ email: { contains: query, mode: "insensitive" as const } }],
      }
    : {}

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const [subscribers, total, recent] = await Promise.all([
    prisma.newsletterSubscription.findMany({
      where: filters,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        subscribed: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.newsletterSubscription.count({ where: filters }),
    prisma.newsletterSubscription.count({ where: { ...filters, createdAt: { gte: sevenDaysAgo } } }),
  ])

  return NextResponse.json({
    subscribers: subscribers.map((entry) => ({
      id: entry.id,
      email: entry.email,
      name: null,
      subscribed: entry.subscribed,
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
    summary: {
      recentSevenDays: recent,
    },
    generatedAt: new Date().toISOString(),
  })
}
