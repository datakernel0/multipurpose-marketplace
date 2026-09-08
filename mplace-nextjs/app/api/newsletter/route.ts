import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    // Validate email
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Check if email already exists
    const existing = await prisma.newsletterSubscription.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (existing) {
      if (existing.subscribed) {
        return NextResponse.json(
          { error: "This email is already subscribed to our newsletter" },
          { status: 400 }
        )
      } else {
        // Re-subscribe if previously unsubscribed
        await prisma.newsletterSubscription.update({
          where: { email: email.toLowerCase().trim() },
          data: { subscribed: true },
        })
        return NextResponse.json(
          { message: "Successfully re-subscribed to newsletter!" },
          { status: 200 }
        )
      }
    }

    // Create new subscription
    await prisma.newsletterSubscription.create({
      data: {
        email: email.toLowerCase().trim(),
        subscribed: true,
      },
    })

    return NextResponse.json(
      { message: "Successfully subscribed to newsletter!" },
      { status: 201 }
    )
  } catch (error: any) {
    
    // Handle unique constraint violation
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "This email is already subscribed" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to subscribe. Please try again later." },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      )
    }

    const subscription = await prisma.newsletterSubscription.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (!subscription) {
      return NextResponse.json({ subscribed: false }, { status: 200 })
    }

    return NextResponse.json(
      { subscribed: subscription.subscribed },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json({ error: "Failed to check subscription" }, { status: 500 })
  }
}

