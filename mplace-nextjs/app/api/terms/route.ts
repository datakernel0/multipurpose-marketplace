import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const terms = await prisma.termCondition.findMany({
      orderBy: {
        order: "asc",
      },
    })

    return NextResponse.json(terms)
  } catch (error) {
    console.error("Error fetching terms:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

