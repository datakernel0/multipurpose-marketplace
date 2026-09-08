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
    <section className="hero-area marketnest-hero">
      <div className="bg_image_holder">
        <img src={withBasePath("/images/hero_area_bg1.jpg")} alt="background-image" />
      </div>

      <div className="container">
        <div className="marketnest-hero__layout">
          <div className="marketnest-hero__copy">
            <span className="marketnest-eyebrow">The independent creator marketplace</span>
            <h1>Discover Digital Products Built to Help You Create More</h1>
            <p>
              Explore templates, source code, graphics, tools and digital resources from independent creators.
            </p>
            <div className="marketnest-hero__actions">
              <Link href="/all-products" className="marketnest-button marketnest-button--primary">
                Browse Products
              </Link>
              <Link href="/dashboard/upload" className="marketnest-button marketnest-button--quiet">
                Start Selling
              </Link>
            </div>
          </div>

          <div className="marketnest-hero__art" aria-hidden="true">
            <div className="marketnest-hero__art-top">
              <span className="marketnest-art-dot"></span>
              <span>Made for the next idea</span>
            </div>
            <div className="marketnest-art-window">
              <div className="marketnest-art-window__bar">
                <span></span><span></span><span></span>
              </div>
              <div className="marketnest-art-window__body">
                <div className="marketnest-art-sidebar"></div>
                <div className="marketnest-art-content">
                  <div className="marketnest-art-line marketnest-art-line--wide"></div>
                  <div className="marketnest-art-line"></div>
                  <div className="marketnest-art-grid">
                    <span></span><span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            </div>
            <span className="marketnest-art-chip marketnest-art-chip--one">Templates</span>
            <span className="marketnest-art-chip marketnest-art-chip--two">Source code</span>
            <span className="marketnest-art-chip marketnest-art-chip--three">UI kits</span>
          </div>
        </div>

        <div className="marketnest-search-panel">
          <div>
            <span className="marketnest-search-panel__label">Find your next resource</span>
            <span className="marketnest-search-panel__hint">Search thousands of digital products</span>
          </div>
          <form onSubmit={handleSearch}>
            <div className="marketnest-search-field">
              <span className="lnr lnr-magnifier" aria-hidden="true"></span>
              <input
                type="text"
                name="q"
                placeholder="What are you looking for?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              name="category"
              aria-label="Filter by category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
            <button type="submit" className="marketnest-button marketnest-button--primary">Search</button>
          </form>
        </div>
      </div>
    </section>
  )
}

