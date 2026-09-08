import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { productId } = await params
    if (!productId) {
      return NextResponse.json({ error: "Product id is required" }, { status: 400 })
    }

    const body = await request.json().catch(() => null)
    const quantity = body?.quantity !== undefined ? Number(body.quantity) : NaN

    if (!Number.isFinite(quantity)) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 })
    }

    if (quantity <= 0) {
      await prisma.cartItem.deleteMany({
        where: {
          userId: session.user.id,
          productId,
        },
      })
      return NextResponse.json({ success: true })
    }

    const sanitizedQuantity = Math.max(1, Math.min(Math.floor(quantity), 99))

    await prisma.cartItem.update({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
      data: {
        quantity: sanitizedQuantity,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update cart item" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { productId } = await params
    if (!productId) {
      return NextResponse.json({ error: "Product id is required" }, { status: 400 })
    }

    await prisma.cartItem.deleteMany({
      where: {
        userId: session.user.id,
        productId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to remove cart item" }, { status: 500 })
  }
}
