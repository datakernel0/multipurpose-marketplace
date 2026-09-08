import { prisma } from "@/lib/prisma"

const WITHDRAWAL_HELD_STATUSES = ["PENDING", "APPROVED", "PROCESSED"] as const

export type SaleBalanceSummary = {
  saleBalance: number
  saleBalanceWithdrawn: number
  saleBalanceConverted: number
  saleBalanceAvailable: number
  saleBalanceMonthly?: number
}

function calculateDateRangeForMonth(year: number, month: number) {
  const start = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0))
  const end = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0, 0))
  return { start, end }
}

export async function calculateSaleBalanceSummary(
  userId: string,
  options?: { month?: number; year?: number },
): Promise<SaleBalanceSummary> {
  const now = new Date()
  const targetMonth =
    typeof options?.month === "number" && options.month >= 0 && options.month <= 11 ? options.month : now.getUTCMonth()
  const targetYear = typeof options?.year === "number" && options.year >= 2000 ? options.year : now.getUTCFullYear()
  const { start, end } = calculateDateRangeForMonth(targetYear, targetMonth)

  const [orderItems, withdrawalAggregate, conversionAggregate] = await Promise.all([
    prisma.orderItem.findMany({
      where: {
        product: { sellerId: userId },
        order: {
          status: "COMPLETED",
          paymentStatus: { in: ["PAID", "COMPLETED", "SETTLED"] },
          createdAt: {
            gte: start,
            lt: end,
          },
        },
      },
      select: {
        price: true,
        quantity: true,
      },
    }),
    prisma.withdrawal.aggregate({
      where: {
        userId,
        status: { in: [...WITHDRAWAL_HELD_STATUSES] },
      },
      _sum: { amount: true },
    }),
    prisma.credit.aggregate({
      where: {
        userId,
        source: "SALE_CONVERSION",
      },
      _sum: { amount: true },
    }),
  ])

  const totalSales = orderItems.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity ?? 1), 0)
  const withdrawn = withdrawalAggregate._sum.amount ?? 0
  const converted = conversionAggregate._sum.amount ?? 0
  const available = Math.max(totalSales - withdrawn - converted, 0)

  return {
    saleBalance: Number(totalSales.toFixed(2)),
    saleBalanceWithdrawn: Number(withdrawn.toFixed(2)),
    saleBalanceConverted: Number(converted.toFixed(2)),
    saleBalanceAvailable: Number(available.toFixed(2)),
    saleBalanceMonthly: Number(totalSales.toFixed(2)),
  }
}
