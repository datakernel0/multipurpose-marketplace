import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

const DEFAULT_LIMIT = 12
type SortOption = "newest" | "trending" | "popular" | "best_seller" | "best_rating"

const ORDER_BY_MAP: Record<SortOption, any> = {
  newest: [{ createdAt: "desc" }],
  trending: [{ downloads: "desc" }, { createdAt: "desc" }],
  popular: [{ downloads: "desc" }, { createdAt: "desc" }],
  best_seller: [{ downloads: "desc" }, { createdAt: "desc" }],
  best_rating: [{ rating: "desc" }, { createdAt: "desc" }],
}

function normalizeMedia(path: string | null | undefined, fallback: string) {
  if (!path) return fallback
  if (path.startsWith("http://") || path.startsWith("https://")) return path
  return path.startsWith("/") ? path : `/${path}`
}

async function resolveAuthor(identifier: string) {
  let author = await prisma.user.findUnique({
    where: { username: identifier },
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
      bio: true,
      website: true,
      country: true,
      coverImage: true,
      createdAt: true,
      facebookUrl: true,
      twitterUrl: true,
      dribbbleUrl: true,
    },
  })

  if (!author) {
    author = await prisma.user.findUnique({
      where: { id: identifier },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        bio: true,
        website: true,
        country: true,
        coverImage: true,
        createdAt: true,
        facebookUrl: true,
        twitterUrl: true,
        dribbbleUrl: true,
      },
    })
  }

  return author
}

