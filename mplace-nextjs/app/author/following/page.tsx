"use client"

import { Suspense, useCallback, useEffect, useMemo, useState, type MouseEvent } from "react"
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

interface FollowingUser {
  id: string
  name: string
  avatar: string
  memberSince: string
  items: number
  sales: number
  rating: number
  ratingCount: number
  isFollowing: boolean
  username?: string | null
}

interface AuthorSummary {
  id: string
  name: string
  username?: string | null
  avatar: string
  coverImage?: string | null
  signedUp: string
  totalItems: number
  totalSales: number
  totalRatings: number
  ratingCount: number
  followers: number
  following: number
  badges: Array<{ icon: string; title: string }>
  bio?: string | null
  website?: string | null
  country?: string | null
  facebookUrl?: string | null
  twitterUrl?: string | null
  dribbbleUrl?: string | null
  viewerFollowsAuthor?: boolean
  viewerIsAuthor?: boolean
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

function AuthorFollowingPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()

  const usernameParam = (searchParams?.get("username") || "").trim()
  const pageParam = parseInt(searchParams?.get("page") || "1", 10)
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1
  const username = useMemo(() => usernameParam, [usernameParam])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [author, setAuthor] = useState<AuthorSummary | null>(null)
  const [followingUsers, setFollowingUsers] = useState<FollowingUser[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 12, total: 0, totalPages: 1 })
  const [isAvailableForFreelance, setIsAvailableForFreelance] = useState(true)
  const [authorFollowLoading, setAuthorFollowLoading] = useState(false)
  const [followingActionLoading, setFollowingActionLoading] = useState<Record<string, boolean>>({})

  const sidebarAuthor = useMemo<AuthorSidebarAuthor | null>(
    () =>
      author
        ? {
            id: author.id,
            name: author.name,
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

  const renderStars = useCallback((rating: number) => {
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
  }, [])

  useEffect(() => {
    if (!username) {
      setLoading(false)
      setError("Missing author username. Please access this page via an author profile.")
      return
    }

    const controller = new AbortController()

    const loadFollowing = async () => {
      try {
        setLoading(true)
        setError("")

        const params = new URLSearchParams()
        params.set("page", String(page))

        const response = await fetch(
          `${getApiUrl(`/api/authors/${encodeURIComponent(username)}/following`)}?${params.toString()}`,
          {
            cache: "no-store",
            signal: controller.signal,
          }
        )

        if (!response.ok) {
          if (response.status === 404) {
            setError("Author not found.")
            setAuthor(null)
            setFollowingUsers([])
            setPagination({ page: 1, limit: 12, total: 0, totalPages: 1 })
            return
          }
          throw new Error("Failed to load following list")
        }

        const data = await response.json()

        const fetchedAuthor: AuthorSummary = {
          id: data.author.id,
          name: data.author.name,
          username: data.author.username,
          avatar: withBasePath(data.author.avatar || "/images/author-avatar.jpg"),
          coverImage: withBasePath(data.author.coverImage || "/images/dashboard_banner.jpg"),
          signedUp: data.author.signedUp,
          totalItems: data.author.totalItems || 0,
          totalSales: data.author.totalSales || 0,
          totalRatings: data.author.totalRatings || 0,
          ratingCount: data.author.ratingCount || 0,
          followers: data.author.followers || 0,
          following: data.author.following || 0,
          badges: Array.isArray(data.author.badges) ? data.author.badges : [],
          bio: data.author.bio,
          website: data.author.website,
          country: data.author.country,
          facebookUrl: data.author.facebookUrl,
          twitterUrl: data.author.twitterUrl,
          dribbbleUrl: data.author.dribbbleUrl,
          viewerFollowsAuthor: Boolean(data.author.viewerFollowsAuthor),
          viewerIsAuthor: Boolean(data.author.viewerIsAuthor),
        }

        setAuthor(fetchedAuthor)

        const formattedFollowing: FollowingUser[] = Array.isArray(data.following)
          ? data.following.map((item: any) => ({
              id: item.id,
              username: item.username,
              name: item.name,
              avatar: withBasePath(item.avatar || "/images/m1.png"),
              memberSince: item.memberSince || "Member Since: Unknown",
              items: item.items || 0,
              sales: item.sales || 0,
              rating: typeof item.rating === "number" ? item.rating : 0,
              ratingCount: item.ratingCount || 0,
              isFollowing: Boolean(item.isFollowing),
            }))
          : []

        setFollowingUsers(formattedFollowing)

        setPagination({
          page: data.pagination?.page || 1,
          limit: data.pagination?.limit || 12,
          total: data.pagination?.total || formattedFollowing.length,
          totalPages: data.pagination?.totalPages || 1,
        })
      } catch (err: any) {
        if (err?.name === "AbortError") return
        setError(err?.message || "Failed to load following list.")
        setAuthor(null)
        setFollowingUsers([])
      } finally {
        setLoading(false)
      }
    }

    void loadFollowing()

    return () => controller.abort()
  }, [username, page])

  const handleRequireAuth = useCallback(() => {
    if (typeof window === "undefined") return
    const callback = encodeURIComponent(window.location.pathname + window.location.search)
    router.push(`/login?callbackUrl=${callback}`)
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
      const method = author.viewerFollowsAuthor ? "DELETE" : "POST"
      const response = await fetch(getApiUrl(`/api/authors/${encodeURIComponent(target)}/follow`), {
        method,
      })

      if (response.status === 401) {
        handleRequireAuth()
        return
      }

      if (!response.ok) {
        throw new Error("Unable to update follow status")
      }

      setAuthor((prev) =>
        prev
          ? {
              ...prev,
              viewerFollowsAuthor: !prev.viewerFollowsAuthor,
              followers: prev.followers + (prev.viewerFollowsAuthor ? -1 : 1),
            }
          : prev
      )
    } catch (err) {
      setError("Unable to update follow status. Please try again.")
    } finally {
      setAuthorFollowLoading(false)
    }
  }, [author, handleRequireAuth, session?.user?.id])

  const followButtonConfig = useMemo<AuthorSidebarFollowButton | undefined>(() => {
    if (!author) return undefined
    if (author.viewerIsAuthor) {
      return {
        label: "It's you",
        disabled: true,
      }
    }
    return {
      label: author.viewerFollowsAuthor ? "Following" : "Follow",
      onClick: () => {
        void handleToggleAuthorFollow()
      },
      loading: authorFollowLoading,
      disabled: authorFollowLoading,
    }
  }, [author, authorFollowLoading, handleToggleAuthorFollow])

  const handleUnfollow = useCallback(
    async (user: FollowingUser) => {
      const targetIdentifier = user.username || user.id
      if (!targetIdentifier) return

      if (!session?.user?.id) {
        handleRequireAuth()
        return
      }

      setFollowingActionLoading((prev) => ({ ...prev, [user.id]: true }))

      try {
        const response = await fetch(getApiUrl(`/api/authors/${encodeURIComponent(targetIdentifier)}/follow`), {
          method: "DELETE",
        })

        if (response.status === 401) {
          handleRequireAuth()
          return
        }

        if (!response.ok) {
          throw new Error("Unable to unfollow user")
        }

        setFollowingUsers((prev) => prev.filter((item) => item.id !== user.id))
        setAuthor((prev) =>
          prev
            ? {
                ...prev,
                following: Math.max(0, prev.following - 1),
              }
            : prev
        )
        setPagination((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
        }))
      } catch (err) {
        setError("Unable to update following status. Please try again.")
      } finally {
        setFollowingActionLoading((prev) => {
          const { [user.id]: _ignored, ...rest } = prev
          return rest
        })
      }
    },
    [handleRequireAuth, session?.user?.id]
  )

  const handlePaginationClick = (event: MouseEvent<HTMLAnchorElement>, requestedPage: number) => {
    event.preventDefault()
    if (requestedPage < 1 || requestedPage > pagination.totalPages || requestedPage === pagination.page) {
      return
    }

    const params = new URLSearchParams(searchParams ? searchParams.toString() : "")
    params.set("page", String(requestedPage))
    router.push(`/author/following?${params.toString()}`)
  }

  return (
    <div className="preload author-following">
      <Preloader />
      <Header />
      <Breadcrumb
        pageTitle="Following"
        paths={[
          { name: "Author", link: author?.username ? `/author?username=${author.username}` : "/author" },
          {
            name: "Following",
            link: `/author/following${username ? `?username=${encodeURIComponent(username)}` : ""}`,
          },
        ]}
      />

      <section className="author-profile-area">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 col-md-12">
              <AuthorSidebar author={sidebarAuthor} activeTab="following" followButton={followButtonConfig}>
                <div className="sidebar-card freelance-status">
                  <div className="custom-radio">
                    <input
                      type="radio"
                      id="freelance_opt"
                      name="filter_opt"
                      checked={isAvailableForFreelance}
                      onChange={() => setIsAvailableForFreelance(!isAvailableForFreelance)}
                    />
                    <label htmlFor="freelance_opt">
                      <span className="circle"></span>Available for Freelance work
                    </label>
                  </div>
                </div>

                <div className="sidebar-card message-card">
                  <div className="card-title">
                    <h4>Product Information</h4>
                  </div>

                  <div className="message-form">
                    <form action="#">
                      <div className="form-group">
                        <textarea name="message" className="text_field" id="author-message" placeholder="Your message..."></textarea>
                      </div>

                      <div className="msg_submit">
                        <button type="submit" className="btn btn--md btn--round">
                          send message
                        </button>
                      </div>
                    </form>
                    <p>
                      Please <Link href="/login">sign in</Link> to contact this author.
                    </p>
                  </div>
                </div>
              </AuthorSidebar>
            </div>

            <div className="col-lg-8 col-md-12">
              <div className="row">
                <div className="col-md-4 col-sm-4">
                  <div className="author-info mcolorbg4">
                    <p>Total Items</p>
                    <h3>{(author?.totalItems || 0).toLocaleString()}</h3>
                  </div>
                </div>

                <div className="col-md-4 col-sm-4">
                  <div className="author-info pcolorbg">
                    <p>Total sales</p>
                    <h3>{(author?.totalSales || 0).toLocaleString()}</h3>
                  </div>
                </div>

                <div className="col-md-4 col-sm-4">
                  <div className="author-info scolorbg">
                    <p>Total Ratings</p>
                    <div className="rating">
                      <ul>{renderStars(author?.totalRatings || 0)}</ul>
                      <span className="rating__count">({author?.ratingCount || 0})</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-12">
                  <div className="product-title-area">
                    <div className="product__title">
                      <h2>
                        <span className="bold">{pagination.total}</span> Following
                      </h2>
                    </div>
                  </div>

                  <div className="user_area">
                    {loading ? (
                      <p className="text-center p-4">Loading following list&hellip;</p>
                    ) : followingUsers.length === 0 ? (
                      <p className="text-center p-4">Not following anyone yet.</p>
                    ) : (
                      <ul>
                        {followingUsers.map((user) => (
                          <li key={user.id}>
                            <div className="user_single">
                              <div className="user__short_desc">
                                <div className="user_avatar">
                                  <Image src={withBasePath(user.avatar)} alt={user.name} width={60} height={60} />
                                </div>
                                <div className="user_info">
                                  <Link
                                    href={
                                      user.username ? `/author?username=${encodeURIComponent(user.username)}` : "/author"
                                    }
                                  >
                                    {user.name}
                                  </Link>
                                  <p>{user.memberSince}</p>
                                </div>
                              </div>
                              <div className="user__meta">
                                <p>{user.items} Items</p>
                                <p>{user.sales} Sales</p>
                                <div className="rating product--rating">
                                  <ul>{renderStars(user.rating)}</ul>
                                  <span className="rating__count">({user.ratingCount})</span>
                                </div>
                              </div>
                              <div className={`user__status ${user.isFollowing ? "user--following" : "user--follow"}`}>
                                <Link
                                  href="#"
                                  className="btn btn--round btn--md"
                                  aria-disabled={followingActionLoading[user.id]}
                                  onClick={(event) => {
                                    event.preventDefault()
                                    void handleUnfollow(user)
                                  }}
                                >
                                  {followingActionLoading[user.id] ? "Updating..." : user.isFollowing ? "Following" : "Follow"}
                                </Link>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}

                    {pagination.totalPages > 1 && (
                      <div className="pagination-area pagination-area2">
                        <nav className="navigation pagination" role="navigation">
                          <div className="nav-links">
                            <Link
                              className={`prev page-numbers${pagination.page <= 1 ? " disabled" : ""}`}
                              href="#"
                              onClick={(event) => handlePaginationClick(event, pagination.page - 1)}
                            >
                              <span className="lnr lnr-arrow-left"></span>
                            </Link>
                            {Array.from({ length: pagination.totalPages }).map((_, index) => {
                              const pageNumber = index + 1
                              const isCurrent = pageNumber === pagination.page
                              return (
                                <Link
                                  key={pageNumber}
                                  className={`page-numbers${isCurrent ? " current" : ""}`}
                                  href="#"
                                  onClick={(event) => handlePaginationClick(event, pageNumber)}
                                >
                                  {pageNumber}
                                </Link>
                              )
                            })}
                            <Link
                              className={`next page-numbers${pagination.page >= pagination.totalPages ? " disabled" : ""}`}
                              href="#"
                              onClick={(event) => handlePaginationClick(event, pagination.page + 1)}
                            >
                              <span className="lnr lnr-arrow-right"></span>
                            </Link>
                          </div>
                        </nav>
                      </div>
                    )}
                  </div>
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

export default function AuthorFollowingPage() {
  return (
    <Suspense
      fallback={
        <div className="preload author-following-page">
          <Preloader />
          <Header />
          <ScrollToTop />
        </div>
      }
    >
      <AuthorFollowingPageInner />
    </Suspense>
  )
}

