import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Find the product to ensure it exists and belongs to the user
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Verify the product belongs to the logged-in user
    if (product.sellerId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to view this product" },
        { status: 403 }
      )
    }

    return NextResponse.json(product)
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to load product" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const {
      title,
      description,
      categoryId,
      price,
      salePrice,
      livePreviewUrl,
      downloadUrl,
      images,
      tags,
      filesIncluded,
      compatibleBrowsers,
      columns,
      dimensions,
      minSoftwareVersion,
      highResolution,
      retinaReady,
    } = body

    // Find the product to ensure it exists and belongs to the user
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        sellerId: true,
        title: true,
        moderationStatus: true,
      },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Verify the product belongs to the logged-in user
    if (product.sellerId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to edit this product" },
        { status: 403 }
      )
    }

    // Validation
    if (!title || !description || !categoryId || price === undefined) {
      return NextResponse.json(
        { error: "Title, description, category, and price are required" },
        { status: 400 }
      )
    }

    if (title.length > 100) {
      return NextResponse.json(
        { error: "Title must be less than 100 characters" },
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

    // Generate slug from title if title changed
    let slug = product.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    if (title !== product.title) {
      slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
      
      // Check if slug already exists (excluding current product)
      const existingProduct = await prisma.product.findFirst({
        where: { 
          slug,
          id: { not: id }
        },
      })

      if (existingProduct) {
        slug = `${slug}-${Date.now()}`
      }
    }

    // Process tags - convert string to array if needed, then back to comma-separated string
    let tagsString: string | null = null
    if (tags) {
      if (Array.isArray(tags)) {
        tagsString = tags.join(", ")
      } else if (typeof tags === "string") {
        tagsString = tags.trim() || null
      }
    }

    const resetModeration = product.moderationStatus === "NEEDS_REVISION"

    const updateData: any = {
      title,
      slug,
      description,
      categoryId,
      price: parseFloat(price),
      salePrice: salePrice ? parseFloat(salePrice) : null,
      livePreviewUrl: livePreviewUrl || null,
      downloadUrl: downloadUrl || null,
      images: images || [],
      tags: tagsString,
      filesIncluded: Array.isArray(filesIncluded) ? filesIncluded : [],
      compatibleBrowsers: Array.isArray(compatibleBrowsers) ? compatibleBrowsers : [],
      columns: columns || null,
      dimensions: dimensions || null,
      minSoftwareVersion: minSoftwareVersion || null,
      highResolution: highResolution || null,
      retinaReady: retinaReady || null,
    }

    if (resetModeration) {
      updateData.moderationStatus = "PENDING_REVIEW"
      updateData.status = "PENDING_REVIEW"
      updateData.moderatedById = null
      updateData.moderatedAt = null
      updateData.moderationNotes = null
    }

    const now = new Date()

    const updatedProduct = await prisma.$transaction(async (tx) => {
      const productRecord = await tx.product.update({
        where: { id },
        data: updateData,
      })

      if (resetModeration) {
        await tx.moderationAction.create({
          data: {
            entityType: "PRODUCT",
            entityId: productRecord.id,
            productId: productRecord.id,
            action: "SUBMITTED",
            performedById: session.user.id,
            notes: "Product resubmitted by seller after revisions",
          },
        })
      }

      return productRecord
    })

    return NextResponse.json({
      success: true,
      product: {
        id: updatedProduct.id,
        slug: updatedProduct.slug,
        title: updatedProduct.title,
      },
      message: "Product updated successfully",
    })
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Find the product to ensure it exists and belongs to the user
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        sellerId: true,
        title: true,
      },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Verify the product belongs to the logged-in user
    if (product.sellerId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to delete this product" },
        { status: 403 }
      )
    }

    // Delete the product (cascade will handle related records)
    await prisma.product.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    })
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}

