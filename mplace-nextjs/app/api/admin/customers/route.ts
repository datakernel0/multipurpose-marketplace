import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { Prisma } from "@prisma/client"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ensureAdmin } from "@/lib/adminAuth"
import { prisma } from "@/lib/prisma"

const DEFAULT_LIMIT = 20
const PAYMENT_STATUSES = ["PAID", "COMPLETED", "SETTLED"] as const

function thirtyDaysAgo() {
  const now = new Date()
  now.setDate(now.getDate() - 30)
  return now
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  ensureAdmin(session, { roles: ["SUPERADMIN", "ADMIN", "SUPPORT"], allowSuperAdmin: true })

  const { searchParams } = new URL(request.url)
  const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1)
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT), 10), 1), 100)
  const skip = (page - 1) * limit

  const sortParam = searchParams.get("sort")?.toLowerCase() || "newest"
  const searchTerm = searchParams.get("q")?.trim()
  const activity = searchParams.get("activity")?.toLowerCase() || ""

  const baseConditions: Prisma.UserWhereInput[] = [
    { role: "USER" },
  ]

  if (searchTerm) {
    baseConditions.push({
      OR: [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { email: { contains: searchTerm, mode: "insensitive" } },
        { username: { contains: searchTerm, mode: "insensitive" } },
      ],
    })
  }

  const thirtyDays = thirtyDaysAgo()

  if (activity === "active") {
    baseConditions.push({
      orders: {
        some: {
          createdAt: { gte: thirtyDays },
          status: "COMPLETED",
          paymentStatus: { in: PAYMENT_STATUSES as any },
        },
      },
    })
  } else if (activity === "new") {
    baseConditions.push({ createdAt: { gte: thirtyDays } })
  } else if (activity === "inactive") {
    baseConditions.push({
      orders: {
        none: {
          createdAt: { gte: thirtyDays },
          status: "COMPLETED",
          paymentStatus: { in: PAYMENT_STATUSES as any },
        },
      },
    })
  }

  const where: Prisma.UserWhereInput = baseConditions.length > 1 ? { AND: baseConditions } : baseConditions[0]

  let orderBy: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[] = { createdAt: "desc" }
  switch (sortParam) {
    case "oldest":
      orderBy = { createdAt: "asc" }
      break
    case "name-az":
      orderBy = [{ name: "asc" }, { email: "asc" }]
      break
    case "name-za":
      orderBy = [{ name: "desc" }, { email: "desc" }]
      break
    case "orders":
      orderBy = { orders: { _count: "desc" } }
      break
    default:
      orderBy = { createdAt: "desc" }
  }

  const [customers, totalCount, totalCustomers, activeCustomers, newCustomers, lifetimeSpend] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        image: true,
        createdAt: true,
        country: true,
        billingCountry: true,
        billingFirstName: true,
        billingLastName: true,
        orders: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            totalAmount: true,
            status: true,
            paymentStatus: true,
            createdAt: true,
          },
        },
        _count: {
          select: { orders: true },
        },
      },
    }),
    prisma.user.count({ where }),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.user.count({
      where: {
        role: "USER",
        orders: {
          some: {
            createdAt: { gte: thirtyDays },
            status: "COMPLETED",
            paymentStatus: { in: PAYMENT_STATUSES as any },
          },
        },
      },
    }),
    prisma.user.count({ where: { role: "USER", createdAt: { gte: thirtyDays } } }),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: {
        status: "COMPLETED",
        paymentStatus: { in: PAYMENT_STATUSES as any },
      },
    }),
  ])

  const customerIds = customers.map((customer) => customer.id)

  const orderAggregates = customerIds.length
    ? await prisma.order.groupBy({
        by: ["userId"],
        where: {
          userId: { in: customerIds },
          status: "COMPLETED",
          paymentStatus: { in: PAYMENT_STATUSES as any },
        },
        _sum: { totalAmount: true },
        _count: { _all: true },
        _max: { createdAt: true },
      })
    : []

  const aggregateMap = new Map(orderAggregates.map((entry) => [entry.userId, entry]))

  const enrichedCustomers = customers.map((customer) => {
    const aggregate = aggregateMap.get(customer.id)
    const totalSpend = aggregate?._sum.totalAmount ?? new Prisma.Decimal(0)
    const orderCount = aggregate?._count._all ?? 0
    const lastCompletedOrderAt = aggregate?._max.createdAt ?? null

    const latestOrder = customer.orders[0]

    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      username: customer.username,
      avatar: customer.image,
      country: customer.country || customer.billingCountry || null,
      billingName:
        customer.billingFirstName || customer.billingLastName
          ? `${customer.billingFirstName ?? ""} ${customer.billingLastName ?? ""}`.trim()
          : null,
      createdAt: customer.createdAt.toISOString(),
      orderCount,
      totalSpend: Number(totalSpend),
      lastPurchaseAt: lastCompletedOrderAt ? lastCompletedOrderAt.toISOString() : latestOrder?.createdAt?.toISOString() ?? null,
      lastPurchaseAmount:
        latestOrder && PAYMENT_STATUSES.includes(latestOrder.paymentStatus as typeof PAYMENT_STATUSES[number])
          ? Number(latestOrder.totalAmount)
          : null,
      lastPurchaseStatus: latestOrder?.status ?? null,
    }
  })

  return NextResponse.json({
    customers: enrichedCustomers,
    pagination: {
      page,
      limit,
      total: totalCount,
      totalPages: Math.max(Math.ceil(totalCount / limit), 1),
    },
    summary: {
      totalCustomers,
      activeLast30Days: activeCustomers,
      newLast30Days: newCustomers,
      averageLifetimeValue:
        totalCustomers > 0 ? Number((lifetimeSpend._sum.totalAmount ?? 0) / totalCustomers) : 0,
    },
    generatedAt: new Date().toISOString(),
  })
}
