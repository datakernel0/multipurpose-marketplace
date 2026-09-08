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
  livePreviewUrl?: string | null
}

interface ProductsGridProps {
  initialProducts: Product[]
  total: number
  currentPage: number
  totalPages: number
  limit: number
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function ProductsGrid({
  initialProducts,
  total,
  currentPage,
  totalPages,
  limit,
  searchParams,
}: ProductsGridProps) {
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
    return `/all-products${queryString ? `?${queryString}` : ""}`
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
        {products.map((product) => (
          <div key={product.id} className="col-lg-4 col-md-6">
            <div className="product product--card">
              <div className="product__thumbnail">
                <img 
                  src={product.images[0] ? withBasePath(product.images[0]) : withBasePath("/images/p1.jpg")} 
                  alt={product.title}
                  style={{ width: "100%", height: "auto" }}
                />
                <div className="prod_btn">
                  <Link 
                    href={`/single-product/${product.slug}`} 
                    className="transparent btn--sm btn--round"
                  >
                    More Info
                  </Link>
                  {product.livePreviewUrl && (
                    <a 
                      href={product.livePreviewUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="transparent btn--sm btn--round"
                    >
                      Live Demo
                    </a>
                  )}
                </div>
              </div>

              <div className="product-desc">
                <Link href={`/single-product/${product.slug}`} className="product_title">
                  <h4>{product.title}</h4>
                </Link>
                <ul className="titlebtm">
                  {product.seller && (
                    <li>
                      <img 
                        className="auth-img" 
                        src={product.seller.image ? withBasePath(product.seller.image) : withBasePath("/images/usr_avatar.png")} 
                        alt={product.seller.name || "Seller"}
                        style={{ 
                          verticalAlign: "middle",
                          objectFit: "cover",
                          marginRight: "6px"
                        }}
                      />
                      <p style={{ verticalAlign: "middle" }}>
                        <Link href={`/author?username=${product.seller.id}`}>
                          {product.seller.name || "Unknown Seller"}
                        </Link>
                      </p>
                    </li>
                  )}
                  {product.category && (
                    <li className="product_cat">
                      <Link href={`/all-products?category=${product.category.slug}`}>
                        <span className="lnr lnr-book"></span>
                        {product.category.name}
                      </Link>
                    </li>
                  )}
                </ul>
                <p>{product.description?.substring(0, 100)}...</p>
              </div>

              <div className="product-purchase">
                <div className="price_love">
                  <span style={{ whiteSpace: "nowrap" }}>{formatPrice(product.price, product.salePrice)}</span>
                  <p>
                    <span className="lnr lnr-heart"></span> {product.favoriteCount}
                  </p>
                </div>
                {product.rating > 0 && (
                  <div className="rating product--rating">
                    <ul>{renderStars(product.rating)}</ul>
                  </div>
                )}
                <div className="sell">
                  <p>
                    <span className="lnr lnr-cart"></span>
                    <span>{product.downloads}</span>
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
