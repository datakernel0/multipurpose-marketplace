import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    const sortBy = searchParams.get("sortBy") || "date-desc" // date-desc, date-asc, price-low, price-high
    const skip = (page - 1) * limit

    // Build where clause
    const whereClause: any = {
      order: {
        userId: session.user.id,
        status: "COMPLETED",
      },
    }

    // Build orderBy clause
    let orderBy: any = {}
    if (sortBy === "date-desc") {
      orderBy = { order: { createdAt: "desc" } }
    } else if (sortBy === "date-asc") {
      orderBy = { order: { createdAt: "asc" } }
    } else if (sortBy === "price-low") {
      orderBy = { price: "asc" }
    } else if (sortBy === "price-high") {
      orderBy = { price: "desc" }
    } else {
      orderBy = { order: { createdAt: "desc" } }
    }

    // Get total count for pagination
    const totalCount = await prisma.orderItem.count({
      where: whereClause,
    })

    // Get user's purchases from OrderItems (completed orders) with pagination
    const orderItems = await prisma.orderItem.findMany({
      where: whereClause,
      include: {
        product: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
                image: true,
              },
            },
            reviews: {
              where: {
                userId: session.user.id,
              },
              select: {
                id: true,
                rating: true,
              },
            },
          },
        },
        order: {
          select: {
            createdAt: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    })

    // Format purchases
    const purchases = orderItems.map((item: any) => {
      const userReview = item.product.reviews[0]
      const hasReview = !!userReview

      return {
        id: item.id,
        title: item.product.title,
        description: item.product.description.substring(0, 100) + "...",
        image: item.product.images[0] || "/images/pur1.jpg",
        date: item.order.createdAt.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        license: "Regular", // TODO: Add license type to OrderItem or Product
        author: item.product.seller.name || "Unknown",
        authorId: item.product.seller.id,
        authorUsername: item.product.seller.username,
        category: {
          name: item.product.category.name,
          icon: item.product.category.image || "/images/catword.png",
        },
        price: `$${item.price.toFixed(2)}`,
        rating: userReview ? userReview.rating : null,
        isRated: hasReview,
        productId: item.product.id,
        productSlug: item.product.slug,
      }
    })

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      purchases,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to load purchases" }, { status: 500 })
  }
}
