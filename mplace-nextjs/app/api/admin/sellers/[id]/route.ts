import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ensureAdmin } from "@/lib/adminAuth"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"

const VALID_STATUSES = new Set(["APPROVED", "REJECTED", "SUSPENDED", "PENDING_REVIEW"])

const APP_BASE_URL = (process.env.NEXTAUTH_URL || process.env.APP_BASE_URL || "http://localhost:3000").replace(/\/$/, "")

const STATUS_COPY: Record<string, {
  title: string
  message: (name: string | null) => string
  emailSubject: (name: string | null) => string
  emailBody: (name: string | null, notes?: string | null) => string
}> = {
  APPROVED: {
    title: "Seller Account Approved",
    message: (name) => `${name ? `${name}, ` : ""}Your seller application has been approved. You can now publish products.`,
    emailSubject: (name) => `${name ? `${name}, ` : ""}your seller account is approved!`,
    emailBody: (name, notes) => {
      let body = `Hi ${name || "there"},<br><br>Your seller account has been approved. You now have access to the MartPlace seller tools and can begin publishing products.`
      if (notes) {
        body += `<br><br><strong>Admin notes:</strong><br>${notes.replace(/\n/g, "<br>")}`
      }
      body += `<br><br>Get started here: <a href="${APP_BASE_URL}/dashboard">${APP_BASE_URL}/dashboard</a>`
      return body
    },
  },
  REJECTED: {
    title: "Seller Application Rejected",
    message: (name) => `${name ? `${name}, ` : ""}Your seller application was rejected. Please review the feedback and try again after addressing the issues.`,
    emailSubject: (name) => `${name ? `${name}, ` : ""}we need some updates on your seller application`,
    emailBody: (name, notes) => {
      let body = `Hi ${name || "there"},<br><br>Thanks for applying to become a seller. We need a few adjustments before we can approve your account.`
      if (notes) {
        body += `<br><br><strong>Reviewer notes:</strong><br>${notes.replace(/\n/g, "<br>")}`
      }
      body += `<br><br>Please update your application and resubmit. If you have questions, reach out to support.`
      return body
    },
  },
  SUSPENDED: {
    title: "Seller Account Suspended",
    message: (name) => `${name ? `${name}, ` : ""}Your seller account has been suspended by the admin team. Contact support for additional details.`,
    emailSubject: (name) => `${name ? `${name}, ` : ""}your seller account has been suspended`,
    emailBody: (name, notes) => {
      let body = `Hi ${name || "there"},<br><br>We’ve temporarily suspended your seller account.`
      if (notes) {
        body += `<br><br><strong>Reason:</strong><br>${notes.replace(/\n/g, "<br>")}`
      }
      body += `<br><br>Please contact support so we can help resolve this.`
      return body
    },
  },
  PENDING_REVIEW: {
    title: "Seller Application In Review",
    message: (name) => `${name ? `${name}, ` : ""}Your seller application has been set for further review. We will notify you once a decision is made.`,
    emailSubject: (name) => `${name ? `${name}, ` : ""}your seller application is under review`,
    emailBody: (name, notes) => {
      let body = `Hi ${name || "there"},<br><br>Your seller application is currently under review. We’ll reach out as soon as there’s an update.`
      if (notes) {
        body += `<br><br><strong>Reviewer notes:</strong><br>${notes.replace(/\n/g, "<br>")}`
      }
      body += `<br><br>Thanks for your patience.`
      return body
    },
  },
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  const adminUser = ensureAdmin(session, { roles: ["SUPERADMIN", "ADMIN", "MODERATOR"], allowSuperAdmin: true })

  const { id } = await params
  const body = await request.json()
  const status = String(body.status || "").toUpperCase()
  const notes = (body.notes as string | undefined)?.trim() || null

  if (!VALID_STATUSES.has(status)) {
    return NextResponse.json({ error: "Invalid seller status" }, { status: 400 })
  }

  const seller = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      role: true,
      name: true,
      email: true,
    },
  })

  if (!seller || seller.role !== "SELLER") {
    return NextResponse.json({ error: "Seller not found" }, { status: 404 })
  }

  const now = new Date()
  const copy = STATUS_COPY[status]

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: seller.id },
      data: {
        sellerStatus: status as any,
        sellerVerificationNotes: notes,
        sellerVerifiedAt: status === "APPROVED" ? now : null,
        updatedAt: now,
      },
    })

    await tx.moderationAction.create({
      data: {
        entityType: "SELLER_PROFILE",
        entityId: seller.id,
        action: status === "APPROVED" ? "APPROVED" : status === "REJECTED" ? "REJECTED" : status === "SUSPENDED" ? "SUSPENDED" : "FLAGGED",
        performedById: adminUser.id,
        notes,
      },
    })

    if (copy) {
      let message = copy.message(seller.name)
      if (notes) {
        message = `${message} Notes: ${notes}`
      }

      await tx.notification.create({
        data: {
          userId: seller.id,
          title: copy.title,
          message,
          type: "SELLER_STATUS",
          link: "/dashboard",
        },
      })
    }
  })

  if (copy && seller.email) {
    const subject = copy.emailSubject(seller.name)
    const html = copy.emailBody(seller.name, notes)

    sendEmail({ to: seller.email, subject, html }).catch((error) => {
      // Email failures shouldn't block API response
    })
  }

  return NextResponse.json({ success: true })
}
