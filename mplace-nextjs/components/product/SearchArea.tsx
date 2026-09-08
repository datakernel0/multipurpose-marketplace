"use client"

import { useState, FormEvent } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import Link from "next/link"
import { withBasePath } from "@/utils/paths"

export default function SearchArea() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams?.get("q") || searchParams?.get("search") || "")

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const query = searchQuery.trim()
    
    if (!query) {
      // If no query, go to all-products page
      router.push("/all-products")
      return
    }

    // Build URL with search query
    const params = new URLSearchParams()
    params.append("search", query)
    
    // Preserve other search params if we're already on a products page
    if (pathname?.includes("/all-products")) {
      searchParams?.forEach((value, key) => {
        if (key !== "search" && key !== "q" && key !== "page") {
          params.append(key, value)
        }
      })
    }
    
    // Navigate to all-products with search query
    router.push(`/all-products?${params.toString()}`)
    router.refresh() // Force server-side re-fetch
  }

  return (
    <section className="search-wrapper">
      <div className="search-area2 bgimage">
        <div className="bg_image_holder">
          <img src={withBasePath("/images/search.jpg")} alt="" />
        </div>
        <div className="container content_above">
          <div className="row">
            <div className="col-md-8 offset-md-2">
              <div className="search">
                <div className="search__title">
                  <h3>
                    <span>35,270</span> website templates from our creative community
                  </h3>
                </div>
                <div className="search__field">
                  <form onSubmit={handleSearch}>
                    <div className="field-wrapper">
                      <input 
                        className="relative-field rounded" 
                        type="text" 
                        name="q" 
                        placeholder="Search your products"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <button className="btn btn--round" type="submit">
                        Search
                      </button>
                    </div>
                  </form>
                </div>
                <div className="breadcrumb">
                  <ul>
                    <li>
                      <Link href="/">Home</Link>
                    </li>
                    <li className="active">
                      <Link href="/all-products">All Products</Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

