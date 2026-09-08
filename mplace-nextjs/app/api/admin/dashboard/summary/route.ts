import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { Prisma } from "@prisma/client"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { AdminAuthorizationError, ensureAdmin } from "@/lib/adminAuth"
import { prisma } from "@/lib/prisma"

const DAY_IN_MS = 24 * 60 * 60 * 1000

interface RevenueByDayRow {
  date: Date
  total: number
}

interface SellersByDayRow {
  date: Date
  count: number
}

interface ModerationActionsByDayRow {
  date: Date
  approved: number
  rejected: number
  flagged: number
  suspended: number
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    ensureAdmin(session, { roles: ["SUPERADMIN", "ADMIN", "MODERATOR"] })

    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * DAY_IN_MS)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * DAY_IN_MS)
    const rangeStart = new Date(now.getTime() - 29 * DAY_IN_MS)

    const [
      pendingProducts,
      revisionRequired,
      publishedProducts,
      pendingSellers,
      suspendedSellers,
      customerCount,
      totalRevenueAggregate,
      last30DaysRevenueAggregate,
      moderationQueueCount,
      flaggedLastWeek,
      revenueByDayRaw,
      newSellersByDayRaw,
      moderationActionsByDayRaw,
    ] = await Promise.all([
    prisma.product.count({ where: { moderationStatus: "PENDING_REVIEW" } }),
    prisma.product.count({ where: { moderationStatus: "NEEDS_REVISION" } }),
    prisma.product.count({ where: { status: "PUBLISHED" } }),
    prisma.user.count({ where: { role: "SELLER", sellerStatus: "PENDING_REVIEW" } }),
    prisma.user.count({ where: { role: "SELLER", sellerStatus: "SUSPENDED" } }),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.order.aggregate({
      _sum: {
        totalAmount: true,
      },
      where: {
        status: "COMPLETED",
      },
    }),
    prisma.order.aggregate({
      _sum: {
        totalAmount: true,
      },
      where: {
        status: "COMPLETED",
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    }),
    prisma.product.count({
      where: {
        moderationStatus: {
          in: ["PENDING_REVIEW", "IN_REVIEW"],
        },
      },
    }),
    prisma.moderationAction.count({
      where: {
        action: "FLAGGED",
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    }),
    prisma.$queryRaw<RevenueByDayRow[]>(Prisma.sql`
      SELECT DATE_TRUNC('day', "createdAt")::date AS date,
             COALESCE(SUM("totalAmount"), 0)::float AS total
      FROM "orders"
      WHERE "status" = 'COMPLETED'
        AND "createdAt" >= ${thirtyDaysAgo}
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY date ASC
    `),
    prisma.$queryRaw<SellersByDayRow[]>(Prisma.sql`
      SELECT DATE_TRUNC('day', "createdAt")::date AS date,
             COUNT(*)::int AS count
      FROM "User"
      WHERE "role" = 'SELLER'
        AND "createdAt" >= ${thirtyDaysAgo}
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY date ASC
    `),
    prisma.$queryRaw<ModerationActionsByDayRow[]>(Prisma.sql`
      SELECT DATE_TRUNC('day', "createdAt")::date AS date,
             SUM(CASE WHEN "action" = 'APPROVED' THEN 1 ELSE 0 END)::int AS approved,
             SUM(CASE WHEN "action" = 'REJECTED' THEN 1 ELSE 0 END)::int AS rejected,
             SUM(CASE WHEN "action" = 'FLAGGED' THEN 1 ELSE 0 END)::int AS flagged,
             SUM(CASE WHEN "action" = 'SUSPENDED' THEN 1 ELSE 0 END)::int AS suspended
      FROM "moderation_actions"
      WHERE "createdAt" >= ${thirtyDaysAgo}
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY date ASC
    `),
  ])

  const totalRevenue = totalRevenueAggregate._sum.totalAmount ?? 0
  const last30DaysRevenue = last30DaysRevenueAggregate._sum.totalAmount ?? 0

  const revenueMap = new Map(
    revenueByDayRaw.map((row) => [row.date.toISOString().slice(0, 10), Number(row.total) || 0])
  )
  const sellersMap = new Map(
    newSellersByDayRaw.map((row) => [row.date.toISOString().slice(0, 10), Number(row.count) || 0])
  )
  const moderationMap = new Map(
    moderationActionsByDayRaw.map((row) => [row.date.toISOString().slice(0, 10), row])
  )

  const last30DaysRange = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(rangeStart.getTime() + index * DAY_IN_MS)
    return date.toISOString().slice(0, 10)
  })

  const revenueSeries = last30DaysRange.map((dateKey) => ({
    date: dateKey,
    amount: revenueMap.get(dateKey) ?? 0,
  }))

  const newSellersSeries = last30DaysRange.map((dateKey) => ({
    date: dateKey,
    count: sellersMap.get(dateKey) ?? 0,
  }))

  const moderationSeries = last30DaysRange.map((dateKey) => {
    const row = moderationMap.get(dateKey)
    return {
      date: dateKey,
      approved: row?.approved ?? 0,
      rejected: row?.rejected ?? 0,
      flagged: row?.flagged ?? 0,
      suspended: row?.suspended ?? 0,
    }
  })

  return NextResponse.json({
    metrics: {
      products: {
        pending: pendingProducts,
        needsRevision: revisionRequired,
        published: publishedProducts,
      },
      sellers: {
        awaitingReview: pendingSellers,
        suspended: suspendedSellers,
      },
      customers: customerCount,
      revenue: {
        total: totalRevenue,
        last30Days: last30DaysRevenue,
      },
    },
    moderation: {
      queueSize: moderationQueueCount,
      flaggedLast7Days: flaggedLastWeek,
    },
    timeseries: {
      revenue: {
        last30Days: revenueSeries,
      },
      sellers: {
        last30Days: newSellersSeries,
      },
      moderationActions: {
        last30Days: moderationSeries,
      },
    },
    generatedAt: now.toISOString(),
  })
  } catch (error: any) {
    if (error instanceof AdminAuthorizationError) {
      const status = error.message === "Authentication required" ? 401 : 403
      return NextResponse.json({ error: error.message }, { status })
    }

    console.error("Error in /api/admin/dashboard/summary:", error)
    return NextResponse.json(
      { error: error?.message || "Failed to fetch dashboard summary" },
      { status: 500 }
    )
  }
}
