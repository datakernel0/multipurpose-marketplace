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

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        totalAmount: true,
        createdAt: true,
        paymentMethod: true,
        paymentStatus: true,
        orderItems: {
          select: {
            id: true,
            quantity: true,
            price: true,
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
                images: true,
              },
            },
          },
        },
      },
    })

    const formatted = orders.map((order) => ({
      id: order.id,
      totalAmount: Number(order.totalAmount ?? 0),
      createdAt: order.createdAt.toISOString(),
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      items: order.orderItems.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        price: Number(item.price ?? 0),
        product: item.product
          ? {
              id: item.product.id,
              title: item.product.title,
              slug: item.product.slug,
              image: Array.isArray(item.product.images) && item.product.images.length > 0 ? item.product.images[0] : null,
            }
          : null,
      })),
    }))

    return NextResponse.json({ orders: formatted })
  } catch (error) {
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500 })
  }
}
