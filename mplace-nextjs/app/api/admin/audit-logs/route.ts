import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { Prisma } from "@prisma/client"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ensureAdmin } from "@/lib/adminAuth"
import { prisma } from "@/lib/prisma"

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

function parseEnumList(value: string | null) {
  if (!value) return undefined
  const values = value
    .split(",")
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean)
  return values.length > 0 ? values : undefined
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  ensureAdmin(session, { roles: ["SUPERADMIN", "ADMIN", "MODERATOR"], allowSuperAdmin: true })

  const { searchParams } = new URL(request.url)
  const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1)
  const limitParam = parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT), 10)
  const limit = Math.min(Math.max(limitParam, 1), MAX_LIMIT)
  const actionFilter = parseEnumList(searchParams.get("action"))
  const entityTypeFilter = parseEnumList(searchParams.get("entity"))
  const actorId = searchParams.get("actorId")?.trim() || undefined
  const searchTerm = searchParams.get("q")?.trim() || undefined
  const dateFromParam = searchParams.get("from")
  const dateToParam = searchParams.get("to")

  const where: Prisma.ModerationActionWhereInput = {}

  if (actionFilter) {
    where.action = { in: actionFilter as any }
  }

  if (entityTypeFilter) {
    where.entityType = { in: entityTypeFilter as any }
  }

  if (actorId) {
    where.performedById = actorId
  }

  if (dateFromParam || dateToParam) {
    const createdAt: Prisma.DateTimeFilter = {}
    if (dateFromParam) {
      const fromDate = new Date(dateFromParam)
      if (!Number.isNaN(fromDate.getTime())) {
        createdAt.gte = fromDate
      }
    }
    if (dateToParam) {
      const toDate = new Date(dateToParam)
      if (!Number.isNaN(toDate.getTime())) {
        // include entire day when only date provided
        toDate.setHours(23, 59, 59, 999)
        createdAt.lte = toDate
      }
    }
    if (Object.keys(createdAt).length > 0) {
      where.createdAt = createdAt
    }
  }

  if (searchTerm) {
    const likeTerm = searchTerm
    where.OR = [
      { notes: { contains: likeTerm, mode: "insensitive" } },
      { entityId: { contains: likeTerm, mode: "insensitive" } },
      { product: { title: { contains: likeTerm, mode: "insensitive" } } },
      { performedBy: { name: { contains: likeTerm, mode: "insensitive" } } },
      { performedBy: { email: { contains: likeTerm, mode: "insensitive" } } },
    ]
  }

  const skip = (page - 1) * limit

  const [logs, total, actionBreakdown, entityBreakdown] = await Promise.all([
    prisma.moderationAction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        performedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    }),
    prisma.moderationAction.count({ where }),
    prisma.moderationAction.groupBy({
      by: ["action"],
      _count: { _all: true },
      where,
    }),
    prisma.moderationAction.groupBy({
      by: ["entityType"],
      _count: { _all: true },
      where,
    }),
  ])

  const sellerEntityIds = logs
    .filter((log) => log.entityType === "SELLER_PROFILE" || log.entityType === "USER")
    .map((log) => log.entityId)

  const uniqueSellerIds = [...new Set(sellerEntityIds)]

  let sellerMap = new Map<string, { id: string; name: string | null; username: string | null; email: string }>()
  if (uniqueSellerIds.length > 0) {
    const sellers = await prisma.user.findMany({
      where: { id: { in: uniqueSellerIds } },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
      },
    })
    sellerMap = new Map(sellers.map((seller) => [seller.id, seller]))
  }

  const entries = logs.map((log) => {
    const product = log.product
    const entityUser = sellerMap.get(log.entityId)
    const entityLabel = (() => {
      if (product) return product.title
      if (entityUser) return entityUser.name || entityUser.username || entityUser.email
      return log.entityId
    })()

    const entityLink = (() => {
      if (product?.slug) return `/single-product/${product.slug}`
      if (entityUser) return `/author?username=${entityUser.username || entityUser.id}`
      return null
    })()

    return {
      id: log.id,
      entityType: log.entityType,
      entityId: log.entityId,
      action: log.action,
      notes: log.notes,
      metadata: log.metadata,
      createdAt: log.createdAt.toISOString(),
      performedBy: log.performedBy,
      product: product ? { id: product.id, title: product.title, slug: product.slug } : null,
      entityLabel,
      entityLink,
    }
  })

  const totalPages = Math.max(Math.ceil(total / limit), 1)

  const actionSummary = actionBreakdown.reduce<Record<string, number>>((acc, item) => {
    acc[item.action] = item._count._all
    return acc
  }, {})

  const entitySummary = entityBreakdown.reduce<Record<string, number>>((acc, item) => {
    acc[item.entityType] = item._count._all
    return acc
  }, {})

  return NextResponse.json({
    entries,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
    summary: {
      actions: actionSummary,
      entities: entitySummary,
    },
  })
}
