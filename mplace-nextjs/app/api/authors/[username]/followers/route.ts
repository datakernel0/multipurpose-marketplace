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

function normalizeImagePath(image: string | null | undefined, fallback: string) {
  if (!image) return fallback
  if (image.startsWith("http://") || image.startsWith("https://")) return image
  return image.startsWith("/") ? image : `/${image}`
}

function formatMemberSince(date: Date | null | undefined, country?: string | null) {
  if (!date) return country ? `Member Since: ${country}` : "Member Since: Unknown"
  const formatted = date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  return country ? `Member Since: ${formatted} ${country}` : `Member Since: ${formatted}`
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
  const [totalItems, totalSales, reviews, followersCount, followingCount] = await Promise.all([
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
    prisma.follow.count({ where: { followingId: authorId } }),
    prisma.follow.count({ where: { followerId: authorId } }),
  ])

  const totalRatings = reviews.length
  const ratingAverage =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0

  const badges: Array<{ icon: string; title: string }> = []

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
  if (ratingAverage >= 4.5 && totalRatings >= 10) {
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

  return {
    totalItems,
    totalSales,
    totalRatings: ratingAverage,
    ratingCount: totalRatings,
    followers: followersCount,
    following: followingCount,
    badges,
  }
}

async function buildStatsMap(userIds: string[]) {
  if (userIds.length === 0) return new Map<string, { items: number; sales: number; ratingSum: number; ratingCount: number }>()

  const products = await prisma.product.findMany({
    where: {
      sellerId: { in: userIds },
      status: "PUBLISHED",
    },
    select: {
      sellerId: true,
      _count: { select: { orderItems: true } },
      reviews: { select: { rating: true } },
    },
  })

  const statsMap = new Map<string, { items: number; sales: number; ratingSum: number; ratingCount: number }>()

  for (const product of products) {
    const entry =
      statsMap.get(product.sellerId) ??
      { items: 0, sales: 0, ratingSum: 0, ratingCount: 0 }

    entry.items += 1
    entry.sales += product._count.orderItems
    entry.ratingSum += product.reviews.reduce((sum, review) => sum + review.rating, 0)
    entry.ratingCount += product.reviews.length

    statsMap.set(product.sellerId, entry)
  }

  return statsMap
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
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 50) : DEFAULT_LIMIT
    const skip = (page - 1) * limit

    const totalFollowers = await prisma.follow.count({
      where: { followingId: author.id },
    })

    const followerRecords = await prisma.follow.findMany({
      where: { followingId: author.id },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        follower: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            createdAt: true,
            country: true,
          },
        },
      },
    })

    const followerIds = followerRecords
      .map((record) => record.follower?.id)
      .filter((id): id is string => Boolean(id))

    const statsMap = await buildStatsMap(followerIds)

    let viewerFollowSet = new Set<string>()
    if (viewerId && followerIds.length > 0) {
      const viewerFollows = await prisma.follow.findMany({
        where: {
          followerId: viewerId,
          followingId: { in: followerIds },
        },
        select: { followingId: true },
      })
      viewerFollowSet = new Set(viewerFollows.map((follow) => follow.followingId))
    }

    const followers = followerRecords
      .map((record) => {
        const follower = record.follower
        if (!follower) return null

        const stats = statsMap.get(follower.id) ?? { items: 0, sales: 0, ratingSum: 0, ratingCount: 0 }
        const rating =
          stats.ratingCount > 0 ? Number((stats.ratingSum / stats.ratingCount).toFixed(2)) : 0

        return {
          id: follower.id,
          name: follower.name || "Unknown Author",
          username: follower.username,
          avatar: normalizeImagePath(follower.image, "/images/m1.png"),
          memberSince: formatMemberSince(follower.createdAt, follower.country),
          items: stats.items,
          sales: stats.sales,
          rating,
          ratingCount: stats.ratingCount,
          isFollowing: viewerId ? viewerFollowSet.has(follower.id) : false,
        }
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item))

    const authorSummary = await getAuthorSummary(author.id)

    let viewerFollowsAuthor = false
    if (viewerId && viewerId !== author.id) {
      const followRecord = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: viewerId,
            followingId: author.id,
          },
        },
        select: { followerId: true },
      })
      viewerFollowsAuthor = !!followRecord
    }

    return NextResponse.json({
      author: {
        id: author.id,
        name: author.name || "Unknown Author",
        username: author.username,
        avatar: normalizeImagePath(author.image, "/images/author-avatar.jpg"),
        coverImage: normalizeImagePath(author.coverImage, "/images/dashboard_banner.jpg"),
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
        ...authorSummary,
        viewerFollowsAuthor,
        viewerIsAuthor: viewerId === author.id,
      },
      followers,
      pagination: {
        page,
        limit,
        total: totalFollowers,
        totalPages: Math.max(1, Math.ceil(totalFollowers / limit)),
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to load followers" }, { status: 500 })
  }
}

