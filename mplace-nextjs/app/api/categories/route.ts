import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const parentId = searchParams.get("parentId")

    const categories = await prisma.category.findMany({
      where: parentId ? { parentId } : { parentId: null },
      include: {
        _count: {
          select: {
            products: {
              where: {
                status: "PUBLISHED",
                moderationStatus: "APPROVED",
              },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(categories)
  } catch (error) {
    return NextResponse.json({ error: "Failed to load categories" }, { status: 500 })
  }
}
