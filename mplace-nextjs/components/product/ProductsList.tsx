"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { withBasePath } from "@/utils/paths"

interface Product {
  id: string
  title: string
  slug: string
  price: number
  salePrice?: number | null
  images: string[]
  livePreviewUrl?: string | null
  seller: {
    id: string
    name: string | null
    image: string | null
  } | null
  category: {
    id: string
    name: string
    slug: string
  } | null
  rating: number
  reviewCount: number
  favoriteCount: number
  downloads: number
  views: number
  featured: boolean
  description: string
  tags?: string | null
}

interface ProductsListProps {
  initialProducts: Product[]
  total: number
  currentPage: number
  totalPages: number
  limit: number
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function ProductsList({
  initialProducts,
  total,
  currentPage,
  totalPages,
  limit,
  searchParams,
}: ProductsListProps) {
  const router = useRouter()
  const searchParamsHook = useSearchParams()
  const [products, setProducts] = useState<Product[]>(initialProducts)

  // Update products when initialProducts prop changes (e.g., on pagination)
  useEffect(() => {
    setProducts(initialProducts)
  }, [initialProducts])

  const formatPrice = (price: number, salePrice?: number | null): string => {
    if (salePrice && salePrice < price) {
      // Format as "$10 - $50" (no decimals, matching original template)
      const salePriceFormatted = salePrice % 1 === 0 ? salePrice.toString() : salePrice.toFixed(2)
      const priceFormatted = price % 1 === 0 ? price.toString() : price.toFixed(2)
      return `$${salePriceFormatted} - $${priceFormatted}`
    }
    // Format single price
    const priceFormatted = price % 1 === 0 ? price.toString() : price.toFixed(2)
    return `$${priceFormatted}`
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
    return `/all-products-list${queryString ? `?${queryString}` : ""}`
  }

  const handlePageClick = (e: React.MouseEvent<HTMLAnchorElement>, page: number) => {
    e.preventDefault()
    const url = buildPageUrl(page)
    router.push(url)
    router.refresh() // Force server-side re-fetch
  }

  const renderStars = (rating: number) => {
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

  const parseTags = (tags: string | null | undefined): string[] => {
    if (!tags) return []
    try {
      // If tags is a JSON string, parse it
      if (tags.startsWith("[")) {
        return JSON.parse(tags)
      }
      // If tags is a comma-separated string, split it
      return tags.split(",").map((tag) => tag.trim()).filter(Boolean)
    } catch {
      // If parsing fails, treat as comma-separated string
      return tags.split(",").map((tag) => tag.trim()).filter(Boolean)
    }
  }

  if (products.length === 0) {
    return (
      <div className="text-center" style={{ padding: "60px 20px" }}>
        <h3>No products found</h3>
        <p style={{ color: "#7e7e7e", marginTop: "10px" }}>
          Try adjusting your filters or search terms.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="row">
        {products.map((product) => {
          const tags = parseTags(product.tags)
          return (
            <div key={product.id} className="col-md-12">
              <div className="product product--list">
                <div className="product__thumbnail" style={{ height: "100%" }}>
                  <img 
                    src={product.images[0] ? withBasePath(product.images[0]) : withBasePath("/images/lp1.jpg")} 
                    alt={product.title}
                    style={{ 
                      width: "100%", 
                      height: "100%", 
                      objectFit: "cover",
                      display: "block"
                    }}
                  />
                  <div className="prod_btn">
                    <div className="prod_btn__wrap">
                      <Link 
                        href={`/single-product/${product.slug}`} 
                        className="transparent btn--sm btn--round"
                      >
                        More Info
                      </Link>
                    </div>
                    <div className="prod_btn__wrap">
                      {product.livePreviewUrl ? (
                        <a 
                          href={product.livePreviewUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="transparent btn--sm btn--round"
                        >
                          Live Demo
                        </a>
                      ) : (
                        <Link 
                          href={`/single-product/${product.slug}`} 
                          className="transparent btn--sm btn--round"
                        >
                          Live Demo
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                <div className="product__details">
                  <div className="product-desc">
                    <Link href={`/single-product/${product.slug}`} className="product_title">
                      <h4>{product.title}</h4>
                    </Link>
                    <p>
                      {product.description 
                        ? (product.description.length > 150 
                            ? `${product.description.substring(0, 150)}...` 
                            : product.description)
                        : "No description available."}
                    </p>
                    {product.category && (
                      <ul className="titlebtm">
                        <li className="product_cat">
                          <Link href={`/all-products-list?category=${product.category.slug}`}>
                            <span className="lnr lnr-book"></span>
                            {product.category.name}
                          </Link>
                        </li>
                      </ul>
                    )}
                  </div>
                  {/* end /.product-desc */}

                  <div className="product-meta">
                    <div className="author">
                      <img 
                        className="auth-img" 
                        src={product.seller?.image ? withBasePath(product.seller.image) : withBasePath("/images/usr_avatar.png")} 
                        alt={product.seller?.name || "Seller"}
                        style={{ 
                          verticalAlign: "middle",
                          objectFit: "cover",
                          marginRight: "6px"
                        }}
                      />
                      <p style={{ verticalAlign: "middle" }}>
                        {product.seller ? (
                          <Link href={`/author?username=${product.seller.id}`}>
                            {product.seller.name || "Unknown Seller"}
                          </Link>
                        ) : (
                          <Link href="#">Unknown Seller</Link>
                        )}
                      </p>
                    </div>

                    <div className="love-comments">
                      <p>
                        <span className="lnr lnr-heart"></span> {product.favoriteCount || 0} loves
                      </p>
                      <p>
                        <span className="lnr lnr-bubble"></span> {product.reviewCount || 0} Comments
                      </p>
                    </div>

                    {tags.length > 0 && (
                      <div className="product-tags">
                        <span>Tags:</span>
                        <ul>
                          {tags.map((tag, index) => (
                            <li key={index}>
                              <Link href={`/all-products-list?search=${encodeURIComponent(tag)}`}>
                                {tag}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {product.rating > 0 && (
                      <div className="rating product--rating">
                        <ul>{renderStars(product.rating)}</ul>
                        <span className="rating__count">({product.reviewCount || 0})</span>
                      </div>
                    )}
                  </div>
                  {/* end product-meta */}

                  <div className="product-purchase">
                    <div className="price_love">
                      <span style={{ whiteSpace: "nowrap" }}>{formatPrice(product.price, product.salePrice)}</span>
                    </div>
                    <div className="sell">
                      <p>
                        <span className="lnr lnr-cart"></span>
                        <span>{product.downloads || 0}</span>
                      </p>
                    </div>
                  </div>
                  {/* end /.product-purchase */}
                </div>
              </div>
            </div>
          )
        })}
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
