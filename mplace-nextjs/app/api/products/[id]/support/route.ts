import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: "Product id is required" }, { status: 400 })
    }

    const body = await request.json().catch(() => null)
    const subject = typeof body?.subject === "string" ? body.subject.trim() : ""
    const message = typeof body?.message === "string" ? body.message.trim() : ""

    if (!subject) {
      return NextResponse.json({ error: "Subject is required" }, { status: 400 })
    }

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    if (!product.seller?.email) {
      return NextResponse.json({ error: "Seller does not have a contact email" }, { status: 400 })
    }

    const requesterName = session.user?.name || session.user?.email || "MartPlace Customer"
    const requesterEmail = session.user?.email || undefined

    const emailSubject = `[MartPlace Support] ${subject}`
    const emailText = `Support request for ${product.title} (ID: ${product.id})

From: ${requesterName}${requesterEmail ? ` <${requesterEmail}>` : ""}

Message:
${message}
`

    const emailHtml = `
      <h2>New Support Request</h2>
      <p><strong>Product:</strong> ${product.title}</p>
      <p><strong>Product ID:</strong> ${product.id}</p>
      <p><strong>From:</strong> ${requesterName}${requesterEmail ? ` (${requesterEmail})` : ""}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, "<br>")}</p>
    `

    const emailResult = await sendEmail({
      to: product.seller.email,
      subject: emailSubject,
      text: emailText,
      html: emailHtml,
      replyTo: requesterEmail,
    })

    if (!emailResult.success) {
      return NextResponse.json({ error: emailResult.error || "Failed to send support message" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to send support request" }, { status: 500 })
  }
}
