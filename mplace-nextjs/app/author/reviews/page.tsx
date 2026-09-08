"use client"

import { Suspense, useCallback, useEffect, useMemo, useState, type FormEvent, type MouseEvent as ReactMouseEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import Breadcrumb from "@/components/common/Breadcrumb"
import CallToActionSection from "@/components/sections/CallToActionSection"
import Link from "next/link"
import Image from "next/image"
import {
  AuthorSidebar,
  type AuthorSidebarAuthor,
  type AuthorSidebarFollowButton,
} from "@/components/author/AuthorSidebar"
import { getApiUrl, withBasePath } from "@/utils/paths"

interface ReviewItem {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  reviewer: {
    id?: string | null
    name: string
    username?: string | null
    avatar: string
  }
  product: {
    id: string
    title: string
    slug?: string | null
    image: string
    category?: string | null
  }
}

interface AuthorSummary {
  id: string
  name: string | null
  username?: string | null
  avatar: string
  signedUp: string
  totalItems: number
  totalSales: number
  totalRatings: number
  ratingCount: number
  followers: number
  following: number
  badges: Array<{ icon: string; title: string }>
  facebookUrl?: string | null
  twitterUrl?: string | null
  dribbbleUrl?: string | null
  viewerIsAuthor?: boolean
  viewerFollowsAuthor?: boolean
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

function renderStars(rating: number) {
  const stars = []
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(
        <li key={i}>
          <span className="fa fa-star"></span>
        </li>
      )
    } else if (rating >= i - 0.5) {
      stars.push(
        <li key={i}>
          <span className="fa fa-star-half-o"></span>
        </li>
      )
    } else {
      stars.push(
        <li key={i}>
          <span className="fa fa-star-o"></span>
        </li>
      )
    }
  }
  return stars
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return ""

  const diffMs = Date.now() - date.getTime()
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`

  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`

  const months = Math.floor(days / 30)
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`

  const years = Math.floor(months / 12)
  return `${years} year${years === 1 ? "" : "s"} ago`
}

function AuthorReviewsPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()

  const usernameParam = (searchParams?.get("username") || "").trim()
  const pageParam = parseInt(searchParams?.get("page") || "1", 10)
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1

  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string>("")
  const [author, setAuthor] = useState<AuthorSummary | null>(null)
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 12, total: 0, totalPages: 1 })
  const [isAvailableForFreelance, setIsAvailableForFreelance] = useState(true)
  const [authorFollowLoading, setAuthorFollowLoading] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [message, setMessage] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)
  const [messageError, setMessageError] = useState<string>("")
  const [successMessage, setSuccessMessage] = useState<string>("")

  useEffect(() => {
    if (!usernameParam) {
      setLoading(false)
      setPageError("Missing author username. Please access this page via an author profile.")
      return
    }

    const controller = new AbortController()

    const loadReviews = async () => {
      try {
        setLoading(true)
        setPageError("")

        const params = new URLSearchParams()
        params.set("page", String(page))
        params.set("limit", "12")

        const response = await fetch(
          `${getApiUrl(`/api/authors/${encodeURIComponent(usernameParam)}/reviews`)}?${params.toString()}`,
          {
            cache: "no-store",
            signal: controller.signal,
          }
        )

        if (!response.ok) {
          if (response.status === 404) {
            setPageError("Author not found.")
            setAuthor(null)
            setReviews([])
            setPagination({ page: 1, limit: 12, total: 0, totalPages: 1 })
            return
          }
          throw new Error("Failed to load author reviews")
        }

        const data = await response.json()

        setAuthor(data.author)
        setIsFollowing(Boolean(data.author?.viewerFollowsAuthor))

        const formattedReviews: ReviewItem[] = Array.isArray(data.reviews)
          ? data.reviews.map((review: any) => ({
              id: review.id,
              rating: review.rating,
              comment: review.comment ?? null,
              createdAt: review.createdAt,
              reviewer: {
                id: review.reviewer?.id,
                name: review.reviewer?.name || "Anonymous",
                username: review.reviewer?.username,
                avatar: withBasePath(review.reviewer?.avatar || "/images/m1.png"),
              },
              product: {
                id: review.product?.id || "",
                title: review.product?.title || "Unknown Product",
                slug: review.product?.slug,
                image: withBasePath(review.product?.image || "/images/p1.jpg"),
                category: review.product?.category || null,
              },
            }))
          : []

        setReviews(formattedReviews)

        setPagination({
          page: data.pagination?.page || 1,
          limit: data.pagination?.limit || 12,
          total: data.pagination?.total || formattedReviews.length,
          totalPages: data.pagination?.totalPages || 1,
        })
      } catch (error: any) {
        if (error?.name === "AbortError") return
        setPageError(error?.message || "Failed to load author reviews.")
        setAuthor(null)
        setReviews([])
      } finally {
        setLoading(false)
      }
    }

    void loadReviews()

    return () => controller.abort()
  }, [usernameParam, page])

  const handleRequireAuth = useCallback(() => {
    if (typeof window === "undefined") return
    const callbackUrl = encodeURIComponent(window.location.pathname + window.location.search)
    router.push(`/login?callbackUrl=${callbackUrl}`)
  }, [router])

  const handleToggleAuthorFollow = useCallback(async () => {
    if (!author || author.viewerIsAuthor) return

    if (!session?.user?.id) {
      handleRequireAuth()
      return
    }

    const target = author.username || author.id
    if (!target) return

    try {
      setAuthorFollowLoading(true)
      const method = isFollowing ? "DELETE" : "POST"
      const response = await fetch(getApiUrl(`/api/authors/${encodeURIComponent(target)}/follow`), { method })

      if (response.status === 401) {
        handleRequireAuth()
        return
      }

      if (!response.ok) {
        throw new Error("Unable to update follow status")
      }

      setIsFollowing(!isFollowing)
      setAuthor((prev) =>
        prev
          ? {
              ...prev,
              followers: Math.max(0, prev.followers + (isFollowing ? -1 : 1)),
              viewerFollowsAuthor: !isFollowing,
            }
          : prev
      )
    } catch (error) {
      setPageError("Unable to update follow status. Please try again.")
    } finally {
      setAuthorFollowLoading(false)
    }
  }, [author, handleRequireAuth, isFollowing, session?.user?.id])

  const sidebarAuthor = useMemo<AuthorSidebarAuthor | null>(
    () =>
      author
        ? {
            id: author.id,
            name: author.name || "Author",
            username: author.username,
            avatar: author.avatar,
            signedUp: author.signedUp,
            followers: author.followers,
            following: author.following,
            badges: author.badges,
            facebookUrl: author.facebookUrl,
            twitterUrl: author.twitterUrl,
            dribbbleUrl: author.dribbbleUrl,
            viewerIsAuthor: author.viewerIsAuthor,
            viewerFollowsAuthor: author.viewerFollowsAuthor,
          }
        : null,
    [author]
  )

  const followButtonConfig = useMemo<AuthorSidebarFollowButton | undefined>(() => {
    if (!sidebarAuthor) return undefined
    if (sidebarAuthor.viewerIsAuthor) {
      return {
        label: "It's you",
        disabled: true,
      }
    }

    return {
      label: authorFollowLoading ? "Updating..." : isFollowing ? "Following" : "Follow",
      onClick: () => {
        void handleToggleAuthorFollow()
      },
      loading: authorFollowLoading,
      disabled: authorFollowLoading,
    }
  }, [sidebarAuthor, authorFollowLoading, isFollowing, handleToggleAuthorFollow])

  const handlePaginationClick = (event: ReactMouseEvent<HTMLAnchorElement>, requestedPage: number) => {
    event.preventDefault()
    if (requestedPage < 1 || requestedPage > pagination.totalPages || requestedPage === pagination.page) {
      return
    }
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "")
    params.set("page", String(requestedPage))
    router.push(`/author/reviews?${params.toString()}`)
  }

  const handleSendMessage = async (event: FormEvent) => {
    event.preventDefault()

    if (!session?.user?.id) {
      handleRequireAuth()
      return
    }

    if (!author) {
      setMessageError("Author information not available.")
      return
    }

    if (!message.trim()) {
      setMessageError("Please enter a message.")
      return
    }

    setSendingMessage(true)
    setMessageError("")
    setSuccessMessage("")

    try {
      const response = await fetch(getApiUrl("/api/messages/send"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiverId: author.id,
          content: message.trim(),
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to send message")
      }

      setSuccessMessage("Message sent successfully!")
      setMessage("")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error: any) {
      setMessageError(error.message || "Failed to send message.")
    } finally {
      setSendingMessage(false)
    }
  }

  if (loading) {
    return (
      <div className="preload author-reviews">
        <Preloader />
        <Header />
        <div className="text-center" style={{ padding: "100px 0" }}>
          <p>Loading reviews...</p>
        </div>
        <Footer />
        <ScrollToTop />
      </div>
    )
  }

  if (pageError) {
    return (
      <div className="preload author-reviews">
        <Preloader />
        <Header />
        <Breadcrumb pageTitle="Customer Reviews" paths={[{ name: "Customer Reviews", link: "/author/reviews" }]} />
        <div className="text-center" style={{ padding: "100px 0" }}>
          <p>{pageError}</p>
        </div>
        <Footer />
        <ScrollToTop />
      </div>
    )
  }

  if (!author) {
    return (
      <div className="preload author-reviews">
        <Preloader />
        <Header />
        <Breadcrumb pageTitle="Customer Reviews" paths={[{ name: "Customer Reviews", link: "/author/reviews" }]} />
        <div className="text-center" style={{ padding: "100px 0" }}>
          <p>Author information not available.</p>
        </div>
        <Footer />
        <ScrollToTop />
      </div>
    )
  }

  return (
    <div className="preload author-reviews">
      <Preloader />
      <Header />
      <Breadcrumb
        pageTitle="Customer Reviews"
        paths={[
          { name: "Author", link: author.username ? `/author?username=${author.username}` : "/author" },
          { name: "Customer Reviews", link: author.username ? `/author/reviews?username=${author.username}` : "/author/reviews" },
        ]}
      />

      <section className="author-profile-area">
        <div className="container">
          <div className="row">
            <div className="col-lg-4">
              <AuthorSidebar author={sidebarAuthor} activeTab="reviews" followButton={followButtonConfig}>
                <div className="sidebar-card freelance-status">
                  <div className="custom-radio">
                    <input
                      type="radio"
                      id="freelance_opt"
                      name="filter_opt"
                      checked={isAvailableForFreelance}
                      onChange={() => setIsAvailableForFreelance((prev) => !prev)}
                    />
                    <label htmlFor="freelance_opt">
                      <span className="circle"></span>Available for Freelance work
                    </label>
                  </div>
                </div>

                <div className="sidebar-card message-card">
                  <div className="card-title">
                    <h4>Send Message</h4>
                  </div>

                  <div className="message-form">
                    <form onSubmit={handleSendMessage}>
                      <div className="form-group">
                        <textarea
                          name="message"
                          className="text_field"
                          id="author-message"
                          placeholder="Your message..."
                          value={message}
                          onChange={(event) => setMessage(event.target.value)}
                          rows={5}
                          required
                        ></textarea>
                      </div>

                      <div className="msg_submit">
                        <button type="submit" className="btn btn--md btn--round" disabled={sendingMessage}>
                          {sendingMessage ? "Sending..." : "Send Message"}
                        </button>
                      </div>
                    </form>
                    {messageError && <p className="text-danger mt-2">{messageError}</p>}
                    {successMessage && <p className="text-success mt-2">{successMessage}</p>}
                  </div>
                </div>
              </AuthorSidebar>
            </div>

            <div className="col-lg-8">
              <div className="row">
                <div className="col-md-4 col-sm-4">
                  <div className="author-info mcolorbg4">
                    <p>Total Items</p>
                    <h3>{author.totalItems.toLocaleString()}</h3>
                  </div>
                </div>

                <div className="col-md-4 col-sm-4">
                  <div className="author-info pcolorbg">
                    <p>Total sales</p>
                    <h3>{author.totalSales.toLocaleString()}</h3>
                  </div>
                </div>

                <div className="col-md-4 col-sm-4">
                  <div className="author-info scolorbg">
                    <p>Total Ratings</p>
                    <div className="rating">
                      <ul>{renderStars(author.totalRatings)}</ul>
                      <span className="rating__count">({author.ratingCount})</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-12">
                  <div className="product-title-area">
                    <div className="product__title">
                      <h2>
                        <span className="bold">{pagination.total}</span> Customer Reviews
                      </h2>
                    </div>
                  </div>

                  <div className="thread thread_review thread_review2">
                    <ul className="media-list thread-list">
                      {reviews.length === 0 && (
                        <li className="single-thread">
                          <div className="media">
                            <div className="media-body">
                              <p>No reviews yet.</p>
                            </div>
                          </div>
                        </li>
                      )}

                      {reviews.map((review) => (
                        <li key={review.id} className="single-thread">
                          <div className="media">
                            <div className="media-left">
                              <Link
                                href={review.reviewer.username ? `/author?username=${review.reviewer.username}` : "#"}
                              >
                                <Image
                                  className="media-object"
                                  src={review.reviewer.avatar}
                                  alt="Reviewer avatar"
                                  width={60}
                                  height={60}
                                />
                              </Link>
                            </div>

                            <div className="media-body">
                              <div className="media-heading">
                                <h4>
                                  <Link
                                    href={review.reviewer.username ? `/author?username=${review.reviewer.username}` : "#"}
                                  >
                                    {review.reviewer.name}
                                  </Link>
                                </h4>
                                <p>
                                  <Link
                                    href={review.product.slug ? `/single-product/${review.product.slug}` : `/single-product/${review.product.id}`}
                                  >
                                    {review.product.title}
                                  </Link>
                                </p>
                              </div>

                              <div className="rating product--rating">
                                <ul>{renderStars(review.rating)}</ul>
                              </div>

                              <p>{review.comment || "No review text provided."}</p>

                              <div className="rating-area">
                                <span className="rating-tag">{review.product.category || "Review"}</span>
                                <span className="date">{formatTimeAgo(review.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {pagination.totalPages > 1 && (
                    <nav className="pagination-default">
                      <ul className="pagination">
                        <li className={`page-item${pagination.page <= 1 ? " disabled" : ""}`}>
                          <Link className="page-link" href="#" aria-label="Previous" onClick={(event) => handlePaginationClick(event, pagination.page - 1)}>
                            <span aria-hidden="true">
                              <span className="lnr lnr-chevron-left"></span>
                            </span>
                            <span className="sr-only">Previous</span>
                          </Link>
                        </li>
                        {Array.from({ length: pagination.totalPages }).map((_, index) => {
                          const pageNumber = index + 1
                          const isCurrent = pageNumber === pagination.page
                          return (
                            <li key={pageNumber} className={`page-item${isCurrent ? " active" : ""}`}>
                              <Link className="page-link" href="#" onClick={(event) => handlePaginationClick(event, pageNumber)}>
                                {pageNumber}
                              </Link>
                            </li>
                          )
                        })}
                        <li className={`page-item${pagination.page >= pagination.totalPages ? " disabled" : ""}`}>
                          <Link className="page-link" href="#" aria-label="Next" onClick={(event) => handlePaginationClick(event, pagination.page + 1)}>
                            <span aria-hidden="true">
                              <span className="lnr lnr-chevron-right"></span>
                            </span>
                            <span className="sr-only">Next</span>
                          </Link>
                        </li>
                      </ul>
                    </nav>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CallToActionSection />
      <Footer />
      <ScrollToTop />
    </div>
  )
}

export default function AuthorReviewsPage() {
  return (
    <Suspense
      fallback={
        <div className="preload author-reviews-page">
          <Preloader />
          <Header />
          <ScrollToTop />
        </div>
      }
    >
      <AuthorReviewsPageInner />
    </Suspense>
  )
}

