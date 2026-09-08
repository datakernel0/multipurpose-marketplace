import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

const DEFAULT_LIMIT = 12

const authorSelect = {
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
} as const

function normalizeMedia(path: string | null | undefined, fallback: string) {
  if (!path) return fallback
  if (path.startsWith("http://") || path.startsWith("https://")) return path
  return path.startsWith("/") ? path : `/${path}`
}

async function resolveAuthor(identifier: string) {
  if (!identifier) return null

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

  return author
}

async function getAuthorSummary(authorId: string) {
  const [totalItems, totalSales, reviews] = await Promise.all([
    prisma.product.count({
      where: { sellerId: authorId, status: "PUBLISHED" },
    }),
    prisma.orderItem.count({
      where: { product: { sellerId: authorId } },
    }),
    prisma.review.findMany({
      where: { product: { sellerId: authorId } },
      select: { rating: true },
    }),
  ])

  const ratingCount = reviews.length
  const ratingAverage =
    ratingCount > 0
      ? Number(
          (
            reviews.reduce((sum, review) => sum + review.rating, 0) /
            ratingCount
          ).toFixed(2)
        )
      : 0

  const badges: Array<{ icon: string; title: string }> = []

  if (totalSales >= 10000) {
    badges.push({ icon: "/images/svg/author_level_3.svg", title: "Has sold more than $10k" })
  } else if (totalSales >= 1000) {
    badges.push({ icon: "/images/svg/author_level_2.svg", title: "Has sold more than $1k" })
  }

  if (totalItems >= 100) {
    badges.push({ icon: "/images/svg/author_rank_diamond.svg", title: "Diamond Author" })
  } else if (totalItems >= 50) {
    badges.push({ icon: "/images/svg/author_rank_gold.svg", title: "Gold Author" })
  }

  if (ratingAverage >= 4.5 && ratingCount >= 10) {
    badges.push({ icon: "/images/svg/recommended.svg", title: "Highly Rated Author" })
  }

  const [followers, following] = await Promise.all([
    prisma.follow.count({ where: { followingId: authorId } }),
    prisma.follow.count({ where: { followerId: authorId } }),
  ])

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
    const identifier = decodeURIComponent(username || "").trim()

    if (!identifier) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    const author = await resolveAuthor(identifier)
    if (!author) {
      return NextResponse.json({ error: "Author not found" }, { status: 404 })
    }

    const url = new URL(request.url)
    const pageParam = parseInt(url.searchParams.get("page") || "1", 10)
    const limitParam = parseInt(url.searchParams.get("limit") || String(DEFAULT_LIMIT), 10)

    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 24) : DEFAULT_LIMIT
    const skip = (page - 1) * limit

    const reviewWhere = {
      product: {
        sellerId: author.id,
      },
    }

    const totalReviews = await prisma.review.count({ where: reviewWhere })

    const reviews = await prisma.review.findMany({
      where: reviewWhere,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
          },
        },
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            images: true,
            category: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    })

    const formattedReviews = reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt.toISOString(),
      reviewer: {
        id: review.user?.id,
        name: review.user?.name || "Anonymous",
        username: review.user?.username,
        avatar: normalizeMedia(review.user?.image, "/images/m1.png"),
      },
      product: {
        id: review.product.id,
        title: review.product.title,
        slug: review.product.slug,
        image: normalizeMedia(review.product.images?.[0] ?? null, "/images/p1.jpg"),
        category: review.product.category?.name || null,
      },
    }))

    const summary = await getAuthorSummary(author.id)

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
        name: author.name,
        username: author.username,
        avatar: normalizeMedia(author.image, "/images/author-avatar.jpg"),
        coverImage: normalizeMedia(author.coverImage, "/images/dashboard_banner.jpg"),
        signedUp: author.createdAt.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        bio: author.bio,
        website: author.website,
        country: author.country,
        facebookUrl: author.facebookUrl,
        twitterUrl: author.twitterUrl,
        dribbbleUrl: author.dribbbleUrl,
        viewerIsAuthor,
        viewerFollowsAuthor,
        ...summary,
      },
      reviews: formattedReviews,
      pagination: {
        page,
        limit,
        total: totalReviews,
        totalPages: Math.max(1, Math.ceil(totalReviews / limit)),
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to load author reviews" }, { status: 500 })
  }
}
