"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import Breadcrumb from "@/components/common/Breadcrumb"
import CallToActionSection from "@/components/sections/CallToActionSection"
import Image from "next/image"
import Link from "next/link"
import { withBasePath, getApiUrl } from "@/utils/paths"
import SafeHTMLRenderer from "@/components/common/SafeHTMLRenderer"

interface BlogComment {
  id: string
  name: string
  email: string
  content: string
  createdAt: string
  user: {
    id: string
    name: string | null
    image: string | null
  } | null
  replies: BlogComment[]
}

interface Blog {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  image: string
  author: {
    id: string
    name: string | null
    image: string | null
  } | null
  views: number
  commentCount: number
  publishedAt: string
  comments: BlogComment[]
}

interface PostSummary {
  id: string
  thumbnail: string
  title: string
  date: string
}

interface Category {
  name: string
  count: number
}

interface BlogSingleClientProps {
  postId: string
}

export default function BlogSingleClient({ postId }: BlogSingleClientProps) {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<"popular" | "latest">("popular")
  const [blog, setBlog] = useState<Blog | null>(null)
  const [loading, setLoading] = useState(true)
  const [popularPosts, setPopularPosts] = useState<PostSummary[]>([])
  const [latestPosts, setLatestPosts] = useState<PostSummary[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [commentForm, setCommentForm] = useState({
    name: "",
    email: "",
    comment: "",
    parentId: null as string | null,
  })
  const [submittingComment, setSubmittingComment] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)

  useEffect(() => {
    // Pre-fill form if user is logged in
    if (session?.user) {
      setCommentForm((prev) => ({
        ...prev,
        name: session.user.name || "",
        email: session.user.email || "",
        parentId: prev.parentId, // Keep existing parentId if replying
      }))
    }
  }, [session])

  useEffect(() => {
    async function fetchBlog() {
      try {
        const response = await fetch(getApiUrl(`/api/blogs?slug=${postId}`))
        if (response.ok) {
          const data = await response.json()
          setBlog(data)
        }
      } catch (error) {
        console.error("Error fetching blog:", error)
      } finally {
        setLoading(false)
      }
    }

    async function fetchRelatedPosts() {
      try {
        const response = await fetch(getApiUrl("/api/blogs?limit=4"))
        if (response.ok) {
          const data = await response.json()
          const posts = data.blogs || []
          
          // Popular posts (by views)
          const popular = [...posts]
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, 4)
            .map((p: any) => ({
              id: p.slug,
              thumbnail: p.image,
              title: p.title,
              date: new Date(p.publishedAt).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }),
            }))
          
          // Latest posts
          const latest = posts.slice(0, 4).map((p: any) => ({
            id: p.slug,
            thumbnail: p.image,
            title: p.title,
            date: new Date(p.publishedAt).toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
          }))
          
          setPopularPosts(popular)
          setLatestPosts(latest)
        }
      } catch (error) {
        console.error("Error fetching related posts:", error)
      }
    }

    fetchBlog()
    fetchRelatedPosts()
  }, [postId])

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch(getApiUrl("/api/blogs/categories"))
        if (response.ok) {
          const data = await response.json()
          setCategories(data.categories || [])
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
      } finally {
        setCategoriesLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const tags = ["Branding", "Design", "Marketing", "Development"]

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date)
  }

  const formatCommentDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date)
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!blog) return

    setSubmittingComment(true)

    try {
      const response = await fetch(getApiUrl(`/api/blogs/${blog.id}/comments`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: commentForm.name,
          email: commentForm.email,
          content: commentForm.comment,
          parentId: commentForm.parentId || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Failed to submit comment" }))
        alert(error.error || "Failed to submit comment")
        return
      }

      // Clear form
      setCommentForm({
        name: session?.user?.name || "",
        email: session?.user?.email || "",
        comment: "",
        parentId: null,
      })
      setReplyingTo(null)

      // Refresh blog data to show new comment
      const updatedBlogResponse = await fetch(getApiUrl(`/api/blogs?slug=${postId}`))
      if (updatedBlogResponse.ok) {
        const updatedBlog = await updatedBlogResponse.json()
        setBlog(updatedBlog)
      }
    } catch (error) {
      console.error("Error submitting comment:", error)
      alert("An error occurred while submitting your comment. Please try again.")
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleReplyClick = (commentId: string, commenterName: string) => {
    setReplyingTo(commentId)
    setCommentForm((prev) => ({
      ...prev,
      parentId: commentId,
      comment: `@${commenterName} `,
    }))
    // Scroll to comment form
    setTimeout(() => {
      const formElement = document.getElementById("comment-form")
      if (formElement) {
        formElement.scrollIntoView({ behavior: "smooth", block: "nearest" })
      }
    }, 100)
  }

  const handleCancelReply = () => {
    setReplyingTo(null)
    setCommentForm((prev) => ({
      ...prev,
      parentId: null,
      comment: "",
    }))
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
  }

  const renderComment = (comment: BlogComment, depth: number = 1) => {
    const commenterName = comment.user?.name || comment.name
    return (
      <li key={comment.id} className={`depth-${depth}`}>
        <div className="media">
          <div className="pull-left no-pull-xs">
            <Link href="#" className="cmnt_avatar">
              <Image
                src={withBasePath(comment.user?.image || "/images/usr_avatar.png")}
                className="media-object"
                alt={commenterName || "Commenter"}
                width={60}
                height={60}
              />
            </Link>
          </div>
          <div className="media-body">
            <div className="media_top">
              <div className="heading_left pull-left">
                <Link href="#">
                  <h4 className="media-heading">{commenterName}</h4>
                </Link>
                <span>{formatCommentDate(comment.createdAt)}</span>
              </div>
              <a
                href="#"
                className="reply hidden-xs-m pull-right"
                onClick={(e) => {
                  e.preventDefault()
                  handleReplyClick(comment.id, commenterName)
                }}
              >
                Reply
              </a>
            </div>
            <p>{comment.content}</p>
            <a
              href="#"
              className="reply visible-xs-m pull-right"
              onClick={(e) => {
                e.preventDefault()
                handleReplyClick(comment.id, commenterName)
              }}
            >
              Reply
            </a>
          </div>
        </div>
        {comment.replies && comment.replies.length > 0 && (
          <ul className="children">{comment.replies.map((reply) => renderComment(reply, depth + 1))}</ul>
        )}
      </li>
    )
  }

  const handleTabClick = (event: React.MouseEvent<HTMLAnchorElement>, tab: "popular" | "latest") => {
    event.preventDefault()
    setActiveTab(tab)
  }

  if (loading) {
    return (
      <div className="preload single-blog-page">
        <Preloader />
        <Header />
        <div className="container blog-loading-container">
          <p>Loading blog post...</p>
        </div>
        <Footer />
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="preload single-blog-page">
        <Preloader />
        <Header />
        <div className="container blog-loading-container">
          <h3>Blog post not found</h3>
          <p className="blog-not-found-text">
            The blog post you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/blog" className="btn btn--round blog-back-button">
            Back to Blog
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="preload single-blog-page">
      <Preloader />
      <Header />
      <Breadcrumb
        pageTitle={blog.title}
        paths={[
          { name: "Blog", link: "/blog" },
          { name: blog.title, link: `/blog/single/${blog.slug}` },
        ]}
      />
      <section className="blog_area section--padding2">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <div className="single_blog blog--default">
                <article>
                  <figure>
                    <Image
                      src={withBasePath(blog.image)}
                      alt={blog.title}
                      width={750}
                      height={400}
                      className="blog-image-full"
                    />
                  </figure>
                  <div className="blog__content">
                    <Link href="#" className="blog__title">
                      <h4>{blog.title}</h4>
                    </Link>

                    <div className="blog__meta">
                      {blog.author && (
                        <div className="author">
                          <span className="lnr lnr-user"></span>
                          <p>
                            by <Link href={`/author?username=${blog.author.id}`}>{blog.author.name || "Unknown Author"}</Link>
                          </p>
                        </div>
                      )}
                      <div className="date_time">
                        <span className="lnr lnr-clock"></span>
                        <p>{formatDate(blog.publishedAt)}</p>
                      </div>
                      <div className="comment_view">
                        <p className="comment">
                          <span className="lnr lnr-bubble"></span>
                          {blog.commentCount}
                        </p>
                        <p className="view">
                          <span className="lnr lnr-eye"></span>
                          {blog.views}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="single_blog_content">
                    <SafeHTMLRenderer html={blog.content} />
                  </div>
                </article>
              </div>

              <div className="comment_area">
                <h3>Comments {blog.comments.length}</h3>
                {blog.comments.length === 0 ? (
                  <p className="blog-comment-empty">No comments yet. Be the first to comment!</p>
                ) : (
                  <ol className="media-list">{blog.comments.map((comment) => renderComment(comment))}</ol>
                )}
              </div>

              <div className="comment_area comment_area--reply" id="comment-form">
                <h3>{replyingTo ? "Reply to Comment" : "Leave a Comment"}</h3>
                {replyingTo && (
                  <div className="blog-reply-notice">
                    <p className="blog-reply-notice-text">
                      You are replying to a comment.{" "}
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          handleCancelReply()
                        }}
                        className="blog-reply-cancel-link"
                      >
                        Cancel
                      </a>
                    </p>
                  </div>
                )}
                <form className="comment-form" onSubmit={handleCommentSubmit}>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="name">Name <sup>*</sup></label>
                        <input
                          type="text"
                          id="name"
                          className="text_field"
                          value={commentForm.name}
                          onChange={(e) => setCommentForm((prev) => ({ ...prev, name: e.target.value }))}
                          required
                          disabled={submittingComment}
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="email">Email <sup>*</sup></label>
                        <input
                          type="email"
                          id="email"
                          className="text_field"
                          value={commentForm.email}
                          onChange={(e) => setCommentForm((prev) => ({ ...prev, email: e.target.value }))}
                          required
                          disabled={submittingComment}
                        />
                      </div>
                    </div>

                    <div className="col-md-12">
                      <div className="form-group">
                        <label htmlFor="comment">Comment <sup>*</sup></label>
                        <textarea
                          id="comment"
                          className="text_field"
                          value={commentForm.comment}
                          onChange={(e) => setCommentForm((prev) => ({ ...prev, comment: e.target.value }))}
                          required
                          disabled={submittingComment}
                        ></textarea>
                      </div>
                    </div>

                    <div className="col-md-12">
                      <button 
                        type="submit" 
                        className="btn btn--round btn--default"
                        disabled={submittingComment}
                      >
                        {submittingComment ? "Submitting..." : "Submit Comment"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            <div className="col-lg-4">
              <aside className="sidebar sidebar--blog">
                <div className="sidebar-card card--search card--blog_sidebar">
                  <div className="card-title">
                    <h4>Product Information</h4>
                  </div>
                  <div className="card_content">
                    <form action="#" onSubmit={handleSearch}>
                      <div className="searc-wrap">
                        <input type="text" placeholder="Search product here..." />
                        <button type="submit" className="search-wrap__btn">
                          <span className="lnr lnr-magnifier"></span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                <div className="sidebar-card sidebar--post card--blog_sidebar">
                  <div className="card-title">
                    <ul className="nav post-tab" role="tablist">
                      <li>
                        <a
                          href="#popular"
                          id="popular-tab"
                          className={activeTab === "popular" ? "active" : ""}
                          aria-controls="popular"
                          role="tab"
                          aria-selected={activeTab === "popular"}
                          onClick={(event) => handleTabClick(event, "popular")}
                        >
                          Popular Posts
                        </a>
                      </li>
                      <li>
                        <a
                          href="#latest"
                          id="latest-tab"
                          className={activeTab === "latest" ? "active" : ""}
                          aria-controls="latest"
                          role="tab"
                          aria-selected={activeTab === "latest"}
                          onClick={(event) => handleTabClick(event, "latest")}
                        >
                          Latest Posts
                        </a>
                      </li>
                    </ul>
                  </div>

                  <div className="card_content">
                    <div className="tab-content">
                      <div role="tabpanel" className={`tab-pane fade${activeTab === "popular" ? ` show active` : ""}`} id="popular" aria-labelledby="popular-tab">
                        <ul className="post-list">
                          {popularPosts.map((post) => (
                            <li key={`popular-${post.id}`}>
                              <div className="thumbnail_img">
                                <Image src={withBasePath(post.thumbnail)} alt={post.title} width={90} height={70} />
                              </div>
                              <div className="title_area">
                                <Link href={`/blog/single/${post.id}`}>
                                  <h4>{post.title}</h4>
                                </Link>
                                <div className="date_time">
                                  <span className="lnr lnr-clock"></span>
                                  <p>{post.date}</p>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div role="tabpanel" className={`tab-pane fade${activeTab === "latest" ? ` show active` : ""}`} id="latest" aria-labelledby="latest-tab">
                        <ul className="post-list">
                          {latestPosts.map((post) => (
                            <li key={`latest-${post.id}`}>
                              <div className="thumbnail_img">
                                <Image src={withBasePath(post.thumbnail)} alt={post.title} width={90} height={70} />
                              </div>
                              <div className="title_area">
                                <Link href={`/blog/single/${post.id}`}>
                                  <h4>{post.title}</h4>
                                </Link>
                                <div className="date_time">
                                  <span className="lnr lnr-clock"></span>
                                  <p>{post.date}</p>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="sidebar-card card--blog_sidebar card--category">
                  <div className="card-title">
                    <h4>Categories</h4>
                  </div>
                  <div className="collapsible-content">
                    <ul className="card-content">
                      {categoriesLoading ? (
                        <li className="blog-category-loading">Loading categories...</li>
                      ) : categories.length === 0 ? (
                        <li className="blog-category-loading">No categories found</li>
                      ) : (
                        categories
                          .filter((category) => category.count > 0) // Only show categories with blogs
                          .sort((a, b) => b.count - a.count) // Sort by count descending
                          .map((category) => (
                            <li key={category.name}>
                              <Link href={`/blog?category=${encodeURIComponent(category.name)}`}>
                                <span className="lnr lnr-chevron-right"></span>
                                {category.name}
                                <span className="item-count">{category.count.toString().padStart(2, "0")}</span>
                              </Link>
                            </li>
                          ))
                      )}
                    </ul>
                  </div>
                </div>

                <div className="sidebar-card card--blog_sidebar card--tags">
                  <div className="card-title">
                    <h4>Tags</h4>
                  </div>
                  <ul className="tags">
                    {tags.map((tag, index) => (
                      <li key={`tag-${index}`}>
                        <Link href="#">{tag}</Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="banner">
                  <Image src={withBasePath("/images/banner.jpg")} alt="Banner" width={360} height={270} />
                  <div className="banner_content">
                    <h1>Banner</h1>
                    <p>360x270</p>
                  </div>
                </div>
              </aside>
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
