import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { checkRateLimit, getClientIdentifier } from "@/lib/rateLimit"
import { sanitizeInput, sanitizeAndValidateLength } from "@/lib/security"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Rate limiting: 10 product creations per hour per user
    const identifier = `${session.user.id}:product-create`
    const rateLimit = checkRateLimit(identifier, { windowMs: 60 * 60 * 1000, maxRequests: 10 })
    
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
            'Retry-After': String(rateLimit.retryAfter || 3600),
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': String(rateLimit.remaining),
          }
        }
      )
    }

    // Verify the user exists in the database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const body = await request.json()
    const {
      title,
      description,
      categoryId,
      price,
      salePrice,
      livePreviewUrl,
      images,
      tags,
      // Additional fields (optional)
      filesIncluded,
      compatibleBrowsers,
      columns,
      dimensions,
      minSoftwareVersion,
      highResolution,
      retinaReady,
      downloadUrl,
    } = body

    // Sanitize and validate input
    const titleValidation = sanitizeAndValidateLength(title, 100, 1)
    if (!titleValidation.valid) {
      return NextResponse.json(
        { error: titleValidation.error || "Title is required and must be less than 100 characters" },
        { status: 400 }
      )
    }

    const descriptionValidation = sanitizeAndValidateLength(description, 10000, 1)
    if (!descriptionValidation.valid) {
      return NextResponse.json(
        { error: descriptionValidation.error || "Description is required" },
        { status: 400 }
      )
    }

    if (!categoryId || price === undefined) {
      return NextResponse.json(
        { error: "Category and price are required" },
        { status: 400 }
      )
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    })

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 400 })
    }

    // Generate slug from sanitized title
    const slug = titleValidation.sanitized
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    // Check if slug already exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    })

    let finalSlug = slug
    if (existingProduct) {
      finalSlug = `${slug}-${Date.now()}`
    }

    // Process tags - convert array to comma-separated string if needed
    let tagsString: string | null = null
    if (tags) {
      if (Array.isArray(tags)) {
        tagsString = tags.join(", ")
      } else if (typeof tags === "string") {
        tagsString = tags.trim() || null
      }
    }

    // Create product (using sanitized values)
    const product = await prisma.product.create({
      data: {
        title: titleValidation.sanitized,
        slug: finalSlug,
        description: descriptionValidation.sanitized,
        categoryId,
        sellerId: session.user.id,
        price: parseFloat(price),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        livePreviewUrl: livePreviewUrl || null,
        images: images || [],
        downloadUrl: downloadUrl || null,
        tags: tagsString,
        filesIncluded: Array.isArray(filesIncluded) ? filesIncluded : [],
        compatibleBrowsers: Array.isArray(compatibleBrowsers) ? compatibleBrowsers : [],
        columns: columns || null,
        dimensions: dimensions || null,
        minSoftwareVersion: minSoftwareVersion || null,
        highResolution: highResolution || null,
        retinaReady: retinaReady || null,
        status: "DRAFT", // Products start as draft for review
        moderationStatus: "PENDING_REVIEW",
      },
    })

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        slug: product.slug,
        title: product.title,
      },
      message: "Product created successfully. It will be reviewed before publishing.",
    })
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
