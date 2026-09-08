"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { withBasePath, getApiUrl } from "@/utils/paths"

export default function HeroSection() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [category, setCategory] = useState("")
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([])

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim())
    }
    if (category) {
      params.set("category", category)
    }
    const queryString = params.toString()
    router.push(`/all-products${queryString ? `?${queryString}` : ""}`)
    router.refresh()
  }

  return (
    <section className="hero-area bgimage">
      <div className="bg_image_holder">
        <img src={withBasePath("/images/hero_area_bg1.jpg")} alt="background-image" />
      </div>
      
      <div className="hero-content content_above">
        <div className="content-wrapper">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="hero__content__title">
                  <h1>
                    <span className="light">Create Your Own</span>
                    <span className="bold">Digital Product Marketplace</span>
                  </h1>
                  <p className="tagline">
                    MartPlace is the most powerful, & customizable template for Easy Digital Downloads Products
                  </p>
                </div>

                <div className="hero__btn-area">
                  <Link href="/all-products" className="btn btn--round btn--lg">
                    View All Products
                  </Link>
                  <Link href="/all-products" className="btn btn--round btn--lg">
                    Popular Products
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="search-area">
        <div className="container">
          <div className="row">
            <div className="col-sm-12">
              <div className="search_box">
                <form onSubmit={handleSearch}>
                  <input
                    type="text"
                    className="text_field"
                    name="q"
                    placeholder="Search your products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="search__select select-wrap">
                    <select 
                      name="category" 
                      className="select--field" 
                      id="category-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.slug}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <span className="lnr lnr-chevron-down"></span>
                  </div>
                  <button type="submit" className="search-btn btn--lg">
                    Search Now
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

