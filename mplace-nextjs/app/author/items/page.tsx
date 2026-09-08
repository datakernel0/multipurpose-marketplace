"use client"

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"

import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import CallToActionSection from "@/components/sections/CallToActionSection"
import { AuthorSidebar, type AuthorSidebarAuthor } from "@/components/author/AuthorSidebar"
import { getApiUrl, withBasePath } from "@/utils/paths"

interface Badge {
  icon: string
  title: string
}

interface AuthorSummary {
  id: string
  name: string
  username?: string | null
  avatar: string
  signedUp: string
  totalItems: number
  totalSales: number
  totalRatings: number
  ratingCount: number
  followers: number
  following: number
  badges: Badge[]
  facebookUrl?: string | null
  twitterUrl?: string | null
  dribbbleUrl?: string | null
  viewerIsAuthor?: boolean
  viewerFollowsAuthor?: boolean
}

interface ProductCard {
  id: string
  slug?: string | null
  title: string
  description: string
  image: string
  price: number
  salePrice?: number | null
  favorites: number
  sales: number
  rating: number
  author: {
    id?: string | null
    name: string
    username?: string | null
    avatar: string
  }
  category: {
    id?: string | null
    name: string
    slug?: string | null
    icon?: string | null
  }
}

interface CategorySummary {
  id: string
  name: string
  slug: string
  icon?: string | null
  count: number
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

const SORT_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "Trending items", value: "trending" },
  { label: "Popular items", value: "popular" },
  { label: "New items", value: "newest" },
  { label: "Best seller", value: "best_seller" },
  { label: "Best rating", value: "best_rating" },
]

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

function formatPrice(price: number, salePrice?: number | null) {
  if (salePrice && salePrice > 0 && salePrice < price) {
    return `$${salePrice.toFixed(2)}`
  }
  if (price === 0) {
    return "Free"
  }
  return `$${price.toFixed(2)}`
}

function AuthorItemsPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const usernameParam = (searchParams?.get("username") || "").trim()
  const categoryParam = (searchParams?.get("category") || "").trim()
  const sortParam = (searchParams?.get("sortBy") || "").trim().toLowerCase() || "newest"
  const pageParam = Number.parseInt(searchParams?.get("page") || "1", 10)

  const [author, setAuthor] = useState<AuthorSummary | null>(null)
  const [products, setProducts] = useState<ProductCard[]>([])
  const [categories, setCategories] = useState<CategorySummary[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 12, total: 0, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [isFreelance, setIsFreelance] = useState(true)

  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false)
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false)
  const categoryDropdownRef = useRef<HTMLDivElement>(null)
  const sortDropdownRef = useRef<HTMLDivElement>(null)

  const selectedSortOption = useMemo(
    () => SORT_OPTIONS.find((option) => option.value === sortParam) ?? SORT_OPTIONS[2],
    [sortParam]
  )

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setCategoryDropdownOpen(false)
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setSortDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (!usernameParam) {
      setAuthor(null)
      setProducts([])
      setCategories([])
      setPagination({ page: 1, limit: 12, total: 0, totalPages: 1 })
      setError("Missing author username. Please open this page from an author profile.")
      setLoading(false)
      return
    }

    const controller = new AbortController()

    async function loadAuthorItems() {
      try {
        setLoading(true)
        setError("")

        const params = new URLSearchParams()
        params.set("page", Number.isFinite(pageParam) && pageParam > 0 ? String(pageParam) : "1")
        params.set("limit", "12")
        if (categoryParam) params.set("category", categoryParam)
        if (sortParam) params.set("sortBy", sortParam)

        const response = await fetch(
          `${getApiUrl(`/api/authors/${encodeURIComponent(usernameParam)}/items`)}?${params.toString()}`,
          {
            cache: "no-store",
            signal: controller.signal,
          }
        )

        if (!response.ok) {
          if (response.status === 404) {
            setAuthor(null)
            setProducts([])
            setCategories([])
            setPagination({ page: 1, limit: 12, total: 0, totalPages: 1 })
            setError("Author not found.")
            return
          }
          throw new Error("Failed to load author items.")
        }

        const data = await response.json()

        setAuthor({
          id: data.author.id,
          name: data.author.name,
          username: data.author.username,
          avatar: withBasePath(data.author.avatar || "/images/author-avatar.jpg"),
          signedUp: data.author.signedUp,
          totalItems: data.author.totalItems || 0,
          totalSales: data.author.totalSales || 0,
          totalRatings: data.author.totalRatings || 0,
          ratingCount: data.author.ratingCount || 0,
          followers: data.author.followers || 0,
          following: data.author.following || 0,
          badges: Array.isArray(data.author.badges) ? data.author.badges : [],
          facebookUrl: data.author.facebookUrl,
          twitterUrl: data.author.twitterUrl,
          dribbbleUrl: data.author.dribbbleUrl,
          viewerIsAuthor: data.author.viewerIsAuthor,
          viewerFollowsAuthor: data.author.viewerFollowsAuthor,
        })

        setProducts(
          Array.isArray(data.items)
            ? data.items.map((item: any) => ({
                id: item.id,
                slug: item.slug,
                title: item.title,
                description: item.description,
                image: withBasePath(item.image || "/images/p1.jpg"),
                price: typeof item.price === "number" ? item.price : Number(item.price) || 0,
                salePrice: typeof item.salePrice === "number" ? item.salePrice : null,
                favorites: item.favorites || 0,
                sales: item.sales || 0,
                rating: typeof item.rating === "number" ? item.rating : 0,
                author: {
                  id: item.author?.id,
                  name: item.author?.name || "Unknown",
                  username: item.author?.username,
                  avatar: withBasePath(item.author?.avatar || "/images/auth.jpg"),
                },
                category: {
                  id: item.category?.id,
                  name: item.category?.name || "Uncategorized",
                  slug: item.category?.slug,
                  icon: item.category?.icon ? withBasePath(item.category.icon) : null,
                },
              }))
            : []
        )

        setCategories(
          Array.isArray(data.categories)
            ? data.categories.map((category: any) => ({
                id: category.id,
                name: category.name,
                slug: category.slug,
                icon: category.icon ? withBasePath(category.icon) : null,
                count: category.count || 0,
              }))
            : []
        )

        setPagination({
          page: data.pagination?.page || 1,
          limit: data.pagination?.limit || 12,
          total: data.pagination?.total || 0,
          totalPages: data.pagination?.totalPages || 1,
        })
      } catch (err: any) {
         if (err?.name === "AbortError") return
         setError(err?.message || "Failed to load author items.")
         setAuthor(null)
         setProducts([])
         setCategories([])
      } finally {
        setLoading(false)
      }
    }

    void loadAuthorItems()

    return () => controller.abort()
  }, [usernameParam, categoryParam, sortParam, pageParam])

  const selectedCategoryLabel = useMemo(() => {
    if (!categoryParam) return "Categories"
    const matched = categories.find((category) => category.slug === categoryParam)
    return matched ? matched.name : "Categories"
  }, [categoryParam, categories])

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

  const handleCategorySelect = (category: CategorySummary | null) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "")
    if (category) {
      params.set("category", category.slug)
      params.set("page", "1")
    } else {
      params.delete("category")
      params.set("page", "1")
    }
    router.push(`/author/items?${params.toString()}`)
    setCategoryDropdownOpen(false)
  }

  const handleSortSelect = (value: string) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "")
    params.set("sortBy", value)
    params.set("page", "1")
    router.push(`/author/items?${params.toString()}`)
    setSortDropdownOpen(false)
  }

  const handlePageChange = (event: React.MouseEvent<HTMLAnchorElement>, page: number) => {
    event.preventDefault()
    if (page < 1 || page > pagination.totalPages || page === pagination.page) return
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "")
    params.set("page", String(page))
    router.push(`/author/items?${params.toString()}`)
  }

  return (
    <div className="preload author-items">
      <Preloader />
      <Header />

      <section className="breadcrumb-area">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="breadcrumb">
                <ul>
                  <li>
                    <Link href="/">Home</Link>
                  </li>
                  <li className="active">
                    <Link href="#">Author Items</Link>
                  </li>
                </ul>
              </div>
              <h1 className="page-title">Author Items</h1>
            </div>
          </div>
        </div>
      </section>

      <section className="author-profile-area">
        <div className="container">
          <div className="row">
            <div className="col-lg-4">
              <AuthorSidebar author={sidebarAuthor} activeTab="items">
                <div className="sidebar-card freelance-status">
                  <div className="custom-radio">
                    <input type="radio" id="opt1" name="freelance_status" checked={isFreelance} onChange={() => setIsFreelance(true)} />
                    <label htmlFor="opt1">
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
                      Please <Link href="#">sign in</Link> to contact this author.
                    </p>
                  </div>
                </div>
              </AuthorSidebar>
            </div>

            <div className="col-lg-8">
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
                    <p>Total Items</p>
                    <div className="rating">
                      <ul>{renderStars(author?.totalRatings || 0)}</ul>
                      <span className="rating__count">({author?.ratingCount || 0})</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-12">
                  <div className="filter-bar clearfix filter-bar2">
                    <div className="filter__option filter--text pull-left">
                      <p>
                        <span>{(pagination.total || 0).toLocaleString()}</span> Author Items
                      </p>
                    </div>

                    <div className="pull-right">
                      <div className={`filter__option filter--dropdown${categoryDropdownOpen ? " open" : ""}`} ref={categoryDropdownRef}>
                        <a
                          href="#"
                          className="dropdown-trigger dropdown-toggle"
                          id="drop1"
                          onClick={(event) => {
                            event.preventDefault()
                            setCategoryDropdownOpen((prev) => !prev)
                            setSortDropdownOpen(false)
                          }}
                          aria-haspopup="true"
                          aria-expanded={categoryDropdownOpen}
                        >
                          {selectedCategoryLabel} <span className="lnr lnr-chevron-down"></span>
                        </a>
                        <ul className={`custom_dropdown custom_drop2 dropdown-menu${categoryDropdownOpen ? " show" : ""}`} aria-labelledby="drop1">
                          <li key="all">
                            <Link
                              href="#"
                              onClick={(event) => {
                                event.preventDefault()
                                handleCategorySelect(null)
                              }}
                            >
                              All Categories
                            </Link>
                          </li>
                          {categories.map((category) => (
                            <li key={category.slug}>
                              <Link
                                href="#"
                                onClick={(event) => {
                                  event.preventDefault()
                                  handleCategorySelect(category)
                                }}
                              >
                                {category.name}
                                <span>{category.count.toString().padStart(2, "0")}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className={`filter__option filter--dropdown${sortDropdownOpen ? " open" : ""}`} ref={sortDropdownRef}>
                        <a
                          href="#"
                          id="drop2"
                          className="dropdown-trigger dropdown-toggle"
                          onClick={(event) => {
                            event.preventDefault()
                            setSortDropdownOpen((prev) => !prev)
                            setCategoryDropdownOpen(false)
                          }}
                          aria-haspopup="true"
                          aria-expanded={sortDropdownOpen}
                        >
                          {selectedSortOption.label} <span className="lnr lnr-chevron-down"></span>
                        </a>
                        <ul className={`custom_dropdown dropdown-menu${sortDropdownOpen ? " show" : ""}`} aria-labelledby="drop2">
                          {SORT_OPTIONS.map((option) => (
                            <li key={option.value}>
                              <Link
                                href="#"
                                onClick={(event) => {
                                  event.preventDefault()
                                  handleSortSelect(option.value)
                                }}
                              >
                                {option.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {loading && (
                  <div className="col-12">
                    <p className="text-center p-4">Loading items&hellip;</p>
                  </div>
                )}

                {!loading && error && (
                  <div className="col-12">
                    <p className="text-center text-danger p-4">{error}</p>
                  </div>
                )}

                {!loading && !error && products.length === 0 && (
                  <div className="col-12">
                    <p className="text-center p-4">No items found.</p>
                  </div>
                )}

                {!loading &&
                  !error &&
                  products.map((product) => (
                    <div key={product.id} className="col-lg-6 col-md-6">
                      <div className="product product--card">
                        <div className="product__thumbnail">
                          <Image src={withBasePath(product.image)} alt="Product Image" width={361} height={0} style={{ width: "100%", height: "auto" }} />
                          <div className="prod_btn">
                            <Link
                              href={
                                product.slug
                                  ? `/single-product/${product.slug}`
                                  : `/single-product/${product.id}`
                              }
                              className="transparent btn--sm btn--round"
                            >
                              More Info
                            </Link>
                            <Link
                              href={
                                product.slug
                                  ? `/single-product/${product.slug}`
                                  : `/single-product/${product.id}`
                              }
                              className="transparent btn--sm btn--round"
                            >
                              Live Demo
                            </Link>
                          </div>
                        </div>

                        <div className="product-desc">
                          <Link href="#" className="product_title">
                            <h4>{product.title}</h4>
                          </Link>
                          <ul className="titlebtm">
                            <li>
                              <Image className="auth-img" src={withBasePath(product.author.avatar)} alt="author image" width={40} height={40} />
                              <p>
                                <Link
                                  href={
                                    product.author.username
                                      ? `/author?username=${product.author.username}`
                                      : product.author.id
                                      ? `/author?username=${product.author.id}`
                                      : "#"
                                  }
                                >
                                  {product.author.name}
                                </Link>
                              </p>
                            </li>
                            <li className="product_cat">
                              <Link href="#">
                                {product.category.icon ? (
                                  <Image src={withBasePath(product.category.icon)} alt="category image" width={16} height={16} />
                                ) : (
                                  <span className="lnr lnr-book"></span>
                                )}
                                {product.category.name}
                              </Link>
                            </li>
                          </ul>

                          <p>{product.description}</p>
                        </div>

                        <div className="product-purchase">
                          <div className="price_love">
                            <span>{formatPrice(product.price, product.salePrice)}</span>
                            <p>
                              <span className="lnr lnr-heart"></span> {product.favorites}
                            </p>
                          </div>

                          <div className="rating product--rating">
                            <ul>{renderStars(product.rating)}</ul>
                          </div>

                          <div className="sell">
                            <p>
                              <span className="lnr lnr-cart"></span>
                              <span>{product.sales}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                {pagination.totalPages > 1 && (
                  <div className="col-12">
                    <nav className="pagination-default">
                      <ul className="pagination">
                        <li className={`page-item${pagination.page <= 1 ? " disabled" : ""}`}>
                          <Link className="page-link" href="#" aria-label="Previous" onClick={(event) => handlePageChange(event, pagination.page - 1)}>
                            <span aria-hidden="true">
                              <span className="lnr lnr-chevron-left"></span>
                            </span>
                            <span className="sr-only">Previous</span>
                          </Link>
                        </li>
                        {Array.from({ length: pagination.totalPages }).map((_, index) => {
                          const page = index + 1
                          const isCurrent = page === pagination.page
                          return (
                            <li key={page} className={`page-item${isCurrent ? " active" : ""}`}>
                              <Link className="page-link" href="#" onClick={(event) => handlePageChange(event, page)}>
                                {page}
                              </Link>
                            </li>
                          )
                        })}
                        <li className={`page-item${pagination.page >= pagination.totalPages ? " disabled" : ""}`}>
                          <Link className="page-link" href="#" aria-label="Next" onClick={(event) => handlePageChange(event, pagination.page + 1)}>
                            <span aria-hidden="true">
                              <span className="lnr lnr-chevron-right"></span>
                            </span>
                            <span className="sr-only">Next</span>
                          </Link>
                        </li>
                      </ul>
                    </nav>
                  </div>
                )}
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

export default function AuthorItemsPage() {
  return (
    <Suspense
      fallback={
        <div className="preload author-items-page">
          <Preloader />
          <Header />
          <ScrollToTop />
        </div>
      }
    >
      <AuthorItemsPageInner />
    </Suspense>
  )
}
 
