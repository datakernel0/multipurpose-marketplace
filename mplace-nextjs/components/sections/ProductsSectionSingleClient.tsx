"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { withBasePath } from "@/utils/paths"

type SortOption = "newest" | "popular" | "best_seller" | "best_rating" | "price_low" | "price_high"

const sortOptionMap: Record<SortOption, { label: string; sortBy: string }> = {
  newest: { label: "Newest Release", sortBy: "newest" },
  popular: { label: "Trending Items", sortBy: "popular" },
  best_seller: { label: "Best Seller", sortBy: "popular" },
  best_rating: { label: "Best Rating", sortBy: "rating" },
  price_low: { label: "Low Price", sortBy: "price-low" },
  price_high: { label: "High Price", sortBy: "price-high" },
}

interface ProductCard {
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

interface ProductsSectionSingleClientProps {
  products: ProductCard[]
  error?: string
  activeSort: SortOption
  activeTab: "newest" | "popular"
}

export default function ProductsSectionSingleClient({ 
  products, 
  error, 
  activeSort, 
  activeTab 
}: ProductsSectionSingleClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false)
  const filterDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node)
      ) {
        setFilterDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleTabChange = (tab: "newest" | "popular") => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "")
    if (tab === "newest") {
      params.delete("tab")
    } else {
      params.set("tab", tab)
    }
    router.push(`/index-single${params.toString() ? `?${params.toString()}` : ""}`)
    router.refresh()
  }

  const handleSortChange = (sort: SortOption) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "")
    if (sort === "newest") {
      params.delete("sort")
    } else {
      params.set("sort", sort)
    }
    router.push(`/index-single${params.toString() ? `?${params.toString()}` : ""}`)
    router.refresh()
  }

  const sortOptions: SortOption[] = [
    "newest",
    "popular",
    "best_rating",
    "price_low",
    "price_high",
  ]

  return (
    <section className="products section--padding">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="product-title-area">
              <div className="product__title">
                <a 
                  href="#" 
                  onClick={(e) => { 
                    e.preventDefault()
                    handleTabChange("newest")
                  }}
                >
                  <h2 className={activeTab === "newest" ? "" : ""}>Newest Products</h2>
                </a>
                <a 
                  href="#" 
                  onClick={(e) => { 
                    e.preventDefault()
                    handleTabChange("popular")
                  }}
                >
                  <h2 className={activeTab === "popular" ? "" : ""}>Popular Products</h2>
                </a>
              </div>

              <div className="filter__menu">
                <p>Filter by:</p>
                <div className="filter__menu_icon" ref={filterDropdownRef}>
                  <a
                    href="#"
                    className="dropdown-toggle"
                    onClick={(e) => {
                      e.preventDefault()
                      setFilterDropdownOpen(!filterDropdownOpen)
                    }}
                    aria-haspopup="true"
                    aria-expanded={filterDropdownOpen}
                  >
                    <img className="svg" src={withBasePath("/images/svg/menu.svg")} alt="menu icon" />
                  </a>

                  <ul
                    className={`filter_dropdown dropdown-menu ${filterDropdownOpen ? "show" : ""}`}
                    aria-labelledby="drop1"
                  >
                    {sortOptions.map((option) => (
                      <li key={option} className={activeSort === option ? "active" : undefined}>
                        <a 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault()
                            handleSortChange(option)
                            setFilterDropdownOpen(false)
                          }}
                        >
                          {sortOptionMap[option].label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="row">
            <div className="col-md-12">
              <div className="alert alert-warning">{error}</div>
            </div>
          </div>
        )}

        <div className="row">
          <div className="col-md-12">
            <div className="sorting">
              <ul>
                {sortOptions.map((option) => (
                  <li 
                    key={option} 
                    className={activeSort === option ? "active" : undefined}
                  >
                    <a 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault()
                        handleSortChange(option)
                      }}
                    >
                      {sortOptionMap[option].label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="row">
          {products.map((product) => (
            <div key={product.id} className="col-lg-4 col-md-6">
              <div className="product product--card product--card2">
                <div className="product__thumbnail">
                  <Image
                    src={product.image}
                    alt={product.title}
                    width={400}
                    height={300}
                    style={{ width: "100%", height: "auto" }}
                  />
                  <div className="prod_btn">
                    <Link href={`/single-product/${product.slug}`} className="transparent btn--sm btn--round">
                      More Info
                    </Link>
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
                      <Link href={`/single-product/${product.slug}`} className="transparent btn--sm btn--round">
                        Live Demo
                      </Link>
                    )}
                  </div>
                </div>

                <div className="product-desc">
                  <Link href={`/single-product/${product.slug}`} className="product_title">
                    <h4>{product.title}</h4>
                  </Link>
                  <p>{product.description}</p>
                </div>

                <ul className="titlebtm">
                  <li className="product_cat">
                    <Link href={`/all-products?category=${product.category.toLowerCase().replace(/\s+/g, "-")}`}>
                      <span className="lnr lnr-book"></span>
                      {product.category}
                    </Link>
                  </li>
                  {product.rating > 0 && (
                    <li className="rating product--rating">
                      <ul>
                        {[...Array(5)].map((_, i) => {
                          if (product.rating >= i + 1) {
                            return (
                              <li key={i}>
                                <span className="fa fa-star"></span>
                              </li>
                            )
                          } else if (product.rating >= i + 0.5) {
                            return (
                              <li key={i}>
                                <span className="fa fa-star-half-o"></span>
                              </li>
                            )
                          } else {
                            return (
                              <li key={i}>
                                <span className="fa fa-star-o"></span>
                              </li>
                            )
                          }
                        })}
                      </ul>
                    </li>
                  )}
                </ul>

                <div className="product-purchase">
                  <div className="price_love">
                    <span>{product.priceLabel}</span>
                    <p>
                      <span className="lnr lnr-heart"></span> {product.favorites}
                    </p>
                  </div>
                  <div className="sell">
                    <p>
                      <span className="lnr lnr-cart"></span>
                      <span>{product.sales}</span>sales
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="col-md-12">
            <div className="more-product">
              <Link href="/all-products" className="btn btn--lg btn--round">
                All Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

