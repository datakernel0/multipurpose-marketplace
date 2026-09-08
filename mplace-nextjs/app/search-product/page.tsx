import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import SearchProductSearchArea from "@/components/product/SearchProductSearchArea"
import FilterArea from "@/components/product/FilterArea"
import CallToActionSection from "@/components/sections/CallToActionSection"
import Link from "next/link"
import Image from "next/image"
import { withBasePath, getApiUrl } from "@/utils/paths"

interface ApiProduct {
  id: string
  title: string
  slug: string
  description?: string | null
  price: number
  salePrice: number | null
  images: string[] | null
  livePreviewUrl?: string | null
  seller?: {
    id: string
    name: string | null
    image: string | null
  } | null
  category?: {
    id: string
    name: string | null
    slug: string | null
  } | null
  rating?: number
  favoriteCount?: number
  downloads?: number
}

interface SearchResultCard {
  id: string
  slug: string
  title: string
  description: string
  image: string
  author: string
  authorImg: string
  category: string
  priceLabel: string
  favorites: number
  sales: number
  rating: number
  livePreviewUrl?: string | null
}

function resolveImage(path: string | undefined | null, fallback: string) {
  if (!path) {
    return withBasePath(fallback)
  }
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path
  }
  return withBasePath(path.startsWith("/") ? path : `/${path}`)
}

function mapProducts(apiProducts: ApiProduct[]): SearchResultCard[] {
  return apiProducts.map((product) => {
    const priceValue = Number(product.price ?? 0)
    const salePriceValue =
      product.salePrice != null && !Number.isNaN(Number(product.salePrice))
        ? Number(product.salePrice)
        : null
    const firstImage = (product.images || []).find((img) => typeof img === "string" && img.trim().length > 0)
    const image = resolveImage(firstImage, "/images/p1.jpg")
    const authorImage = resolveImage(product.seller?.image || null, "/images/auth.jpg")
    const author = product.seller?.name || "Unknown Author"
    const priceLabel =
      salePriceValue != null && salePriceValue !== priceValue
        ? `$${salePriceValue.toFixed(2)}`
        : `$${priceValue.toFixed(2)}`

    const description =
      product.description && product.description.trim().length > 0
        ? product.description.trim()
        : "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis."

    return {
      id: product.id,
      slug: product.slug,
      title: product.title,
      description,
      image,
      author,
      authorImg: authorImage,
      category: product.category?.name || "Uncategorized",
      priceLabel,
      favorites: product.favoriteCount ?? 0,
      sales: product.downloads ?? 0,
      rating: typeof product.rating === "number" ? product.rating : Number(product.rating ?? 0),
      livePreviewUrl: product.livePreviewUrl || null,
    }
  })
}

function buildPageLink(searchTerm: string, page: number) {
  const params = new URLSearchParams()
  if (searchTerm) {
    params.set("q", searchTerm)
  }
  if (page > 1) {
    params.set("page", page.toString())
  }
  const query = params.toString()
  const basePath = withBasePath("/search-product")
  return query.length > 0 ? `${basePath}?${query}` : basePath
}

export const dynamic = "force-dynamic"

