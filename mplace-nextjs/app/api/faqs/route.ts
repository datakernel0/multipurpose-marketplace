import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    const where: any = {}
    if (category) {
      where.category = category
    }

    const faqs = await prisma.fAQ.findMany({
      where,
      orderBy: {
        order: "asc",
      },
    })

    return NextResponse.json(faqs)
  } catch (error) {
    return NextResponse.json({ error: "Failed to load FAQs" }, { status: 500 })
  }
}

