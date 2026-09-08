import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get("slug")
    const featured = searchParams.get("featured")

    if (slug) {
      const event = await prisma.event.findUnique({
        where: { slug },
        include: {
          speakers: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      })

      if (!event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 })
      }

      return NextResponse.json(event)
    }

    const where: any = {}
    if (featured === "true") {
      where.featured = true
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        speakers: {
          take: 3,
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(events)
  } catch (error) {
    return NextResponse.json({ error: "Failed to load events" }, { status: 500 })
  }
}

