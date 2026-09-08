import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import type { SupportTicketAction, SupportTicketPriority, SupportTicketStatus } from "@prisma/client"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ensureAdmin } from "@/lib/adminAuth"
import { prisma } from "@/lib/prisma"

const STATUS_OPTIONS = ["OPEN", "IN_PROGRESS", "WAITING_CUSTOMER", "WAITING_SUPPORT", "RESOLVED", "CLOSED"] as const
const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const
const STATUS_VALUES = new Set<string>(STATUS_OPTIONS)
const PRIORITY_VALUES = new Set<string>(PRIORITY_OPTIONS)
const CLOSING_STATUSES = new Set<string>(["RESOLVED", "CLOSED"])

type SupportTicketActionLiteral =
  | "CREATED"
  | "STATUS_CHANGED"
  | "PRIORITY_CHANGED"
  | "ASSIGNED"
  | "NOTE_ADDED"
  | "CUSTOMER_REPLIED"
  | "SUPPORT_REPLIED"
  | "CLOSED"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  ensureAdmin(session, { roles: ["SUPERADMIN", "ADMIN", "SUPPORT"], allowSuperAdmin: true })

  const { id } = await params
  const body = await request.json().catch(() => null)

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const data: Record<string, unknown> = {}
  const historyEntries: Array<{ action: SupportTicketActionLiteral; message?: string }> = []
  const now = new Date()

  if (body.status) {
    const normalizedStatus = String(body.status).toUpperCase()
    if (!STATUS_VALUES.has(normalizedStatus)) {
      return NextResponse.json({ error: "Invalid ticket status" }, { status: 400 })
    }
    data.status = normalizedStatus as SupportTicketStatus
    if (CLOSING_STATUSES.has(normalizedStatus)) {
      data.closedAt = now
    }
    historyEntries.push({ action: "STATUS_CHANGED", message: `Status changed to ${normalizedStatus}` })
  }

  if (body.priority) {
    const normalizedPriority = String(body.priority).toUpperCase()
    if (!PRIORITY_VALUES.has(normalizedPriority)) {
      return NextResponse.json({ error: "Invalid ticket priority" }, { status: 400 })
    }
    data.priority = normalizedPriority as SupportTicketPriority
    historyEntries.push({ action: "PRIORITY_CHANGED", message: `Priority changed to ${normalizedPriority}` })
  }

  if (body.category) {
    const normalizedCategory = String(body.category).toUpperCase()
    data.category = normalizedCategory
    historyEntries.push({ action: "NOTE_ADDED", message: `Category changed to ${normalizedCategory}` })
  }

  if (body.assignedToId !== undefined) {
    const assignedToId = body.assignedToId ? String(body.assignedToId) : null
    data.assignedToId = assignedToId
    historyEntries.push({
      action: "ASSIGNED",
      message: assignedToId ? `Assigned to ${assignedToId}` : "Ticket unassigned",
    })
  }

  if (body.resolution !== undefined) {
    data.resolution = body.resolution ? String(body.resolution) : null
    historyEntries.push({ action: "NOTE_ADDED", message: "Resolution updated" })
  }

  if (body.replyMessage) {
    historyEntries.push({ action: "SUPPORT_REPLIED", message: String(body.replyMessage) })
  }

  if (Object.keys(data).length === 0 && historyEntries.length === 0) {
    return NextResponse.json({ error: "No updates provided" }, { status: 400 })
  }

  data.lastActivityAt = now

  const ticket = await prisma.supportTicket.update({
    where: { id },
    data,
    include: {
      customer: {
        select: { id: true, name: true, email: true, username: true, image: true },
      },
      assignedTo: {
        select: { id: true, name: true, email: true },
      },
    },
  })

  if (historyEntries.length > 0) {
    await prisma.supportTicketHistory.createMany({
      data: historyEntries.map((entry) => ({
        ticketId: ticket.id,
        actorId: session?.user?.id ?? null,
        action: entry.action as SupportTicketAction,
        message: entry.message ?? null,
      })),
    })
  }

  return NextResponse.json({
    ticket: {
      id: ticket.id,
      reference: ticket.reference,
      subject: ticket.subject,
      status: ticket.status,
      priority: ticket.priority,
      category: ticket.category,
      resolution: ticket.resolution,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      lastActivityAt: ticket.lastActivityAt ? ticket.lastActivityAt.toISOString() : null,
      closedAt: ticket.closedAt ? ticket.closedAt.toISOString() : null,
      customer: ticket.customer,
      assignedTo: ticket.assignedTo,
    },
  })
}
