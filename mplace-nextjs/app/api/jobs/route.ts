import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get("slug")

    if (slug) {
      const job = await prisma.job.findUnique({
        where: { slug },
      })

      if (!job) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 })
      }

      return NextResponse.json(job)
    }

    const jobs = await prisma.job.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(jobs)
  } catch (error) {
    return NextResponse.json({ error: "Failed to load jobs" }, { status: 500 })
  }
}

