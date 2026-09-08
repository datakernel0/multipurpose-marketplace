"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { withBasePath, getApiUrl } from "@/utils/paths"
import Slider from "rc-slider"
import "rc-slider/assets/index.css"

interface Category {
  id: string
  name: string
  slug: string
}

export default function FilterArea() {
  const router = useRouter()
  const searchParamsHook = useSearchParams()
  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [filterByOpen, setFilterByOpen] = useState(false)
  const [priceRangeOpen, setPriceRangeOpen] = useState(false)
  const categoriesRef = useRef<HTMLDivElement>(null)
  const filterByRef = useRef<HTMLDivElement>(null)
  const priceRangeRef = useRef<HTMLDivElement>(null)
  
  // Price range state - initialize from URL params or use defaults
  const minPriceFromUrl = searchParamsHook?.get("minPrice")
  const maxPriceFromUrl = searchParamsHook?.get("maxPrice")
  const [priceRange, setPriceRange] = useState<number[]>([
    minPriceFromUrl ? parseInt(minPriceFromUrl) : 0,
    maxPriceFromUrl ? parseInt(maxPriceFromUrl) : 500,
  ])

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch(getApiUrl("/api/categories"))
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error)
      }
    }
    fetchCategories()
  }, [])

  // Update price range when URL params change
  useEffect(() => {
    if (!searchParamsHook) return
    const minPrice = searchParamsHook.get("minPrice")
    const maxPrice = searchParamsHook.get("maxPrice")
    if (minPrice || maxPrice) {
      setPriceRange([
        minPrice ? parseInt(minPrice) : 0,
        maxPrice ? parseInt(maxPrice) : 500,
      ])
    } else {
      setPriceRange([0, 500])
    }
  }, [searchParamsHook])

  // Build URL with updated params
  const buildFilterUrl = (updates: { [key: string]: string | null }) => {
    const params = new URLSearchParams()
    
    // Preserve existing params
    if (searchParamsHook) {
      searchParamsHook.forEach((value, key) => {
        if (!updates.hasOwnProperty(key)) {
          params.append(key, value)
        }
      })
    }
    
    // Add/update new params
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== null && value !== "") {
        params.append(key, value)
      }
    })
    
    // Reset to page 1 when filters change
    params.delete("page")
    
    return `/all-products${params.toString() ? `?${params.toString()}` : ""}`
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sortBy = e.target.value
    router.push(buildFilterUrl({ sortBy }))
  }

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const limit = e.target.value
    router.push(buildFilterUrl({ limit }))
  }

  const handlePriceRangeChange = (values: number | number[]) => {
    if (Array.isArray(values)) {
      setPriceRange(values)
    }
  }

  const handlePriceRangeComplete = (values: number | number[]) => {
    if (Array.isArray(values)) {
      // Apply filter when user finishes dragging
      router.push(
        buildFilterUrl({
          minPrice: values[0] > 0 ? values[0].toString() : null,
          maxPrice: values[1] < 500 ? values[1].toString() : null,
        })
      )
      router.refresh() // Force server-side re-fetch
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
        setCategoriesOpen(false)
      }
      if (filterByRef.current && !filterByRef.current.contains(event.target as Node)) {
        setFilterByOpen(false)
      }
      if (priceRangeRef.current && !priceRangeRef.current.contains(event.target as Node)) {
        setPriceRangeOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="filter-area">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="filter-bar">
              <div className="filter__option filter--dropdown" ref={categoriesRef}>
                <a
                  href="#"
                  id="drop1"
                  className="dropdown-trigger dropdown-toggle"
                  onClick={(e) => {
                    e.preventDefault()
                    setCategoriesOpen(!categoriesOpen)
                  }}
                  aria-haspopup="true"
                  aria-expanded={categoriesOpen}
                >
                  Categories
                  <span className="lnr lnr-chevron-down"></span>
                </a>
                <ul
                  className={`custom_dropdown custom_drop2 dropdown-menu ${categoriesOpen ? "show" : ""}`}
                  aria-labelledby="drop1"
                >
                  <li>
                    <Link 
                      href={buildFilterUrl({ category: null })}
                      onClick={() => setCategoriesOpen(false)}
                    >
                      All Categories
                    </Link>
                  </li>
                  {categories.map((category) => (
                    <li key={category.id}>
                      <Link 
                        href={buildFilterUrl({ category: category.slug })}
                        onClick={() => setCategoriesOpen(false)}
                      >
                        {category.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="filter__option filter--dropdown" ref={filterByRef}>
                <a
                  href="#"
                  id="drop2"
                  className="dropdown-trigger dropdown-toggle"
                  onClick={(e) => {
                    e.preventDefault()
                    setFilterByOpen(!filterByOpen)
                  }}
                  aria-haspopup="true"
                  aria-expanded={filterByOpen}
                >
                  Filter By
                  <span className="lnr lnr-chevron-down"></span>
                </a>
                <ul
                  className={`custom_dropdown dropdown-menu ${filterByOpen ? "show" : ""}`}
                  aria-labelledby="drop2"
                >
                  <li>
                    <Link 
                      href={buildFilterUrl({ featured: "true" })}
                      onClick={() => setFilterByOpen(false)}
                    >
                      Featured items
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href={buildFilterUrl({ sortBy: "popular" })}
                      onClick={() => setFilterByOpen(false)}
                    >
                      Popular items
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href={buildFilterUrl({ sortBy: "newest" })}
                      onClick={() => setFilterByOpen(false)}
                    >
                      New items
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href={buildFilterUrl({ sortBy: "popular" })}
                      onClick={() => setFilterByOpen(false)}
                    >
                      Best seller
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href={buildFilterUrl({ sortBy: "rating" })}
                      onClick={() => setFilterByOpen(false)}
                    >
                      Best rating
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="filter__option filter--dropdown filter--range" ref={priceRangeRef}>
                <a
                  href="#"
                  id="drop3"
                  className="dropdown-trigger dropdown-toggle"
                  onClick={(e) => {
                    e.preventDefault()
                    setPriceRangeOpen(!priceRangeOpen)
                  }}
                  aria-haspopup="true"
                  aria-expanded={priceRangeOpen}
                >
                  Price Range
                  <span className="lnr lnr-chevron-down"></span>
                </a>
                <div
                  className={`custom_dropdown dropdown-menu ${priceRangeOpen ? "show" : ""}`}
                  aria-labelledby="drop3"
                >
                  <div className="range-slider price-range">
                    <Slider
                      range
                      min={0}
                      max={500}
                      value={priceRange}
                      onChange={handlePriceRangeChange}
                      onChangeComplete={handlePriceRangeComplete}
                      trackStyle={[{ backgroundColor: "#7347c1", height: 6 }]}
                      handleStyle={[
                        {
                          backgroundColor: "#0674ec",
                          borderColor: "#0674ec",
                          width: 18,
                          height: 18,
                          marginTop: -6,
                          border: "none",
                          boxShadow: "none",
                        },
                        {
                          backgroundColor: "#0674ec",
                          borderColor: "#0674ec",
                          width: 18,
                          height: 18,
                          marginTop: -6,
                          border: "none",
                          boxShadow: "none",
                        },
                      ]}
                      railStyle={{ backgroundColor: "#efedf3", height: 6 }}
                    />
                  </div>
                  <div className="price-ranges">
                    <span className="from rounded">${priceRange[0]}</span>
                    <span className="to rounded">${priceRange[1]}</span>
                  </div>
                </div>
              </div>

              <div className="filter__option filter--select">
                <div className="select-wrap">
                  <select 
                    name="price"
                    value={searchParamsHook?.get("sortBy") || "newest"}
                    onChange={handleSortChange}
                  >
                    <option value="newest">Newest</option>
                    <option value="popular">Popular</option>
                    <option value="price-low">Price : Low to High</option>
                    <option value="price-high">Price : High to Low</option>
                    <option value="rating">Best Rating</option>
                  </select>
                  <span className="lnr lnr-chevron-down"></span>
                </div>
              </div>

              <div className="filter__option filter--select">
                <div className="select-wrap">
                  <select 
                    name="items"
                    value={searchParamsHook?.get("limit") || "9"}
                    onChange={handleLimitChange}
                  >
                    <option value="9">9 Items per page</option>
                    <option value="12">12 Items per page</option>
                    <option value="15">15 Items per page</option>
                    <option value="25">25 Items per page</option>
                    <option value="50">50 Items per page</option>
                  </select>
                  <span className="lnr lnr-chevron-down"></span>
                </div>
              </div>

              <div className="filter__option filter--layout">
                <Link href="/all-products">
                  <div className="svg-icon">
                    <img className="svg" src={withBasePath("/images/svg/grid.svg")} alt="Grid layout" />
                  </div>
                </Link>
                <Link href="/all-products-list">
                  <div className="svg-icon">
                    <img className="svg" src={withBasePath("/images/svg/list.svg")} alt="List layout" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

