import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { ModerationStatus, Prisma, ProductStatus, ModerationActionType } from "@prisma/client"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ensureAdmin } from "@/lib/adminAuth"
import { prisma } from "@/lib/prisma"

const PRODUCT_STATUS_SET = new Set<string>(Object.values(ProductStatus))
const MODERATION_STATUS_SET = new Set<string>(Object.values(ModerationStatus))

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  ensureAdmin(session, { roles: ["SUPERADMIN", "ADMIN", "MODERATOR"], allowSuperAdmin: true })

  const { id } = await params
  const body = await request.json().catch(() => null)

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const updates: Prisma.ProductUpdateInput = {}
  const now = new Date()

  if (body.status) {
    const normalizedStatus = String(body.status).toUpperCase()
    if (!PRODUCT_STATUS_SET.has(normalizedStatus)) {
      return NextResponse.json({ error: "Invalid product status" }, { status: 400 })
    }
    updates.status = normalizedStatus as ProductStatus
  }

  if (body.moderationStatus) {
    const normalizedModeration = String(body.moderationStatus).toUpperCase()
    if (!MODERATION_STATUS_SET.has(normalizedModeration)) {
      return NextResponse.json({ error: "Invalid moderation status" }, { status: 400 })
    }
    updates.moderationStatus = normalizedModeration as ModerationStatus
    updates.moderatedAt = now
    updates.moderatedBy = session?.user?.id
      ? {
          connect: { id: session.user.id },
        }
      : {
          disconnect: true,
        }
  }

  if (typeof body.featured === "boolean") {
    updates.featured = body.featured
  }

  if (body.moderationNotes !== undefined) {
    updates.moderationNotes = body.moderationNotes ? String(body.moderationNotes).trim() : null
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No updates provided" }, { status: 400 })
  }

  const product = await prisma.product.update({
    where: { id },
    data: updates,
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
  })

  if (body.action) {
    const actionValue = String(body.action).toUpperCase()
    if (!Object.values(ModerationActionType).includes(actionValue as ModerationActionType)) {
      return NextResponse.json({ error: "Invalid moderation action" }, { status: 400 })
    }
    await prisma.moderationAction.create({
      data: {
        entityType: "PRODUCT",
        entityId: product.id,
        action: actionValue as ModerationActionType,
        notes: body.notes ? String(body.notes) : null,
        performedById: session?.user?.id ?? null,
      },
    })
  }

  const formattedProduct = {
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
    moderationNotes: product.moderationNotes,
    thumbnail: Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null,
  }

  return NextResponse.json({ product: formattedProduct })
}
