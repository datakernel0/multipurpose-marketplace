"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { getApiUrl, withBasePath } from "@/utils/paths"

interface MoreProductsSectionProps {
  sellerId?: string
}

interface Product {
  id: string
  slug: string
  title: string
  price: number
  salePrice?: number | null
  images?: string[] | null
  description?: string | null
  avgRating?: number
  downloads?: number
}

export default function MoreProductsSection({ sellerId }: MoreProductsSectionProps) {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    if (!sellerId) return

    const loadProducts = async () => {
      try {
        const response = await fetch(
          getApiUrl(`/api/products?sellerId=${encodeURIComponent(sellerId)}&limit=3&sortBy=newest`),
          { cache: "no-store" },
        )
        if (!response.ok) return
        const data = await response.json()
        setProducts(Array.isArray(data.products) ? data.products : [])
      } catch {
        setProducts([])
      }
    }

    void loadProducts()
  }, [sellerId])

  if (!sellerId || products.length === 0) return null

  return (
    <section className="more_product_area section--padding">
      <div className="container">
        <div className="section-title">
          <h2>More from this creator</h2>
        </div>
        <div className="row">
          {products.map((product) => {
            const image = product.images?.find(Boolean)
            const price = product.salePrice != null && product.salePrice < product.price
              ? product.salePrice
              : product.price

            return (
              <div key={product.id} className="col-lg-4 col-md-6">
                <article className="product product--card">
                  <div className="product__thumbnail">
                    {image ? (
                      <img src={withBasePath(image)} alt={product.title} />
                    ) : (
                      <div className="marketnest-product-placeholder">No preview available</div>
                    )}
                  </div>
                  <div className="product-desc">
                    <Link href={`/single-product/${product.slug}`} className="product_title">
                      <h4>{product.title}</h4>
                    </Link>
                    <p>{product.description?.slice(0, 100) || "Digital product from this creator."}</p>
                  </div>
                  <div className="product-purchase">
                    <div className="price_love"><span>${price.toFixed(2)}</span></div>
                    <div className="sell"><p>{product.downloads ?? 0} sales</p></div>
                  </div>
                </article>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}