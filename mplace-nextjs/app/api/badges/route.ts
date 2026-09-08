import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    const where: any = {}
    if (type) {
      where.type = type
    }

    const badges = await prisma.badge.findMany({
      where,
      orderBy: {
        order: "asc",
      },
    })

    return NextResponse.json(badges)
  } catch (error) {
    return NextResponse.json({ error: "Failed to load badges" }, { status: 500 })
  }
}

