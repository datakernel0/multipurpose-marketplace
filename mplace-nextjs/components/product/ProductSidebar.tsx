"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { getApiUrl, withBasePath } from "@/utils/paths"
import Slider from "rc-slider"
import "rc-slider/assets/index.css"

interface Category {
  id: string
  name: string
  slug: string
  _count?: {
    products: number
  }
}

export default function ProductSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesOpen, setCategoriesOpen] = useState(true)
  const [filterOpen, setFilterOpen] = useState(true)
  const [priceRangeOpen, setPriceRangeOpen] = useState(true)
  
  // Price range state - initialize from URL params or use defaults
  const minPriceFromUrl = searchParams?.get("minPrice")
  const maxPriceFromUrl = searchParams?.get("maxPrice")
  const [priceRange, setPriceRange] = useState<number[]>([
    minPriceFromUrl ? parseInt(minPriceFromUrl) : 0,
    maxPriceFromUrl ? parseInt(maxPriceFromUrl) : 500,
  ])

  // Filter checkboxes state
  const [filters, setFilters] = useState({
    trending: searchParams?.get("trending") === "true",
    popular: searchParams?.get("popular") === "true",
    new: searchParams?.get("new") === "true",
    bestSeller: searchParams?.get("bestSeller") === "true",
    bestRating: searchParams?.get("bestRating") === "true",
    freeSupport: searchParams?.get("freeSupport") === "true",
    onSale: searchParams?.get("onSale") === "true",
  })

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
    if (!searchParams) return
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    if (minPrice || maxPrice) {
      setPriceRange([
        minPrice ? parseInt(minPrice) : 0,
        maxPrice ? parseInt(maxPrice) : 500,
      ])
    } else {
      setPriceRange([0, 500])
    }
  }, [searchParams])

  // Build URL with updated params
  const buildFilterUrl = (updates: { [key: string]: string | null }) => {
    const params = new URLSearchParams()
    
    // Preserve existing params
    if (searchParams) {
      searchParams.forEach((value, key) => {
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
    
    return `${pathname}${params.toString() ? `?${params.toString()}` : ""}`
  }

  const handleCategoryClick = (categorySlug: string | null) => {
    router.push(buildFilterUrl({ category: categorySlug }))
  }

  const handleFilterChange = (filterName: keyof typeof filters) => {
    const newFilters = { ...filters, [filterName]: !filters[filterName] }
    setFilters(newFilters)
    
    const updates: { [key: string]: string | null } = {}
    if (newFilters.trending) updates.trending = "true"
    else updates.trending = null
    if (newFilters.popular) updates.popular = "true"
    else updates.popular = null
    if (newFilters.new) updates.new = "true"
    else updates.new = null
    if (newFilters.bestSeller) updates.bestSeller = "true"
    else updates.bestSeller = null
    if (newFilters.bestRating) updates.bestRating = "true"
    else updates.bestRating = null
    if (newFilters.freeSupport) updates.freeSupport = "true"
    else updates.freeSupport = null
    if (newFilters.onSale) updates.onSale = "true"
    else updates.onSale = null
    
    router.push(buildFilterUrl(updates))
  }

  const handlePriceRangeChange = (values: number | number[]) => {
    if (Array.isArray(values)) {
      setPriceRange(values)
    }
  }

  const handlePriceRangeComplete = (values: number | number[]) => {
    if (Array.isArray(values)) {
      router.push(buildFilterUrl({ 
        minPrice: values[0].toString(), 
        maxPrice: values[1].toString() 
      }))
    }
  }

  const currentCategory = searchParams?.get("category")

  return (
    <aside className="sidebar product--sidebar">
      <div className="sidebar-card card--category">
        <a
          className="card-title"
          href="#collapse1"
          role="button"
          onClick={(e) => {
            e.preventDefault()
            setCategoriesOpen(!categoriesOpen)
          }}
          aria-expanded={categoriesOpen}
        >
          <h4>
            Categories
            <span className="lnr lnr-chevron-down"></span>
          </h4>
        </a>
        <div className={`collapse ${categoriesOpen ? "show" : ""} collapsible-content`} id="collapse1">
          <ul className="card-content">
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  handleCategoryClick(null)
                }}
                className={!currentCategory ? "active" : ""}
              >
                <span className="lnr lnr-chevron-right"></span>All Categories
              </a>
            </li>
            {categories.map((category) => (
              <li key={category.id}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    handleCategoryClick(category.slug)
                  }}
                  className={currentCategory === category.slug ? "active" : ""}
                >
                  <span className="lnr lnr-chevron-right"></span>
                  {category.name}
                  {category._count?.products !== undefined && (
                    <span className="item-count">{category._count.products}</span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="sidebar-card card--filter">
        <a
          className="card-title"
          href="#collapse2"
          role="button"
          onClick={(e) => {
            e.preventDefault()
            setFilterOpen(!filterOpen)
          }}
          aria-expanded={filterOpen}
        >
          <h4>
            Filter Products
            <span className="lnr lnr-chevron-down"></span>
          </h4>
        </a>
        <div className={`collapse ${filterOpen ? "show" : ""} collapsible-content`} id="collapse2">
          <ul className="card-content">
            <li>
              <div className="custom-checkbox2">
                <input
                  type="checkbox"
                  id="opt1"
                  name="filter_opt"
                  checked={filters.trending}
                  onChange={() => handleFilterChange("trending")}
                />
                <label htmlFor="opt1">
                  <span className="circle"></span>Trending Products
                </label>
              </div>
            </li>
            <li>
              <div className="custom-checkbox2">
                <input
                  type="checkbox"
                  id="opt2"
                  name="filter_opt"
                  checked={filters.popular}
                  onChange={() => handleFilterChange("popular")}
                />
                <label htmlFor="opt2">
                  <span className="circle"></span>Popular Products
                </label>
              </div>
            </li>
            <li>
              <div className="custom-checkbox2">
                <input
                  type="checkbox"
                  id="opt3"
                  name="filter_opt"
                  checked={filters.new}
                  onChange={() => handleFilterChange("new")}
                />
                <label htmlFor="opt3">
                  <span className="circle"></span>New Products
                </label>
              </div>
            </li>
            <li>
              <div className="custom-checkbox2">
                <input
                  type="checkbox"
                  id="opt4"
                  name="filter_opt"
                  checked={filters.bestSeller}
                  onChange={() => handleFilterChange("bestSeller")}
                />
                <label htmlFor="opt4">
                  <span className="circle"></span>Best Seller
                </label>
              </div>
            </li>
            <li>
              <div className="custom-checkbox2">
                <input
                  type="checkbox"
                  id="opt5"
                  name="filter_opt"
                  checked={filters.bestRating}
                  onChange={() => handleFilterChange("bestRating")}
                />
                <label htmlFor="opt5">
                  <span className="circle"></span>Best Rating
                </label>
              </div>
            </li>
            <li>
              <div className="custom-checkbox2">
                <input
                  type="checkbox"
                  id="opt6"
                  name="filter_opt"
                  checked={filters.freeSupport}
                  onChange={() => handleFilterChange("freeSupport")}
                />
                <label htmlFor="opt6">
                  <span className="circle"></span>Free Support
                </label>
              </div>
            </li>
            <li>
              <div className="custom-checkbox2">
                <input
                  type="checkbox"
                  id="opt7"
                  name="filter_opt"
                  checked={filters.onSale}
                  onChange={() => handleFilterChange("onSale")}
                />
                <label htmlFor="opt7">
                  <span className="circle"></span>On Sale
                </label>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="sidebar-card card--slider">
        <a
          className="card-title"
          href="#collapse3"
          role="button"
          onClick={(e) => {
            e.preventDefault()
            setPriceRangeOpen(!priceRangeOpen)
          }}
          aria-expanded={priceRangeOpen}
        >
          <h4>
            Price Range
            <span className="lnr lnr-chevron-down"></span>
          </h4>
        </a>
        <div className={`collapse ${priceRangeOpen ? "show" : ""} collapsible-content`} id="collapse3">
          <div className="card-content">
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
      </div>
    </aside>
  )
}

