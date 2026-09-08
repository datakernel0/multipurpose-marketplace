import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const features = await prisma.careerFeature.findMany({
      orderBy: {
        order: "asc",
      },
    })

    return NextResponse.json(features)
  } catch (error) {
    return NextResponse.json({ error: "Failed to load career features" }, { status: 500 })
  }
}

