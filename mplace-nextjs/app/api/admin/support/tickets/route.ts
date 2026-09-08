import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import type { Prisma, SupportTicketCategory, SupportTicketPriority, SupportTicketStatus } from "@prisma/client"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ensureAdmin } from "@/lib/adminAuth"
import { prisma } from "@/lib/prisma"

const DEFAULT_LIMIT = 20
const STATUS_OPTIONS = ["OPEN", "IN_PROGRESS", "WAITING_CUSTOMER", "WAITING_SUPPORT", "RESOLVED", "CLOSED"] as const
const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const
const CATEGORY_OPTIONS = ["GENERAL", "BILLING", "TECHNICAL", "ACCOUNT", "SALES"] as const

const STATUS_VALUES = new Set<string>(STATUS_OPTIONS)
const PRIORITY_VALUES = new Set<string>(PRIORITY_OPTIONS)
const CATEGORY_VALUES = new Set<string>(CATEGORY_OPTIONS)

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  ensureAdmin(session, { roles: ["SUPERADMIN", "ADMIN", "SUPPORT"], allowSuperAdmin: true })

  const { searchParams } = new URL(request.url)
  const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1)
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT), 10), 1), 100)
  const skip = (page - 1) * limit

  const statusParam = searchParams.get("status")
  const priorityParam = searchParams.get("priority")
  const categoryParam = searchParams.get("category")
  const assignedParam = searchParams.get("assigned")
  const searchTerm = searchParams.get("q")?.trim()
  const sortParam = searchParams.get("sort")?.toLowerCase() || "newest"

  const filters: Prisma.SupportTicketWhereInput[] = []

  if (statusParam) {
    const statuses = statusParam
      .split(",")
      .map((value) => value.trim().toUpperCase())
      .filter((value) => STATUS_VALUES.has(value))
    if (statuses.length > 0) {
      filters.push({ status: { in: statuses as SupportTicketStatus[] } })
    }
  }

  if (priorityParam) {
    const priorities = priorityParam
      .split(",")
      .map((value) => value.trim().toUpperCase())
      .filter((value) => PRIORITY_VALUES.has(value))
    if (priorities.length > 0) {
      filters.push({ priority: { in: priorities as SupportTicketPriority[] } })
    }
  }

  if (categoryParam) {
    const categories = categoryParam
      .split(",")
      .map((value) => value.trim().toUpperCase())
      .filter((value) => CATEGORY_VALUES.has(value))
    if (categories.length > 0) {
      filters.push({ category: { in: categories as SupportTicketCategory[] } })
    }
  }

  if (assignedParam === "unassigned") {
    filters.push({ assignedToId: null })
  } else if (assignedParam === "assigned") {
    filters.push({ assignedToId: { not: null } })
  } else if (assignedParam && assignedParam.startsWith("user:")) {
    const userId = assignedParam.slice("user:".length)
    if (userId) {
      filters.push({ assignedToId: userId })
    }
  }

  if (searchTerm) {
    filters.push({
      OR: [
        { reference: { contains: searchTerm, mode: "insensitive" } },
        { subject: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
        { customer: { name: { contains: searchTerm, mode: "insensitive" } } },
        { customer: { email: { contains: searchTerm, mode: "insensitive" } } },
      ],
    })
  }

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const where: Prisma.SupportTicketWhereInput = filters.length > 0 ? { AND: filters } : {}

  let orderBy: Prisma.SupportTicketOrderByWithRelationInput = { createdAt: "desc" }
  switch (sortParam) {
    case "oldest":
      orderBy = { createdAt: "asc" }
      break
    case "priority":
      orderBy = { priority: "desc" }
      break
    case "updated":
      orderBy = { updatedAt: "desc" }
      break
    case "last-activity":
      orderBy = { lastActivityAt: "desc" }
      break
    default:
      orderBy = { createdAt: "desc" }
  }

  const [tickets, total, statusCounts, priorityCounts, categoryCounts, activeLast30Days] = await Promise.all([
    prisma.supportTicket.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            image: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.supportTicket.count({ where }),
    prisma.supportTicket.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.supportTicket.groupBy({ by: ["priority"], _count: { _all: true } }),
    prisma.supportTicket.groupBy({ by: ["category"], _count: { _all: true } }),
    prisma.supportTicket.count({ where: { lastActivityAt: { gte: thirtyDaysAgo } } }),
  ])

  const statusSummary = statusCounts.reduce<Record<string, number>>((acc, current) => {
    acc[current.status] = current._count._all
    return acc
  }, {})

  const prioritySummary = priorityCounts.reduce<Record<string, number>>((acc, current) => {
    acc[current.priority] = current._count._all
    return acc
  }, {})

  const categorySummary = categoryCounts.reduce<Record<string, number>>((acc, current) => {
    acc[current.category] = current._count._all
    return acc
  }, {})

  return NextResponse.json({
    tickets: tickets.map((ticket) => ({
      id: ticket.id,
      reference: ticket.reference,
      subject: ticket.subject,
      descriptionSnippet: ticket.description.slice(0, 160),
      status: ticket.status,
      priority: ticket.priority,
      category: ticket.category,
      resolvedAt: ticket.closedAt ? ticket.closedAt.toISOString() : null,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      lastActivityAt: ticket.lastActivityAt ? ticket.lastActivityAt.toISOString() : ticket.updatedAt.toISOString(),
      customer: ticket.customer
        ? {
            id: ticket.customer.id,
            name: ticket.customer.name,
            email: ticket.customer.email,
            username: ticket.customer.username,
            image: ticket.customer.image,
          }
        : null,
      assignedTo: ticket.assignedTo
        ? {
            id: ticket.assignedTo.id,
            name: ticket.assignedTo.name,
            email: ticket.assignedTo.email,
          }
        : null,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
    summary: {
      status: statusSummary,
      priority: prioritySummary,
      category: categorySummary,
      activeLast30Days,
    },
    generatedAt: new Date().toISOString(),
  })
}
