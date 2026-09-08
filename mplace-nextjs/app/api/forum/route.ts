import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get("slug")

    if (slug) {
      const thread = await prisma.forumThread.findUnique({
        where: { slug },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
              replies: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      image: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              createdAt: "asc",
            },
          },
          lastAnswerUser: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      })

      if (!thread) {
        return NextResponse.json({ error: "Thread not found" }, { status: 404 })
      }

      return NextResponse.json(thread)
    }

    const threads = await prisma.forumThread.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        lastAnswerUser: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
      orderBy: [
        { isPinned: "desc" },
        { createdAt: "desc" },
      ],
    })

    return NextResponse.json(threads)
  } catch (error) {
    return NextResponse.json({ error: "Failed to load forum threads" }, { status: 500 })
  }
}

