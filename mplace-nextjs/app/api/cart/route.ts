import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

function formatCartItem(cartItem: any) {
  const product = cartItem.product
  const salePrice = product.salePrice !== null ? Number(product.salePrice) : null
  const regularPrice = Number(product.price)
  const effectivePrice = salePrice !== null && salePrice < regularPrice ? salePrice : regularPrice

  const firstImage = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : "/images/p1.jpg"

  return {
    id: cartItem.id,
    productId: product.id,
    title: product.title,
    description: product.description || "",
    slug: product.slug,
    quantity: cartItem.quantity,
    price: regularPrice,
    salePrice,
    effectivePrice,
    image: firstImage,
    category: product.category
      ? {
          name: product.category.name,
          icon: product.category.image || "/images/catword.png",
        }
      : null,
    addedAt: cartItem.createdAt,
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const summary = searchParams.get("summary") === "1"

    const [items, totalItems] = await Promise.all([
      prisma.cartItem.findMany({
        where: { userId: session.user.id },
        include: {
          product: {
            select: {
              id: true,
              title: true,
              description: true,
              slug: true,
              images: true,
              price: true,
              salePrice: true,
              category: {
                select: {
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: summary ? 5 : undefined,
      }),
      prisma.cartItem.count({ where: { userId: session.user.id } }),
    ])

    const formattedItems = items.map(formatCartItem)
    const subtotal = formattedItems.reduce((sum, item) => sum + item.effectivePrice * item.quantity, 0)

    return NextResponse.json({
      items: formattedItems,
      subtotal,
      totalItems,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to load cart" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    const productId = body?.productId ? String(body.productId) : null
    const quantity = body?.quantity ? Math.max(1, Math.min(Number(body.quantity), 99)) : 1

    if (!productId) {
      return NextResponse.json({ error: "Product id is required" }, { status: 400 })
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        title: true,
        status: true,
        moderationStatus: true,
        price: true,
      },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    if (product.status !== "PUBLISHED" || product.moderationStatus !== "APPROVED") {
      return NextResponse.json({ error: "This product is not available" }, { status: 403 })
    }

    await prisma.cartItem.upsert({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
      create: {
        userId: session.user.id,
        productId,
        quantity,
      },
      update: {
        quantity: {
          increment: quantity,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to add item to cart" }, { status: 500 })
  }
}
