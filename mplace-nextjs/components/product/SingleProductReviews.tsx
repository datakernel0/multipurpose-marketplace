"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { getApiUrl, withBasePath } from "@/utils/paths"

interface ReviewUser {
  id: string
  name: string
  username: string | null
  avatar: string
}

interface ReviewItem {
  id: string
  rating: number
  comment: string
  createdAt: string
  user: ReviewUser
}

interface ReviewPagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

interface ReviewStats {
  average: number
  total: number
  ratingCounts: Record<string, number>
  viewerReviewId: string | null
  viewerReview?: {
    id: string
    rating: number
    comment: string | null
  } | null
  viewerEligible?: boolean
}

export type { ReviewStats }

interface SingleProductReviewsProps {
  productId: string
  pageSize?: number
  onStatsChange?: (stats: ReviewStats) => void
}

function buildAbsoluteUrl(path: string) {
  const endpoint = getApiUrl(path)
  if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
    return endpoint
  }
  const origin = typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  return new URL(endpoint, origin).toString()
}

function normalizeAvatar(path: string) {
  if (!path) return withBasePath("/images/m1.png")
  if (path.startsWith("http://") || path.startsWith("https://")) return path
  return withBasePath(path.startsWith("/") ? path : `/${path}`)
}

function formatTimeAgo(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes} ${minutes === 1 ? "Minute" : "Minutes"} Ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} ${hours === 1 ? "Hour" : "Hours"} Ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} ${days === 1 ? "Day" : "Days"} Ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} ${months === 1 ? "Month" : "Months"} Ago`
  const years = Math.floor(months / 12)
  return `${years} ${years === 1 ? "Year" : "Years"} Ago`
}

function renderStars(rating: number) {
  const stars = []
  for (let i = 1; i <= 5; i += 1) {
    if (rating >= i) {
      stars.push(
        <li key={`star-${i}`}>
          <span className="fa fa-star"></span>
        </li>
      )
    } else if (rating >= i - 0.5) {
      stars.push(
        <li key={`star-${i}`}>
          <span className="fa fa-star-half-o"></span>
        </li>
      )
    } else {
      stars.push(
        <li key={`star-${i}`}>
          <span className="fa fa-star-o"></span>
        </li>
      )
    }
  }
  return stars
}

export default function SingleProductReviews({ productId, pageSize = 4, onStatsChange }: SingleProductReviewsProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [pagination, setPagination] = useState<ReviewPagination | null>(null)
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)
  const [ratingInput, setRatingInput] = useState(5)
  const [commentInput, setCommentInput] = useState("")

  const effectivePageSize = useMemo(() => {
    if (!Number.isFinite(pageSize) || pageSize <= 0) return 4
    return Math.min(pageSize, 50)
  }, [pageSize])

  const fetchReviews = useCallback(
    async (page: number) => {
      setError(null)
      try {
        const url = new URL(buildAbsoluteUrl(`/api/products/${encodeURIComponent(productId)}/reviews`))
        url.searchParams.set("page", String(page))
        url.searchParams.set("limit", String(effectivePageSize))

        const response = await fetch(url.toString(), {
          credentials: "include",
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error("Failed to load reviews")
        }

        const data = await response.json()
        const fetchedReviews: ReviewItem[] = Array.isArray(data.reviews)
          ? data.reviews.map((review: any) => ({
              id: review.id,
              rating: Number(review.rating) || 0,
              comment: review.comment || "",
              createdAt: review.createdAt,
              user: {
                id: review.user?.id || "anonymous",
                name: review.user?.name || "Anonymous",
                username: review.user?.username || null,
                avatar: normalizeAvatar(review.user?.avatar || "/images/m1.png"),
              },
            }))
          : []

        setReviews(fetchedReviews)
        setPagination(
          data.pagination
            ? {
                page: Number(data.pagination.page) || 1,
                pageSize: Number(data.pagination.pageSize) || effectivePageSize,
                total: Number(data.pagination.total) || fetchedReviews.length,
                totalPages: Number(data.pagination.totalPages) || 1,
              }
            : null
        )
        const nextStats = data.stats
          ? {
              average: Number(data.stats.average) || 0,
              total: Number(data.stats.total) || fetchedReviews.length,
              ratingCounts: data.stats.ratingCounts || {},
              viewerReviewId: data.stats.viewerReviewId || null,
              viewerReview: data.stats.viewerReview || null,
              viewerEligible: data.stats.viewerEligible ?? false,
            }
          : null

        setStats(nextStats)
        if (nextStats) {
          onStatsChange?.(nextStats)
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load reviews.")
        setReviews([])
        setPagination(null)
        onStatsChange?.({ average: 0, total: 0, ratingCounts: {}, viewerReviewId: null })
        setRatingInput(5)
        setCommentInput("")
      } finally {
        setLoading(false)
      }
    },
    [effectivePageSize, onStatsChange, productId]
  )

  useEffect(() => {
    void fetchReviews(1)
  }, [fetchReviews])

  useEffect(() => {
    if (stats?.viewerReview) {
      setRatingInput(stats.viewerReview.rating)
      setCommentInput(stats.viewerReview.comment || "")
    } else {
      setRatingInput(5)
      setCommentInput("")
    }
  }, [stats?.viewerReview])

  const handlePagination = async (page: number) => {
    if (!pagination) return
    if (page < 1 || page > pagination.totalPages || page === pagination.page) return
    await fetchReviews(page)
  }

  const ratingSummary = useMemo(() => {
    if (!stats) return null
    return {
      average: stats.average,
      total: stats.total,
    }
  }, [stats])

  const handleSubmitReview = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!stats?.viewerEligible) {
      setSubmitError("You need to purchase this item before leaving a review.")
      return
    }

    setSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(null)

    try {
      const response = await fetch(buildAbsoluteUrl(`/api/products/${encodeURIComponent(productId)}/reviews`), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: ratingInput, comment: commentInput }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data?.error || "Failed to submit review")
      }

      setSubmitSuccess("Thank you! Your review has been saved.")
      setStats((prev) =>
        prev
          ? {
              ...prev,
              average: data.stats?.average ?? prev.average,
              total: data.stats?.total ?? prev.total,
              ratingCounts: data.stats?.ratingCounts ?? prev.ratingCounts,
              viewerReviewId: data.stats?.viewerReview?.id ?? prev.viewerReviewId,
              viewerReview: data.stats?.viewerReview ?? prev.viewerReview,
              viewerEligible: true,
            }
          : prev,
      )
      await fetchReviews(1)
    } catch (error: any) {
      setSubmitError(error?.message || "Failed to submit review")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="thread thread_review">
        <p>Loading reviews...</p>
      </div>
    )
  }

  if (error && reviews.length === 0) {
    return (
      <div className="thread thread_review">
        <p className="text-danger">{error}</p>
      </div>
    )
  }

  return (
    <div className="thread thread_review">
      {ratingSummary && ratingSummary.total > 0 ? (
        <div className="review-summary">
          <strong>{ratingSummary.average.toFixed(1)}</strong>
          <span>
            Average based on {ratingSummary.total} review{ratingSummary.total === 1 ? "" : "s"}
          </span>
        </div>
      ) : (
        null
      )}

      <div className="review-form">
        {stats?.viewerEligible ? (
          <form onSubmit={handleSubmitReview} className="review-form__inner">
            <h4>{stats?.viewerReview ? "Update your review" : "Leave a review"}</h4>
            <div className="form-group">
              <label htmlFor="review_rating">Rating</label>
              <select
                id="review_rating"
                className="text_field"
                value={ratingInput}
                onChange={(event) => setRatingInput(Number(event.target.value))}
                disabled={submitting}
                required
              >
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value} Star{value === 1 ? "" : "s"}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="review_comment">Comment (optional)</label>
              <textarea
                id="review_comment"
                className="text_field"
                rows={4}
                placeholder="Share your experience with other buyers"
                value={commentInput}
                onChange={(event) => setCommentInput(event.target.value)}
                disabled={submitting}
              ></textarea>
            </div>
            {submitError && <p className="text-danger" style={{ marginTop: "8px" }}>{submitError}</p>}
            {submitSuccess && <p className="text-success" style={{ marginTop: "8px" }}>{submitSuccess}</p>}
            <button type="submit" className="btn btn--sm btn--primary" disabled={submitting}>
              {submitting ? "Saving..." : stats?.viewerReview ? "Update Review" : "Submit Review"}
            </button>
          </form>
        ) : (
          <div className="review-form__notice">
            <p>You need to purchase this item before you can leave a review.</p>
          </div>
        )}
      </div>

      <ul className="media-list thread-list">
        {reviews.length === 0 ? (
          <li className="no-reviews">
            <p>No reviews yet. Be the first to share your experience.</p>
          </li>
        ) : (
          reviews.map((review) => (
            <li className="single-thread" key={review.id}>
              <div className="media">
                <div className="media-left">
                  <a href={review.user.username ? `/author?username=${review.user.username}` : "#"}>
                    <img className="media-object" src={normalizeAvatar(review.user.avatar)} alt="Reviewer Avatar" />
                  </a>
                </div>
                <div className="media-body">
                  <div className="clearfix">
                    <div className="pull-left">
                      <div className="media-heading">
                        {review.user.username ? (
                          <a href={`/author?username=${review.user.username}`}>
                            <h4>{review.user.name}</h4>
                          </a>
                        ) : (
                          <h4>{review.user.name}</h4>
                        )}
                        <span>{formatTimeAgo(review.createdAt)}</span>
                      </div>
                      <div className="rating product--rating">
                        <ul>{renderStars(review.rating)}</ul>
                      </div>
                      <span className="review_tag">Rating: {review.rating}/5</span>
                    </div>
                    <a href="#" className="reply-link" onClick={(event) => event.preventDefault()}>
                      Reply
                    </a>
                  </div>
                  <p>{review.comment || "No additional comment."}</p>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>

      {pagination && pagination.totalPages > 1 && (
        <div className="pagination-area pagination-area2">
          <nav className="navigation pagination" role="navigation">
            <div className="nav-links">
              {pagination.page > 1 && (
                <a
                  className="prev page-numbers"
                  href="#"
                  onClick={(event) => {
                    event.preventDefault()
                    void handlePagination(pagination.page - 1)
                  }}
                >
                  <span className="lnr lnr-arrow-left"></span>
                </a>
              )}
              {Array.from({ length: pagination.totalPages }).map((_, index) => {
                const pageNumber = index + 1
                return (
                  <a
                    key={`page-${pageNumber}`}
                    className={`page-numbers${pageNumber === pagination.page ? " current" : ""}`}
                    href="#"
                    onClick={(event) => {
                      event.preventDefault()
                      void handlePagination(pageNumber)
                    }}
                  >
                    {pageNumber}
                  </a>
                )
              })}
              {pagination.page < pagination.totalPages && (
                <a
                  className="next page-numbers"
                  href="#"
                  onClick={(event) => {
                    event.preventDefault()
                    void handlePagination(pagination.page + 1)
                  }}
                >
                  <span className="lnr lnr-arrow-right"></span>
                </a>
              )}
            </div>
          </nav>
        </div>
      )}
    </div>
  )
}
