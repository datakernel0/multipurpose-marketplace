import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendContactEmail } from "@/lib/email"
import { checkRateLimit, getClientIdentifier } from "@/lib/rateLimit"
import { sanitizeInput, isValidEmail, sanitizeAndValidateLength } from "@/lib/security"

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 requests per minute per IP
    const identifier = getClientIdentifier(request)
    const rateLimit = checkRateLimit(identifier, { windowMs: 60 * 1000, maxRequests: 5 })
    
    if (!rateLimit.success) {
      return NextResponse.json(
        { 
          error: "Too many requests",
          message: `Rate limit exceeded. Please try again in ${rateLimit.retryAfter} seconds.`,
          retryAfter: rateLimit.retryAfter 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfter || 60),
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': String(rateLimit.remaining),
          }
        }
      )
    }

    const body = await request.json()
    const { name, email, phone, subject, message } = body

    // Sanitize and validate input
    const nameValidation = sanitizeAndValidateLength(name, 100, 1)
    if (!nameValidation.valid) {
      return NextResponse.json({ error: nameValidation.error || "Name is required" }, { status: 400 })
    }

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    const messageValidation = sanitizeAndValidateLength(message, 5000, 1)
    if (!messageValidation.valid) {
      return NextResponse.json({ error: messageValidation.error || "Message is required" }, { status: 400 })
    }

    // Save message to database (using sanitized values)
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name: nameValidation.sanitized,
        email: email.toLowerCase().trim(),
        phone: phone ? sanitizeInput(phone) : null,
        subject: subject ? sanitizeInput(subject) : null,
        message: messageValidation.sanitized,
      },
    })

    // Send email to author/admin
    try {
      const emailResult = await sendContactEmail({
        name: contactMessage.name,
        email: contactMessage.email,
        phone: contactMessage.phone || "",
        subject: contactMessage.subject || "Contact Form Submission",
        message: contactMessage.message,
      })
      
      if (!emailResult.success) {
        return NextResponse.json({ error: emailResult.error || "Failed to send message" }, { status: 500 })
      }
    } catch (emailError) {
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
    }

    return NextResponse.json(
      { 
        message: "Thank you for contacting us! We'll get back to you soon.",
        id: contactMessage.id 
      },
      { status: 201 }
    )
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}

