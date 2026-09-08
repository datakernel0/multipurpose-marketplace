import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { calculateSaleBalanceSummary } from "@/lib/salesBalance"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    const rawAmount = body?.amount
    const amount = typeof rawAmount === "string" || typeof rawAmount === "number" ? Number(rawAmount) : NaN

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Please enter a valid amount" }, { status: 400 })
    }

    let saleSummary
    try {
      saleSummary = await calculateSaleBalanceSummary(session.user.id)
    } catch (summaryError) {
      return NextResponse.json({ error: "Unable to load sale balance. Please try again later." }, { status: 500 })
    }
    const available = saleSummary.saleBalanceAvailable

    if (amount > available) {
      return NextResponse.json({ error: "Amount exceeds available sale balance" }, { status: 400 })
    }

    const normalizedAmount = Math.round(amount * 100) / 100
    const reference = `SC-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`

    const [credit] = await prisma.$transaction([
      prisma.credit.create({
        data: {
          userId: session.user.id,
          amount: normalizedAmount,
          paymentMethod: "sale_balance",
          reference,
          source: "SALE_CONVERSION",
        },
        select: {
          id: true,
          amount: true,
          paymentMethod: true,
          source: true,
          reference: true,
          createdAt: true,
        },
      }),
      prisma.statement.create({
        data: {
          userId: session.user.id,
          amount: normalizedAmount,
          type: "credited",
          description: "Converted from sale balance",
        },
      }),
    ])

    const aggregate = await prisma.credit.aggregate({
      where: { userId: session.user.id },
      _sum: { amount: true },
    })

    const updatedSaleSummary = await calculateSaleBalanceSummary(session.user.id)

    return NextResponse.json({
      success: true,
      credit,
      balance: aggregate._sum.amount ?? 0,
      saleBalance: updatedSaleSummary,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to convert sale balance" }, { status: 500 })
  }
}
