import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { buildCategoryWhereClause } from "@/lib/blogCategories"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "10")
    const offset = parseInt(searchParams.get("offset") || "0")
    const slug = searchParams.get("slug")
    const search = searchParams.get("search") || searchParams.get("q")
    const category = searchParams.get("category")
    const authorId = searchParams.get("authorId")

    if (slug) {
      const blog = await prisma.blog.findUnique({
        where: { slug },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          comments: {
            where: {
              parentId: null, // Only top-level comments
            },
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
                orderBy: {
                  createdAt: "asc",
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      })

      if (!blog) {
        return NextResponse.json({ error: "Blog not found" }, { status: 404 })
      }

      return NextResponse.json(blog)
    }

    // Build where clause for filtering
    // Using Record<string, unknown> to allow flexible Prisma where clause construction
    const where: Record<string, unknown> = {}

    // Category-based search (uses same logic as category counting)
    if (category) {
      const categoryWhere = buildCategoryWhereClause(category)
      if (Object.keys(categoryWhere).length > 0) {
        Object.assign(where, categoryWhere)
      } else {
        // If category doesn't exist, return empty results
        return NextResponse.json({
          blogs: [],
          total: 0,
          limit,
          offset,
          hasMore: false,
        })
      }
    }
    
    // Regular search (can be combined with category)
    if (search && !category) {
      // Regular search
      where.OR = [
        { title: { contains: search, mode: "insensitive" as const } },
        { excerpt: { contains: search, mode: "insensitive" as const } },
        { content: { contains: search, mode: "insensitive" as const } },
      ]
    }

    if (authorId) {
      where.authorId = authorId
    }

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        take: limit,
        skip: offset,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          publishedAt: "desc",
        },
      }),
      prisma.blog.count({ where }),
    ])

    return NextResponse.json({
      blogs,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    })
  } catch (error) {
    console.error("Error fetching blogs:", error)
    return NextResponse.json({ error: "Failed to load blogs" }, { status: 500 })
  }
}

