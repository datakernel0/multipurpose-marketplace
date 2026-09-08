import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ensureAdmin } from "@/lib/adminAuth"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"

const ACTION_MAP = {
  APPROVE: {
    moderationStatus: "APPROVED" as const,
    productStatus: "PUBLISHED" as const,
    actionType: "APPROVED" as const,
  },
  REJECT: {
    moderationStatus: "REJECTED" as const,
    productStatus: "DRAFT" as const,
    actionType: "REJECTED" as const,
  },
  REVISION: {
    moderationStatus: "NEEDS_REVISION" as const,
    productStatus: undefined,
    actionType: "FLAGGED" as const,
  },
}

const ACTION_COPY = {
  APPROVED: {
    title: "Product Approved",
    message: (productTitle: string) => `Your product "${productTitle}" has been approved and published.`,
    emailSubject: (productTitle: string) => `🎉 ${productTitle} is now live on MarketNest`,
    emailBody: (productTitle: string, productUrl: string) =>
      `Hi there,<br><br>Your product <strong>${productTitle}</strong> has been approved and is now live on MarketNest.<br><br>` +
      `View it here: <a href="${productUrl}">${productUrl}</a><br><br>` +
      `Thanks for keeping the marketplace awesome!`,
  },
  REJECTED: {
    title: "Product Rejected",
    message: (productTitle: string) => `Your product "${productTitle}" was rejected. Please review the feedback and resubmit when ready.`,
    emailSubject: (productTitle: string) => `Action required: ${productTitle} needs changes`,
    emailBody: (productTitle: string, editUrl: string, notes?: string | null) => {
      let body = `Hi there,<br><br>Unfortunately we had to reject <strong>${productTitle}</strong> at this time.`
      if (notes) {
        body += `<br><br><strong>Reviewer notes:</strong><br>${notes.replace(/\n/g, "<br>")}`
      }
      body += `<br><br>You can edit the product here: <a href="${editUrl}">${editUrl}</a><br><br>`
      body += `Once updated, resubmit and the review team will take another look.`
      return body
    },
  },
  FLAGGED: {
    title: "Product Needs Revision",
    message: (productTitle: string) => `Your product "${productTitle}" requires revisions before it can be approved.`,
    emailSubject: (productTitle: string) => `Revision requested: ${productTitle}`,
    emailBody: (productTitle: string, editUrl: string, notes?: string | null) => {
      let body = `Hi there,<br><br>We took a look at <strong>${productTitle}</strong> and need a few updates before approval.`
      if (notes) {
        body += `<br><br><strong>Reviewer notes:</strong><br>${notes.replace(/\n/g, "<br>")}`
      }
      body += `<br><br>Please make the requested changes and resubmit your item here: <a href="${editUrl}">${editUrl}</a>`
      body += `<br><br>Thanks for working with us to keep the marketplace high quality!`
      return body
    },
  },
}

const APP_BASE_URL = (process.env.NEXTAUTH_URL || process.env.APP_BASE_URL || "http://localhost:3000").replace(/\/$/, "")

type ModerationActionKey = keyof typeof ACTION_MAP

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  const adminUser = ensureAdmin(session, { roles: ["SUPERADMIN", "ADMIN", "MODERATOR"], allowSuperAdmin: true })

  const { id } = await params
  const body = await request.json()
  const actionKey = String(body.action || "").toUpperCase() as ModerationActionKey
  const notes = (body.notes as string | undefined)?.trim() || null

  if (!ACTION_MAP[actionKey]) {
    return NextResponse.json({ error: "Invalid moderation action" }, { status: 400 })
  }

  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      sellerId: true,
      seller: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  })

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }

  const actionDefinition = ACTION_MAP[actionKey]
  const copy = ACTION_COPY[actionDefinition.actionType]

  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id: product.id },
      data: {
        moderationStatus: actionDefinition.moderationStatus,
        status: actionDefinition.productStatus ?? product.status,
        moderatedById: adminUser.id,
        moderatedAt: new Date(),
        moderationNotes: notes,
      },
    })

    await tx.moderationAction.create({
      data: {
        entityType: "PRODUCT",
        entityId: product.id,
        productId: product.id,
        action: actionDefinition.actionType,
        performedById: adminUser.id,
        notes,
      },
    })

    if (copy) {
      let message = copy.message(product.title)
      if (notes) {
        message = `${message} Notes: ${notes}`
      }

      await tx.notification.create({
        data: {
          userId: product.sellerId,
          title: copy.title,
          message,
          type: "MODERATION",
          link: `/dashboard/edit-item?id=${product.id}`,
        },
      })
    }
  })

  if (copy && product.seller?.email) {
    const editUrl = `${APP_BASE_URL}/dashboard/edit-item?id=${product.id}`
    const productUrl = product.slug ? `${APP_BASE_URL}/single-product/${product.slug}` : editUrl

    const subject = copy.emailSubject(product.title)
    const html =
      actionDefinition.actionType === "APPROVED"
        ? copy.emailBody(product.title, productUrl)
        : copy.emailBody(product.title, editUrl, notes)

    sendEmail({ to: product.seller.email, subject, html }).catch(() => {})
  }

  return NextResponse.json({ success: true })
}