export default async function SearchProductPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string }
}) {
  const resolvedSearchParams = await searchParams
  const searchTerm = (resolvedSearchParams.q || "").trim()
  const page = Math.max(1, Number.parseInt(resolvedSearchParams.page || "1", 10) || 1)
  const limit = 24
  const offset = (page - 1) * limit

  const params = new URLSearchParams()
  params.set("limit", limit.toString())
  params.set("offset", offset.toString())
  params.set("status", "PUBLISHED")
  if (searchTerm.length > 0) {
    params.set("search", searchTerm.toLowerCase())
  } else {
    params.set("sortBy", "newest")
  }

  let apiProducts: ApiProduct[] = []
  let total = 0
  let error: string | null = null

  try {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""
    let baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL?.replace(/\/api\/auth$/, "") || "http://localhost:3000"

    // Remove basePath from baseUrl if it's already included to prevent double prefixing
    let cleanBaseUrl = baseUrl
    if (basePath && baseUrl.includes(basePath)) {
      cleanBaseUrl = baseUrl.replace(basePath, "")
    }
    cleanBaseUrl = cleanBaseUrl.replace(/\/$/, "") // Ensure no trailing slash

    const apiPath = getApiUrl(`/api/products?${params.toString()}`)
    const apiUrl = `${cleanBaseUrl}${apiPath}` // Correctly combine base, basePath, and API path
    
    const response = await fetch(apiUrl, { cache: "no-store" })
    if (!response.ok) {
      throw new Error(`Failed to load products (${response.status})`)
    }
    const data = await response.json()
    apiProducts = Array.isArray(data.products) ? data.products : []
    total = typeof data.total === "number" ? data.total : apiProducts.length
  } catch (err) {
    error = "Unable to load products at the moment."
  }

  const products = mapProducts(apiProducts)
  const totalPages = Math.max(1, Math.ceil(total / limit))

  const paginationLinks = []
  const maxButtons = 5
  const startPage = Math.max(1, page - Math.floor(maxButtons / 2))
  const endPage = Math.min(totalPages, startPage + maxButtons - 1)

  for (let p = startPage; p <= endPage; p += 1) {
    paginationLinks.push({ page: p, href: buildPageLink(searchTerm, p) })
  }

  const hasPrev = page > 1
  const hasNext = page < totalPages

  return (
    <div className="preload search-product-page">
      <Preloader />
      <Header />
      <SearchProductSearchArea searchTerm={searchTerm} resultCount={total} loading={false} />
      <FilterArea />
      <section className="products">
        <div className="container">
          {error && (
            <div className="row">
              <div className="col-md-12">
                <div className="alert alert-warning text-center" role="alert">
                  {error}
                </div>
              </div>
            </div>
          )}

          {!error && products.length === 0 && (
            <div className="row">
              <div className="col-md-12">
                <p className="text-center p-5">No products found. Try a different search term.</p>
              </div>
            </div>
          )}

          <div className="row">
            {products.map((product) => (
              <div key={product.id} className="col-lg-4 col-md-6">
                <div className="product product--card">
                  <div className="product__thumbnail">
                    <Image
                      src={product.image}
                      alt={product.title}
                      width={400}
                      height={300}
                      className="img-fluid"
                    />
                    <div className="prod_btn">
                      <Link href={`/single-product/${product.slug}`} className="transparent btn--sm btn--round">
                        More Info
                      </Link>
                      {product.livePreviewUrl ? (
                        <Link
                          href={product.livePreviewUrl}
                          className="transparent btn--sm btn--round"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Live Demo
                        </Link>
                      ) : null}
                    </div>
                  </div>

                  <div className="product-desc">
                    <Link href={`/single-product/${product.slug}`} className="product_title">
                      <h4>{product.title}</h4>
                    </Link>
                    <ul className="titlebtm">
                      <li>
                        <Image className="auth-img" src={product.authorImg} alt={product.author} width={40} height={40} />
                        <p>
                          <Link href="#">{product.author}</Link>
                        </p>
                      </li>
                      <li className="product_cat">
                        <Link href="#">
                          <span className="lnr lnr-book"></span>
                          {product.category}
                        </Link>
                      </li>
                    </ul>
                    <p>{product.description}</p>
                  </div>

                  <div className="product-purchase">
                    <div className="price_love">
                      <span>{product.priceLabel}</span>
                      <p>
                        <span className="lnr lnr-heart"></span> {product.favorites}
                      </p>
                    </div>
                    <div className="rating product--rating">
                      <ul>
                        {Array.from({ length: 5 }).map((_, index) => {
                          const ratingValue = index + 1
                          if (product.rating >= ratingValue) {
                            return (
                              <li key={ratingValue}>
                                <span className="fa fa-star"></span>
                              </li>
                            )
                          }
                          if (product.rating >= ratingValue - 0.5) {
                            return (
                              <li key={ratingValue}>
                                <span className="fa fa-star-half-o"></span>
                              </li>
                            )
                          }
                          return (
                            <li key={ratingValue}>
                              <span className="fa fa-star-o"></span>
                            </li>
                          )
                        })}
                      </ul>
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
          </div>

          {totalPages > 1 && (
            <div className="row">
              <div className="col-md-12">
                <div className="pagination-area">
                  <nav className="navigation pagination" role="navigation">
                    <div className="nav-links">
                      {hasPrev ? (
                        <Link className="prev page-numbers" href={buildPageLink(searchTerm, page - 1)}>
                          <span className="lnr lnr-arrow-left"></span>
                        </Link>
                      ) : (
                        <span className="prev page-numbers disabled">
                          <span className="lnr lnr-arrow-left"></span>
                        </span>
                      )}

                      {paginationLinks.map(({ page: p, href }) => (
                        <Link
                          key={p}
                          className={`page-numbers${p === page ? " current" : ""}`}
                          href={href}
                        >
                          {p}
                        </Link>
                      ))}

                      {hasNext ? (
                        <Link className="next page-numbers" href={buildPageLink(searchTerm, page + 1)}>
                          <span className="lnr lnr-arrow-right"></span>
                        </Link>
                      ) : (
                        <span className="next page-numbers disabled">
                          <span className="lnr lnr-arrow-right"></span>
                        </span>
                      )}
                    </div>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      <CallToActionSection />
      <Footer />
      <ScrollToTop />
    </div>
  )
}

