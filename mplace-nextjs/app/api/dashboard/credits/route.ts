import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { calculateSaleBalanceSummary } from "@/lib/salesBalance"

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  mastercard: "Mastercard",
  visa: "Visa",
  paypal: "PayPal",
  discover: "Discover",
  amex: "American Express",
  manual: "Manual Credit",
}

const MAX_CREDIT_AMOUNT = 10000

function formatMethod(method: string | null | undefined, source?: string | null) {
  if (source === "SALE_CONVERSION") {
    return "Sale Balance"
  }
  if (source === "PURCHASE") {
    return "Purchase"
  }
  if (!method) return "Unknown"
  return PAYMENT_METHOD_LABELS[method] || method
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [aggregate, recentCreditsRaw] = await Promise.all([
      prisma.credit.aggregate({
        where: { userId: session.user.id },
        _sum: { amount: true },
      }),
      prisma.credit.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 10,
      }) as Promise<any[]>,
    ])

    const totalCredits = aggregate._sum.amount ?? 0

    let saleSummary = {
      saleBalance: 0,
      saleBalanceWithdrawn: 0,
      saleBalanceConverted: 0,
      saleBalanceAvailable: 0,
    }

    try {
      saleSummary = await calculateSaleBalanceSummary(session.user.id)
    } catch (saleError) {
    }

    return NextResponse.json({
      balance: totalCredits,
      totalCredits,
      recentCredits: recentCreditsRaw.map((credit: any) => ({
        ...credit,
        paymentMethodLabel: formatMethod(credit.paymentMethod, credit.source),
      })),
      saleBalance: saleSummary?.saleBalance,
      saleBalanceWithdrawn: saleSummary?.saleBalanceWithdrawn,
      saleBalanceConverted: saleSummary?.saleBalanceConverted,
      saleBalanceAvailable: saleSummary?.saleBalanceAvailable,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to load credit summary" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    const rawAmount = body?.amount
    const paymentMethod = typeof body?.paymentMethod === "string" ? body.paymentMethod : null
    const note = typeof body?.note === "string" ? body.note.trim() : ""

    const amount = typeof rawAmount === "string" || typeof rawAmount === "number" ? Number(rawAmount) : NaN

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Please provide a valid credit amount" }, { status: 400 })
    }

    if (amount > MAX_CREDIT_AMOUNT) {
      return NextResponse.json({ error: `Credit amount cannot exceed $${MAX_CREDIT_AMOUNT.toLocaleString()}` }, { status: 400 })
    }

    if (!paymentMethod || (!PAYMENT_METHOD_LABELS[paymentMethod] && paymentMethod !== "manual")) {
      return NextResponse.json({ error: "Please select a supported payment method" }, { status: 400 })
    }

    const normalizedAmount = Math.round(Number(amount) * 100) / 100
    const reference = `CR-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`
    const methodLabel = PAYMENT_METHOD_LABELS[paymentMethod] || "Manual Credit"

    const creditData: any = {
      userId: session.user.id,
      amount: normalizedAmount,
      paymentMethod,
      reference,
      source: "MANUAL",
    }

    const [creditRaw] = await prisma.$transaction([
      prisma.credit.create({
        data: creditData,
      }) as any,
      prisma.statement.create({
        data: {
          userId: session.user.id,
          amount: normalizedAmount,
          type: "credited",
          description: note ? note : `Credit added via ${methodLabel}`,
        },
      }),
    ])

    const aggregate = await prisma.credit.aggregate({
      where: { userId: session.user.id },
      _sum: { amount: true },
    })

    const balance = aggregate._sum.amount ?? 0

    return NextResponse.json({
      success: true,
      credit: {
        id: creditRaw.id,
        amount: creditRaw.amount,
        paymentMethod: creditRaw.paymentMethod,
        source: creditRaw.source,
        reference: creditRaw.reference,
        createdAt: creditRaw.createdAt,
        paymentMethodLabel: methodLabel,
      },
      balance,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to add credit" }, { status: 500 })
  }
}