async function buildAuthorSummary(authorId: string) {
  const [totalItems, totalSales, reviews, followers, following] = await Promise.all([
    prisma.product.count({
      where: { sellerId: authorId, status: "PUBLISHED", moderationStatus: "APPROVED" },
    }),
    prisma.orderItem.count({
      where: { product: { sellerId: authorId } },
    }),
    prisma.review.findMany({
      where: { product: { sellerId: authorId } },
      select: { rating: true },
    }),
    prisma.follow.count({ where: { followingId: authorId } }),
    prisma.follow.count({ where: { followerId: authorId } }),
  ])

  const ratingCount = reviews.length
  const ratingAverage =
    ratingCount > 0
      ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / ratingCount).toFixed(2))
      : 0

  const badges: Array<{ icon: string; title: string }> = []
  if (totalSales >= 10000) {
    badges.push({ icon: "/images/svg/author_level_3.svg", title: "Has sold more than $10k" })
  } else if (totalSales >= 1000) {
    badges.push({ icon: "/images/svg/author_level_2.svg", title: "Has sold more than $1k" })
  }
  if (totalItems >= 100) {
    badges.push({ icon: "/images/svg/author_rank_diamond.svg", title: "Diamnond Author" })
  } else if (totalItems >= 50) {
    badges.push({ icon: "/images/svg/author_rank_gold.svg", title: "Gold Author" })
  }
  if (ratingAverage >= 4.5 && ratingCount >= 10) {
    badges.push({ icon: "/images/svg/recommended.svg", title: "Highly Recommended" })
  }

  return {
    totalItems,
    totalSales,
    totalRatings: ratingAverage,
    ratingCount,
    followers,
    following,
    badges,
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const viewerId = session?.user?.id ?? null

    const { username } = await params
    const identifier = username ? decodeURIComponent(username) : ""
    if (!identifier) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    const author = await resolveAuthor(identifier)
    if (!author) {
      return NextResponse.json({ error: "Author not found" }, { status: 404 })
    }

    const url = new URL(request.url)
    const pageParam = parseInt(url.searchParams.get("page") || "1", 10)
    const categoryParam = (url.searchParams.get("category") || "").trim()
    const sortParam = (url.searchParams.get("sortBy") || "newest").trim().toLowerCase() as SortOption
    const limitParam = parseInt(url.searchParams.get("limit") || String(DEFAULT_LIMIT), 10)

    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 24) : DEFAULT_LIMIT
    const skip = (page - 1) * limit

    const sortKey: SortOption = ORDER_BY_MAP[sortParam] ? sortParam : "newest"

    const where: any = {
      sellerId: author.id,
      status: "PUBLISHED",
      moderationStatus: "APPROVED",
    }

    if (categoryParam) {
      const catLower = categoryParam.toLowerCase()
      where.category = {
        OR: [{ slug: catLower }, { name: { equals: categoryParam, mode: "insensitive" } }],
      }
    }

    const totalProducts = await prisma.product.count({ where })

    const products = await prisma.product.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, slug: true, image: true } },
        seller: { select: { id: true, name: true, username: true, image: true } },
        reviews: { select: { rating: true } },
        _count: { select: { favorites: true, orderItems: true } },
      },
      orderBy: ORDER_BY_MAP[sortKey],
      skip,
      take: limit,
    })

    const formattedProducts = products.map((product) => {
      const rating =
        product.reviews.length > 0
          ? Number(
              (
                product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
              ).toFixed(2)
            )
          : product.rating ?? 0

      return {
        id: product.id,
        slug: product.slug,
        title: product.title,
        description: product.description,
        image: normalizeMedia(product.images?.[0] ?? null, "/images/p1.jpg"),
        price: product.price,
        salePrice: product.salePrice,
        favorites: product._count.favorites,
        sales: product._count.orderItems,
        rating,
        category: {
          id: product.category?.id,
          name: product.category?.name ?? "Uncategorized",
          slug: product.category?.slug,
          icon: product.category?.image ? normalizeMedia(product.category.image, "/images/cathtm.png") : null,
        },
        author: {
          id: product.seller?.id,
          name: product.seller?.name ?? "Unknown",
          username: product.seller?.username,
          avatar: normalizeMedia(product.seller?.image, "/images/auth.jpg"),
        },
        createdAt: product.createdAt,
      }
    })

    const categoryBreakdown = await prisma.product.groupBy({
      by: ["categoryId"],
      where: { sellerId: author.id, status: "PUBLISHED", moderationStatus: "APPROVED" },
      _count: { _all: true },
    })
    const categoryIds = categoryBreakdown.map((entry) => entry.categoryId)
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true, slug: true, image: true },
    })

    const formattedCategories = categoryBreakdown
      .map((entry) => {
        const category = categories.find((cat) => cat.id === entry.categoryId)
        if (!category) return null
        return {
          id: category.id,
          name: category.name,
          slug: category.slug,
          icon: category.image ? normalizeMedia(category.image, "/images/cathtm.png") : null,
          count: entry._count._all,
        }
      })
      .filter((cat): cat is NonNullable<typeof cat> => Boolean(cat))
      .sort((a, b) => b.count - a.count)

    const summary = await buildAuthorSummary(author.id)

    let viewerFollowsAuthor = false
    let viewerIsAuthor = false
    if (viewerId) {
      viewerIsAuthor = viewerId === author.id
      if (!viewerIsAuthor) {
        const follow = await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: viewerId,
              followingId: author.id,
            },
          },
          select: { id: true },
        })
        viewerFollowsAuthor = !!follow
      }
    }

    return NextResponse.json({
      author: {
        id: author.id,
        name: author.name ?? "Unknown Author",
        username: author.username,
        avatar: normalizeMedia(author.image, "/images/author-avatar.jpg"),
        coverImage: normalizeMedia(author.coverImage, "/images/dashboard_banner.jpg"),
        signedUp: author.createdAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "2-digit" }),
        bio: author.bio,
        website: author.website,
        country: author.country,
        facebookUrl: author.facebookUrl,
        twitterUrl: author.twitterUrl,
        dribbbleUrl: author.dribbbleUrl,
        viewerFollowsAuthor,
        viewerIsAuthor,
        ...summary,
      },
      items: formattedProducts,
      categories: formattedCategories,
      pagination: {
        page,
        limit,
        total: totalProducts,
        totalPages: Math.max(1, Math.ceil(totalProducts / limit)),
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to load author items" }, { status: 500 })
  }
}

