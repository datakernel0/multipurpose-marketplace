"use client"

import Link from "next/link"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { withBasePath } from "@/utils/paths"

interface FilterArea2Props {
  showTextFilters?: boolean
}

export default function FilterArea2({ showTextFilters = false }: FilterArea2Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

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

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sortBy = e.target.value
    router.push(buildFilterUrl({ sortBy }))
  }

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const limit = e.target.value
    router.push(buildFilterUrl({ limit }))
  }

  return (
    <div className="filter-area">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="filter-bar filter--bar2">
              {showTextFilters && (
                <div className="filter__option filter--text pull-left">
                  <Link href={buildFilterUrl({ sortBy: "newest" })}>New Products</Link>
                  <Link href={buildFilterUrl({ sortBy: "popular" })}>Popular Products</Link>
                </div>
              )}
              <div className="pull-right">
                <div className="filter__option filter--select">
                  <div className="select-wrap">
                    <select 
                      name="price"
                      value={searchParams?.get("sortBy") || "newest"}
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
                      value={searchParams?.get("limit") || "12"}
                      onChange={handleLimitChange}
                    >
                      <option value="12">12 Items per page</option>
                      <option value="15">15 Items per page</option>
                      <option value="25">25 Items per page</option>
                      <option value="50">50 Items per page</option>
                    </select>
                    <span className="lnr lnr-chevron-down"></span>
                  </div>
                </div>
                <div className="filter__option filter--layout">
                  <Link href="/category-grid">
                    <div className="svg-icon">
                      <img className="svg" src={withBasePath("/images/svg/grid.svg")} alt="Grid layout" />
                    </div>
                  </Link>
                  <Link href="/category-list">
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
    </div>
  )
}

