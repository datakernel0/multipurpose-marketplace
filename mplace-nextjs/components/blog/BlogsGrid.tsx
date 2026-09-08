"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import Image from "next/image"
import { withBasePath } from "@/utils/paths"

interface Blog {
  id: string
  title: string
  slug: string
  excerpt: string
  image: string
  author: {
    id: string
    name: string | null
    image: string | null
  } | null
  views: number
  commentCount: number
  publishedAt: string
}

interface BlogsGridProps {
  initialBlogs: Blog[]
  total: number
  currentPage: number
  totalPages: number
  limit: number
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function BlogsGrid({
  initialBlogs,
  total,
  currentPage,
  totalPages,
  limit,
  searchParams,
}: BlogsGridProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParamsHook = useSearchParams()
  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs)

  // Update blogs when initialBlogs prop changes
  useEffect(() => {
    setBlogs(initialBlogs)
  }, [initialBlogs])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date)
  }

  const buildPageUrl = (page: number): string => {
    const params = new URLSearchParams()
    
    // Preserve all existing search params
    if (searchParamsHook) {
      searchParamsHook.forEach((value, key) => {
        if (key !== "page") {
          params.append(key, value)
        }
      })
    }
    
    // Add new page
    if (page > 1) {
      params.append("page", page.toString())
    }
    
    const queryString = params.toString()
    return `${pathname}${queryString ? `?${queryString}` : ""}`
  }

  const handlePageClick = (e: React.MouseEvent<HTMLAnchorElement>, page: number) => {
    e.preventDefault()
    const url = buildPageUrl(page)
    router.push(url)
    router.refresh() // Force server-side re-fetch
  }

  if (blogs.length === 0) {
    return (
      <div className="text-center" style={{ padding: "60px 20px" }}>
        <h3>No blogs found</h3>
        <p style={{ color: "#7e7e7e", marginTop: "10px" }}>
          Try adjusting your search terms or check back later.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="row" data-uk-grid>
        {blogs.map((blog) => (
          <div key={blog.id} className="col-lg-4 col-md-6">
            <div className="single_blog blog--card">
              <figure>
                <Image 
                  src={withBasePath(blog.image)} 
                  alt={blog.title} 
                  width={370} 
                  height={250}
                  style={{ width: "100%", height: "auto" }}
                />
                <figcaption>
                  <div className="blog__content">
                    <Link href={`/blog/single/${blog.slug}`} className="blog__title">
                      <h4>{blog.title}</h4>
                    </Link>
                    <p>{blog.excerpt}</p>
                  </div>

                  <div className="blog__meta">
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
                </figcaption>
              </figure>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="row">
          <div className="col-md-12">
            <div className="pagination-area">
              <nav className="navigation pagination" role="navigation">
                <div className="nav-links">
                  {currentPage > 1 && (
                    <a 
                      href={buildPageUrl(currentPage - 1)}
                      className="prev page-numbers"
                      onClick={(e) => handlePageClick(e, currentPage - 1)}
                    >
                      <span className="lnr lnr-arrow-left"></span>
                    </a>
                  )}
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current
                    const showPage = 
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    
                    if (!showPage) {
                      // Show ellipsis
                      if (page === currentPage - 2 || page === currentPage + 2) {
                        return (
                          <span key={page} className="page-numbers dots">
                            ...
                          </span>
                        )
                      }
                      return null
                    }

                    return (
                      <a
                        key={page}
                        href={buildPageUrl(page)}
                        className={`page-numbers ${page === currentPage ? "current" : ""}`}
                        onClick={(e) => handlePageClick(e, page)}
                      >
                        {page}
                      </a>
                    )
                  })}
                  
                  {currentPage < totalPages && (
                    <a 
                      href={buildPageUrl(currentPage + 1)}
                      className="next page-numbers"
                      onClick={(e) => handlePageClick(e, currentPage + 1)}
                    >
                      <span className="lnr lnr-arrow-right"></span>
                    </a>
                  )}
                </div>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

