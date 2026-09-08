import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const orderFilter = searchParams.get("order") || undefined

    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          userId: session.user.id,
          status: "COMPLETED",
        },
        ...(orderFilter ? { orderId: orderFilter } : {}),
      },
      orderBy: {
        order: { createdAt: "desc" },
      },
      select: {
        id: true,
        orderId: true,
        quantity: true,
        price: true,
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            downloadUrl: true,
            images: true,
          },
        },
        order: {
          select: {
            createdAt: true,
            totalAmount: true,
          },
        },
      },
    })

    const downloads = orderItems.map((item) => ({
      id: item.id,
      orderId: item.orderId,
      createdAt: item.order?.createdAt?.toISOString() ?? null,
      totalAmount: Number(item.order?.totalAmount ?? 0),
      quantity: item.quantity,
      price: Number(item.price ?? 0),
      product: item.product
        ? {
            id: item.product.id,
            title: item.product.title,
            slug: item.product.slug,
            downloadUrl: item.product.downloadUrl || null,
            image: Array.isArray(item.product.images) && item.product.images.length > 0 ? item.product.images[0] : null,
          }
        : null,
    }))

    return NextResponse.json({ downloads })
  } catch (error) {
    return NextResponse.json({ error: "Failed to load downloads" }, { status: 500 })
  }
}
