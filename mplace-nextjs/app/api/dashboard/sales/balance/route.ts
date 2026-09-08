import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { calculateSaleBalanceSummary } from "@/lib/salesBalance"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const summary = await calculateSaleBalanceSummary(session.user.id)
    const monthlySummary = await calculateSaleBalanceSummary(session.user.id, {})

    return NextResponse.json({
      ...summary,
      monthly: monthlySummary,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to load sale balance" }, { status: 500 })
  }
}
