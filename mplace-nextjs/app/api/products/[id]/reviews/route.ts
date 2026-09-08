import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

async function resolveSession() {
  return getServerSession(authOptions)
}

async function ensureProductAvailable(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      moderationStatus: true,
    },
  })

  if (!product) {
    return { error: { status: 404, body: { error: "Product not found" } } }
  }

  if (product.status !== "PUBLISHED" || product.moderationStatus !== "APPROVED") {
    return { error: { status: 403, body: { error: "Reviews not available for this product" } } }
  }

  return { product }
}

async function userCanReview(productId: string, userId: string) {
  const orderItem = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: {
        userId,
        status: "COMPLETED",
      },
    },
    select: { id: true },
  })

  if (orderItem) {
    return true
  }

  const paidOrderItem = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: {
        userId,
        paymentStatus: "PAID",
      },
    },
    select: { id: true },
  })

  return Boolean(paidOrderItem)
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: "Product id is required" }, { status: 400 })
    }

    const availability = await ensureProductAvailable(id)
    if (availability.error) {
      return NextResponse.json(availability.error.body, { status: availability.error.status })
    }

    const url = new URL(request.url)
    const pageParam = Number(url.searchParams.get("page") || "1")
    const limitParam = Number(url.searchParams.get("limit") || "5")

    const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1
    const limit = Number.isFinite(limitParam) && limitParam > 0 && limitParam <= 50 ? Math.floor(limitParam) : 5
    const skip = (page - 1) * limit

    const [session, totalReviews, reviews, aggregate, grouped] = await Promise.all([
      resolveSession(),
      prisma.review.count({ where: { productId: id } }),
      prisma.review.findMany({
        where: { productId: id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
        },
      }),
      prisma.review.aggregate({
        where: { productId: id },
        _avg: { rating: true },
      }),
      prisma.review.groupBy({
        by: ["rating"],
        where: { productId: id },
        _count: { rating: true },
      }),
    ])

    const formattedReviews = reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment || "",
      createdAt: review.createdAt.toISOString(),
      user: review.user
        ? {
            id: review.user.id,
            name: review.user.name || "Anonymous",
            username: review.user.username,
            avatar: review.user.image || "/images/m1.png",
          }
        : {
            id: "anonymous",
            name: "Anonymous",
            username: null,
            avatar: "/images/m1.png",
          },
    }))

    const ratingCounts = grouped.reduce<Record<string, number>>((acc, group) => {
      acc[String(group.rating)] = group._count.rating
      return acc
    }, {})

    let viewerReview: { id: string; rating: number; comment: string | null } | null = null
    let viewerEligible = false

    if (session?.user?.id) {
      const existingReview = await prisma.review.findFirst({
        where: { productId: id, userId: session.user.id },
        select: { id: true, rating: true, comment: true },
      })
      if (existingReview) {
        viewerReview = {
          id: existingReview.id,
          rating: existingReview.rating,
          comment: existingReview.comment ?? null,
        }
      }

      viewerEligible = await userCanReview(id, session.user.id)
    }

    return NextResponse.json({
      reviews: formattedReviews,
      pagination: {
        page,
        pageSize: limit,
        total: totalReviews,
        totalPages: Math.max(1, Math.ceil(totalReviews / limit)),
      },
      stats: {
        average: aggregate._avg.rating ? Number(aggregate._avg.rating.toFixed(2)) : 0,
        total: totalReviews,
        ratingCounts,
        viewerReviewId: session?.user?.id
          ? reviews.find((review) => review.userId === session.user.id)?.id || null
          : null,
        viewerReview,
        viewerEligible,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to load reviews" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await resolveSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: "Product id is required" }, { status: 400 })
    }

    const availability = await ensureProductAvailable(id)
    if (availability.error) {
      return NextResponse.json(availability.error.body, { status: availability.error.status })
    }

    const body = await request.json().catch(() => null)
    const ratingValue = Number(body?.rating)
    const commentValue = typeof body?.comment === "string" ? body.comment.trim() : ""

    if (!Number.isFinite(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    const eligible = await userCanReview(id, session.user.id)
    if (!eligible) {
      return NextResponse.json({ error: "You must purchase this item before leaving a review" }, { status: 403 })
    }

    const existingReview = await prisma.review.findFirst({
      where: {
        productId: id,
        userId: session.user.id,
      },
    })

    const data = {
      rating: Math.round(ratingValue),
      comment: commentValue.length > 0 ? commentValue : null,
      productId: id,
      userId: session.user.id,
    }

    const savedReview = existingReview
      ? await prisma.review.update({ where: { id: existingReview.id }, data })
      : await prisma.review.create({ data })

    const [aggregate, grouped, totalReviews] = await Promise.all([
      prisma.review.aggregate({ where: { productId: id }, _avg: { rating: true } }),
      prisma.review.groupBy({ by: ["rating"], where: { productId: id }, _count: { rating: true } }),
      prisma.review.count({ where: { productId: id } }),
    ])

    const statsRatingCounts = grouped.reduce<Record<string, number>>((acc, group) => {
      acc[String(group.rating)] = group._count.rating
      return acc
    }, {})

    return NextResponse.json({
      success: true,
      review: {
        id: savedReview.id,
        rating: savedReview.rating,
        comment: savedReview.comment,
        createdAt: savedReview.createdAt.toISOString(),
      },
      stats: {
        average: aggregate._avg.rating ? Number(aggregate._avg.rating.toFixed(2)) : 0,
        total: totalReviews,
        ratingCounts: statsRatingCounts,
        viewerReview: {
          id: savedReview.id,
          rating: savedReview.rating,
          comment: savedReview.comment,
        },
        viewerEligible: true,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 })
  }
}
