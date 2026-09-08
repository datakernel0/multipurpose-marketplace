import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: "Product id is required" }, { status: 400 })
    }

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
        seller: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            email: true,
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    if (product.status !== "PUBLISHED" || product.moderationStatus !== "APPROVED") {
      return NextResponse.json({ error: "Product is not available for purchase" }, { status: 403 })
    }

    const salePrice = product.salePrice ? Number(product.salePrice) : null
    const regularPrice = Number(product.price)

    return NextResponse.json({
      id: product.id,
      title: product.title,
      slug: product.slug,
      description: product.description,
      price: regularPrice,
      salePrice,
      category: product.category,
      downloads: product.downloads,
      images: product.images,
      seller: product.seller
        ? {
            id: product.seller.id,
            name: product.seller.name,
            username: product.seller.username,
            image: product.seller.image,
            email: product.seller.email,
          }
        : null,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to load product" }, { status: 500 })
  }
}
