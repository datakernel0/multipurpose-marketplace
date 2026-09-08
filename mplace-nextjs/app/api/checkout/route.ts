import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

function buildReference(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const {
      productId,
      paymentMethod,
      billing,
      cartCheckout,
    } = body as {
      productId?: string
      paymentMethod?: string
      billing?: Record<string, any>
      cartCheckout?: boolean
    }

    const firstName = billing?.firstName?.trim()
    const lastName = billing?.lastName?.trim()
    const email = billing?.email?.trim()

    if (!firstName || !lastName || !email) {
      return NextResponse.json({ error: "First name, last name, and email are required" }, { status: 400 })
    }

    const userId = session.user.id

    let itemsToPurchase: Array<{
      productId: string
      quantity: number
      price: number
    }> = []

    if (cartCheckout) {
      const cartItems = await prisma.cartItem.findMany({
        where: { userId },
        include: {
          product: {
            select: {
              id: true,
              price: true,
              salePrice: true,
              status: true,
              moderationStatus: true,
            },
          },
        },
      })

      if (cartItems.length === 0) {
        return NextResponse.json({ error: "Your cart is empty" }, { status: 400 })
      }

      for (const cartItem of cartItems) {
        const product = cartItem.product
        if (!product || product.status !== "PUBLISHED" || product.moderationStatus !== "APPROVED") {
          return NextResponse.json({ error: "One of the products in your cart is unavailable" }, { status: 400 })
        }
        const regularPrice = Number(product.price)
        const salePrice = product.salePrice !== null ? Number(product.salePrice) : null
        const effectivePrice = salePrice !== null && salePrice < regularPrice ? salePrice : regularPrice
        itemsToPurchase.push({
          productId: product.id,
          quantity: cartItem.quantity,
          price: effectivePrice,
        })
      }
    } else {
      if (!productId || typeof productId !== "string") {
        return NextResponse.json({ error: "Product id is required" }, { status: 400 })
      }

      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: {
          id: true,
          price: true,
          salePrice: true,
          status: true,
          moderationStatus: true,
        },
      })

      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 })
      }

      if (product.status !== "PUBLISHED" || product.moderationStatus !== "APPROVED") {
        return NextResponse.json({ error: "Product is not available for purchase" }, { status: 403 })
      }

      const regularPrice = Number(product.price)
      const salePrice = product.salePrice !== null ? Number(product.salePrice) : null
      const effectivePrice = salePrice !== null && salePrice < regularPrice ? salePrice : regularPrice

      itemsToPurchase.push({ productId: product.id, quantity: 1, price: effectivePrice })
    }

    const subtotal = itemsToPurchase.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const estimatedTaxes = Number((subtotal * 0.05).toFixed(2))
    const totalAmount = Number((subtotal + estimatedTaxes).toFixed(2))

    const order = await prisma.$transaction(async (tx) => {
      const creditAggregate = await tx.credit.aggregate({
        where: { userId },
        _sum: { amount: true },
      })

      const availableCredits = Number(creditAggregate._sum.amount || 0)

      if (availableCredits < totalAmount) {
        throw new Error("INSUFFICIENT_CREDIT")
      }

      const creditReference = buildReference("CRD-PUR")

      const createdOrder = await tx.order.create({
        data: {
          userId,
          totalAmount,
          paymentMethod: paymentMethod || "CREDIT",
          paymentStatus: "PAID",
          status: "COMPLETED",
          billingFirstName: firstName,
          billingLastName: lastName,
          billingCompany: billing?.company || null,
          billingEmail: email,
          billingCountry: billing?.country || null,
          billingAddress1: billing?.address1 || null,
          billingAddress2: billing?.address2 || null,
          billingCity: billing?.city || null,
          billingPostalCode: billing?.postalCode || null,
          orderItems: {
            create: itemsToPurchase.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        select: {
          id: true,
          totalAmount: true,
          createdAt: true,
        },
      })

      await Promise.all(
        itemsToPurchase.map((item) =>
          tx.product.update({
            where: { id: item.productId },
            data: {
              downloads: {
                increment: item.quantity,
              },
            },
          })
        )
      )

      await tx.credit.create({
        data: {
          userId,
          amount: -totalAmount,
          paymentMethod: "credit",
          reference: creditReference,
          source: "PURCHASE",
        },
      })

      await tx.statement.create({
        data: {
          userId,
          amount: -totalAmount,
          type: "purchase",
          description: `Purchase order ${createdOrder.id}`,
        },
      })

      if (cartCheckout) {
        await tx.cartItem.deleteMany({ where: { userId } })
      } else if (itemsToPurchase.length === 1) {
        await tx.cartItem.deleteMany({
          where: {
            userId,
            productId: itemsToPurchase[0].productId,
          },
        })
      }

      return createdOrder
    })

    return NextResponse.json({ success: true, orderId: order.id })
  } catch (error) {
    if (error instanceof Error && error.message === "INSUFFICIENT_CREDIT") {
      return NextResponse.json({ error: "Insufficient MartPlace credits. Please add more credits to complete your purchase." }, { status: 402 })
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: "Failed to complete checkout" }, { status: 500 })
  }
}
