"use client"

import { useCallback, useEffect, useMemo, useState, type FormEvent, type JSX } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"

import { getApiUrl, withBasePath } from "@/utils/paths"

interface CommentUser {
  id: string
  name: string
  username: string | null
  avatar: string
}

interface CommentNode {
  id: string
  content: string
  createdAt: string
  parentId: string | null
  user: CommentUser
  replies: CommentNode[]
}

interface CommentPagination {
  page: number
  pageSize: number
  totalTopLevel: number
  totalPages: number
}

interface CommentCounts {
  totalTopLevel: number
  total: number
}

interface SingleProductCommentsProps {
  productId: string
  pageSize?: number
  onCountsChange?: (counts: CommentCounts) => void
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

function normalizeAvatar(path: string | null | undefined, fallback: string) {
  if (!path) return withBasePath(fallback)
  if (path.startsWith("http://") || path.startsWith("https://")) return path
  return withBasePath(path.startsWith("/") ? path : `/${path}`)
}

function resolveApiUrl(path: string) {
  const endpoint = getApiUrl(path)
  if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
    return endpoint
  }

  const origin = typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  return new URL(endpoint, origin).toString()
}

export default function SingleProductComments({
  productId,
  pageSize = 4,
  onCountsChange,
}: SingleProductCommentsProps) {
  const { data: session } = useSession()
  const sessionUser = session?.user
  const isAuthenticated = Boolean(sessionUser?.id)

  const [comments, setComments] = useState<CommentNode[]>([])
  const [pagination, setPagination] = useState<CommentPagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [newComment, setNewComment] = useState("")
  const [newSubmitting, setNewSubmitting] = useState(false)

  const [activeReplyId, setActiveReplyId] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState<Record<string, string>>({})
  const [replySubmitting, setReplySubmitting] = useState<string | null>(null)

  const effectivePageSize = useMemo(() => {
    if (!Number.isFinite(pageSize) || pageSize <= 0) return 4
    return Math.min(pageSize, 50)
  }, [pageSize])

  const fetchComments = useCallback(
    async (page: number) => {
      setError(null)

      try {
        const fetchUrl = new URL(
          resolveApiUrl(`/api/products/${encodeURIComponent(productId)}/comments`)
        )
        fetchUrl.searchParams.set("page", String(page))
        fetchUrl.searchParams.set("limit", String(effectivePageSize))

        const response = await fetch(fetchUrl.toString(), {
          method: "GET",
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error("Failed to load comments")
        }

        const data = await response.json()
        const fetchedComments: CommentNode[] = Array.isArray(data.comments) ? data.comments : []
        const fetchedPagination: CommentPagination | null = data.pagination
          ? {
              page: Number(data.pagination.page) || 1,
              pageSize: Number(data.pagination.pageSize) || effectivePageSize,
              totalTopLevel: Number(data.pagination.totalTopLevel) || fetchedComments.length,
              totalPages: Number(data.pagination.totalPages) || 1,
            }
          : null
        const fetchedCounts: CommentCounts = {
          totalTopLevel: Number(data.counts?.totalTopLevel) || fetchedComments.length,
          total: Number(data.counts?.total) || fetchedComments.reduce((acc, item) => acc + 1 + item.replies.length, 0),
        }

        setComments(fetchedComments)
        setPagination(fetchedPagination)
        onCountsChange?.(fetchedCounts)
      } catch (err: any) {
        setError(err?.message || "Failed to load comments.")
      } finally {
        setLoading(false)
      }
    },
    [effectivePageSize, onCountsChange, productId]
  )

  useEffect(() => {
    void fetchComments(1)
  }, [fetchComments])

  const handleNewCommentSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isAuthenticated) {
      setError("Please sign in to leave a comment.")
      return
    }

    if (!newComment.trim()) {
      setError("Please enter a comment.")
      return
    }

    try {
      setNewSubmitting(true)
      setError(null)

      const response = await fetch(resolveApiUrl(`/api/products/${encodeURIComponent(productId)}/comments`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newComment.trim() }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || "Failed to submit comment")
      }

      setNewComment("")
      const nextPageSize = pagination?.pageSize ?? effectivePageSize
      const nextTotalTopLevel = (pagination?.totalTopLevel ?? 0) + 1
      const nextPage = Math.max(1, Math.ceil(nextTotalTopLevel / nextPageSize))
      await fetchComments(nextPage)
    } catch (err: any) {
      setError(err?.message || "Failed to submit comment.")
    } finally {
      setNewSubmitting(false)
    }
  }

  const handleReplyToggle = (commentId: string) => {
    setActiveReplyId((prev) => (prev === commentId ? null : commentId))
    setReplyContent((prev) => ({ ...prev, [commentId]: prev[commentId] ?? "" }))
  }

  const handleReplySubmit = async (commentId: string, event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!isAuthenticated) {
      setError("Please sign in to reply.")
      return
    }

    const content = replyContent[commentId]?.trim() ?? ""
    if (!content) {
      setError("Please enter a reply.")
      return
    }

    try {
      setReplySubmitting(commentId)
      setError(null)

      const response = await fetch(resolveApiUrl(`/api/products/${encodeURIComponent(productId)}/comments`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content, parentId: commentId }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || "Failed to submit reply")
      }

      setReplyContent((prev) => ({ ...prev, [commentId]: "" }))
      setActiveReplyId(null)
      await fetchComments(pagination?.page ?? 1)
    } catch (err: any) {
      setError(err?.message || "Failed to submit reply.")
    } finally {
      setReplySubmitting(null)
    }
  }

  const handlePageChange = async (nextPage: number) => {
    if (!pagination) return
    if (nextPage < 1 || nextPage > pagination.totalPages) return
    await fetchComments(nextPage)
  }

  const renderReplies = (comment: CommentNode, depth: number) => {
    if (!comment.replies || comment.replies.length === 0) {
      return null
    }

    return (
      <ul className="children">
        {comment.replies.map((reply) => renderComment(reply, depth + 1))}
      </ul>
    )
  }

  const renderReplyForm = (comment: CommentNode, depth: number) => {
    if (activeReplyId !== comment.id) {
      return null
    }

    return (
      <div className={`media depth-2 reply-comment${depth === 0 ? "" : " nested"}`}>
        <div className="media-left">
          <a href="#">
            <img className="media-object" src={normalizeAvatar(sessionUser?.image, "/images/m2.png")} alt="Commentator Avatar" />
          </a>
        </div>
        <div className="media-body">
          <form onSubmit={(event) => handleReplySubmit(comment.id, event)} className="comment-reply-form">
            <textarea
              className={depth === 0 ? "bla" : undefined}
              name="reply-comment"
              placeholder="Write your comment..."
              value={replyContent[comment.id] ?? ""}
              onChange={(event) =>
                setReplyContent((prev) => ({
                  ...prev,
                  [comment.id]: event.target.value,
                }))
              }
              disabled={replySubmitting === comment.id}
            ></textarea>
            <button className="btn btn--sm btn--round" type="submit" disabled={replySubmitting === comment.id}>
              {replySubmitting === comment.id ? "Posting..." : "Post Comment"}
            </button>
          </form>
        </div>
      </div>
    )
  }

  const renderComment = (comment: CommentNode, depth = 0): JSX.Element => {
    const showReplyLink = depth === 0
    const depthClass = depth > 0 ? ` depth-${depth + 1}` : ""

    return (
      <li className={`single-thread${depthClass}`} key={comment.id}>
        <div className="media">
          <div className="media-left">
            <a href="#">
              <img className="media-object" src={normalizeAvatar(comment.user.avatar, "/images/m1.png")} alt="Commentator Avatar" />
            </a>
          </div>
          <div className="media-body">
            <div>
              <div className="media-heading">
                {comment.user.username ? (
                  <Link href={`/author?username=${comment.user.username}`}>
                    <h4>{comment.user.name}</h4>
                  </Link>
                ) : (
                  <h4>{comment.user.name}</h4>
                )}
                <span>{formatTimeAgo(comment.createdAt)}</span>
              </div>
              {showReplyLink && (
                <a
                  href="#"
                  className="reply-link"
                  onClick={(event) => {
                    event.preventDefault()
                    handleReplyToggle(comment.id)
                  }}
                >
                  {activeReplyId === comment.id ? "Cancel" : "Reply"}
                </a>
              )}
            </div>
            <p>{comment.content}</p>
          </div>
        </div>

        {renderReplies(comment, depth)}
        {renderReplyForm(comment, depth)}
      </li>
    )
  }

  const paginationLinks = useMemo(() => {
    if (!pagination || pagination.totalPages <= 1) {
      return null
    }

    const links: Array<{ label: string; page: number; active?: boolean; key: string }> = []

    for (let i = 1; i <= pagination.totalPages; i += 1) {
      links.push({ label: String(i), page: i, active: i === pagination.page, key: `page-${i}` })
    }

    return links
  }, [pagination])

  if (loading) {
    return (
      <div className="thread">
        <p>Loading comments...</p>
      </div>
    )
  }

  if (error && comments.length === 0) {
    return (
      <div className="thread">
        <p className="text-danger">{error}</p>
      </div>
    )
  }

  return (
    <div className="thread">
      {error && <p className="text-danger mb-3">{error}</p>}

      <ul className="media-list thread-list">
        {comments.length === 0 ? <li>No comments yet.</li> : comments.map((comment) => renderComment(comment))}
      </ul>

      <div className="pagination-area pagination-area2">
        <nav className="navigation pagination" role="navigation">
          <div className="nav-links">
            {pagination && pagination.page > 1 && (
              <a
                className="prev page-numbers"
                href="#"
                onClick={(event) => {
                  event.preventDefault()
                  void handlePageChange(pagination.page - 1)
                }}
              >
                <span className="lnr lnr-arrow-left"></span>
              </a>
            )}
            {paginationLinks?.map((link) => (
              <a
                key={link.key}
                className={`page-numbers${link.active ? " current" : ""}`}
                href="#"
                onClick={(event) => {
                  event.preventDefault()
                  void handlePageChange(link.page)
                }}
              >
                {link.label}
              </a>
            ))}
            {pagination && pagination.page < pagination.totalPages && (
              <a
                className="next page-numbers"
                href="#"
                onClick={(event) => {
                  event.preventDefault()
                  void handlePageChange(pagination.page + 1)
                }}
              >
                <span className="lnr lnr-arrow-right"></span>
              </a>
            )}
          </div>
        </nav>
      </div>

      <div className="comment-form-area">
        <h4>Leave a comment</h4>
        <div className="media comment-form">
          <div className="media-left">
            <a href="#">
              <img
                className="media-object"
                src={normalizeAvatar(sessionUser?.image, "/images/m7.png")}
                alt="Commentator Avatar"
              />
            </a>
          </div>
          <div className="media-body">
            <form onSubmit={handleNewCommentSubmit} className="comment-reply-form">
              <textarea
                name="reply-comment"
                placeholder={isAuthenticated ? "Write your comment..." : "Please sign in to comment"}
                value={newComment}
                onChange={(event) => setNewComment(event.target.value)}
                disabled={!isAuthenticated || newSubmitting}
              ></textarea>
              <button className="btn btn--sm btn--round" type="submit" disabled={!isAuthenticated || newSubmitting}>
                {newSubmitting ? "Posting..." : "Post Comment"}
              </button>
            </form>
            {!isAuthenticated && <p>Please sign in to participate in the discussion.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
