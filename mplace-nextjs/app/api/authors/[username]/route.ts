import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params

    const identifier = decodeURIComponent(username || "").trim()

    if (!identifier) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    const authorSelect = {
      id: true,
      name: true,
      email: true,
      image: true,
      username: true,
      bio: true,
      profileHeading: true,
      website: true,
      country: true,
      coverImage: true,
      createdAt: true,
      facebookUrl: true,
      twitterUrl: true,
      behanceUrl: true,
      dribbbleUrl: true,
    } as const

    // Try to find user by username first, then fallback to id lookup
    let author = await prisma.user.findUnique({
      where: { username: identifier },
      select: authorSelect,
    })

    if (!author) {
      author = await prisma.user.findUnique({
        where: { id: identifier },
        select: authorSelect,
      })
    }

    if (!author) {
      return NextResponse.json({ error: "Author not found" }, { status: 404 })
    }

    // Get author stats
    const [totalItems, totalSales, reviews] = await Promise.all([
      prisma.product.count({
        where: { sellerId: author.id, status: "PUBLISHED" },
      }),
      prisma.orderItem.count({
        where: {
          product: {
            sellerId: author.id,
          },
        },
      }),
      prisma.review.findMany({
        where: {
          product: {
            sellerId: author.id,
          },
        },
        select: {
          rating: true,
        },
      }),
    ])

    // Calculate average rating
    const totalRatings = reviews.length
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum: number, review: { rating: number }) => sum + review.rating, 0) / reviews.length
        : 0

    // Get author's newest products (limit 6)
    const products = await prisma.product.findMany({
      where: {
        sellerId: author.id,
        status: "PUBLISHED",
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
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
          select: {
            rating: true,
          },
        },
        favorites: {
          select: {
            id: true,
          },
        },
        orderItems: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 6,
    })

    // Format products
    const formattedProducts = products.map((product: any) => {
      const productRating =
        product.reviews.length > 0
          ? product.reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / product.reviews.length
          : 0

      return {
        id: product.id,
        slug: product.slug,
        title: product.title,
        description: product.description,
        image: product.images[0] || "/images/p4.jpg",
        price: product.price,
        salePrice: product.salePrice,
        livePreviewUrl: product.livePreviewUrl || null,
        author: {
          name: product.seller.name || "Unknown",
          avatar: product.seller.image || "/images/auth3.jpg",
          username: product.seller.username,
        },
        category: {
          name: product.category.name,
          icon: product.category.image || "/images/cathtm.png",
        },
        rating: productRating,
        favorites: product.favorites.length,
        sales: product.orderItems.length,
      }
    })

    // Get followers and following counts
    const [followersCount, followingCount] = await Promise.all([
      prisma.follow.count({
        where: { followingId: author.id },
      }),
      prisma.follow.count({
        where: { followerId: author.id },
      }),
    ])

    // Get author badges based on achievements
    const badges: any[] = []
    
    // Badge logic based on achievements
    if (totalSales >= 10000) {
      badges.push({
        icon: "/images/svg/author_level_3.svg",
        title: "Has sold more than $10k",
      })
    }
    if (totalSales >= 1000) {
      badges.push({
        icon: "/images/svg/author_level_2.svg",
        title: "Has sold more than $1k",
      })
    }
    if (totalItems >= 100) {
      badges.push({
        icon: "/images/svg/author_rank_diamond.svg",
        title: "Diamond Author",
      })
    }
    if (totalItems >= 50) {
      badges.push({
        icon: "/images/svg/author_rank_gold.svg",
        title: "Gold Author",
      })
    }
    if (averageRating >= 4.5 && totalRatings >= 10) {
      badges.push({
        icon: "/images/svg/recommended.svg",
        title: "Highly Rated Author",
      })
    }
    if (followersCount >= 100) {
      badges.push({
        icon: "/images/svg/featured_author.svg",
        title: "Popular Author",
      })
    }

    return NextResponse.json({
      author: {
        ...author,
        signedUp: author.createdAt.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        totalItems,
        totalSales,
        totalRatings: averageRating,
        ratingCount: totalRatings,
        followers: followersCount,
        following: followingCount,
        badges,
        about: author.bio, // Map bio to about for consistency
      },
      products: formattedProducts,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to load author" }, { status: 500 })
  }
}
