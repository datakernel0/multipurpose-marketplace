"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { withBasePath, getApiUrl } from "@/utils/paths"

interface SidebarPost {
  id: string
  slug: string
  thumbnail: string
  title: string
  date: string
}

export default function BlogSidebar() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"popular" | "latest">("popular")
  const [popularPosts, setPopularPosts] = useState<SidebarPost[]>([])
  const [latestPosts, setLatestPosts] = useState<SidebarPost[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<Array<{ name: string; count: number }>>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch(getApiUrl("/api/blogs?limit=4"))
        if (response.ok) {
          const data = await response.json()
          const posts = data.blogs || []
          
          // Popular posts (by views)
          const popular = [...posts]
            .sort((a: any, b: any) => (b.views || 0) - (a.views || 0))
            .slice(0, 4)
            .map((p: any) => ({
              id: p.id,
              slug: p.slug,
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
            id: p.id,
            slug: p.slug,
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
        console.error("Error fetching sidebar posts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.currentTarget as HTMLFormElement
    const input = form.querySelector('input[type="text"]') as HTMLInputElement
    const query = input.value.trim()
    
    if (query) {
      router.push(`/blog?q=${encodeURIComponent(query)}`)
    }
  }


  const tags = ["Branding", "Design", "Marketing", "Development"]

  return (
    <aside className="sidebar sidebar--blog">
      <div className="sidebar-card card--search card--blog_sidebar">
        <div className="card-title">
          <h4>Product Information</h4>
        </div>
        <div className="card_content">
          <form onSubmit={handleSearch}>
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
                className={activeTab === "popular" ? "active" : ""}
                id="popular-tab"
                aria-controls="popular"
                role="tab"
                aria-selected={activeTab === "popular"}
                onClick={(e) => {
                  e.preventDefault()
                  setActiveTab("popular")
                }}
              >
                Popular Posts
              </a>
            </li>
            <li>
              <a
                href="#latest"
                className={activeTab === "latest" ? "active" : ""}
                id="latest-tab"
                aria-controls="latest"
                role="tab"
                aria-selected={activeTab === "latest"}
                onClick={(e) => {
                  e.preventDefault()
                  setActiveTab("latest")
                }}
              >
                Latest Posts
              </a>
            </li>
          </ul>
        </div>
        <div className="card_content">
          <div className="tab-content">
            {activeTab === "popular" && (
              <div role="tabpanel" className="tab-pane active fade show" id="popular" aria-labelledby="popular-tab">
                <ul className="post-list">
                  {loading ? (
                    <li style={{ padding: "20px", textAlign: "center" }}>Loading...</li>
                  ) : popularPosts.length === 0 ? (
                    <li style={{ padding: "20px", textAlign: "center", color: "#7e7e7e" }}>No posts found</li>
                  ) : (
                    popularPosts.map((post) => (
                      <li key={post.id}>
                        <div className="thumbnail_img">
                          <Image src={withBasePath(post.thumbnail)} alt={post.title} width={80} height={80} />
                        </div>
                        <div className="title_area">
                          <Link href={`/blog/single/${post.slug}`}>
                            <h4>{post.title}</h4>
                          </Link>
                          <div className="date_time">
                            <span className="lnr lnr-clock"></span>
                            <p>{post.date}</p>
                          </div>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
            {activeTab === "latest" && (
              <div role="tabpanel" className="tab-pane fade" id="latest" aria-labelledby="latest-tab">
                <ul className="post-list">
                  {loading ? (
                    <li style={{ padding: "20px", textAlign: "center" }}>Loading...</li>
                  ) : latestPosts.length === 0 ? (
                    <li style={{ padding: "20px", textAlign: "center", color: "#7e7e7e" }}>No posts found</li>
                  ) : (
                    latestPosts.map((post) => (
                      <li key={post.id}>
                        <div className="thumbnail_img">
                          <Image src={withBasePath(post.thumbnail)} alt={post.title} width={80} height={80} />
                        </div>
                        <div className="title_area">
                          <Link href={`/blog/single/${post.slug}`}>
                            <h4>{post.title}</h4>
                          </Link>
                          <div className="date_time">
                            <span className="lnr lnr-clock"></span>
                            <p>{post.date}</p>
                          </div>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
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
              <li style={{ padding: "20px", textAlign: "center", color: "#7e7e7e" }}>Loading categories...</li>
            ) : categories.length === 0 ? (
              <li style={{ padding: "20px", textAlign: "center", color: "#7e7e7e" }}>No categories found</li>
            ) : (
              categories
                .filter((category) => category.count > 0) // Only show categories with blogs
                .sort((a, b) => b.count - a.count) // Sort by count descending
                .map((category) => {
                  // Use category name for search - the API will handle keyword matching
                  // This ensures the search matches what was counted
                  return (
                    <li key={category.name}>
                      <Link href={`/blog?category=${encodeURIComponent(category.name)}`}>
                        <span className="lnr lnr-chevron-right"></span>
                        {category.name}
                        <span className="item-count">{category.count.toString().padStart(2, "0")}</span>
                      </Link>
                    </li>
                  )
                })
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
            <li key={index}>
              <Link href={`/blog?search=${encodeURIComponent(tag)}`}>{tag}</Link>
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
  )
}

