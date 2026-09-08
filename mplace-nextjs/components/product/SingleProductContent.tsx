"use client"

import { useState, useEffect } from "react"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import ProductImageSlider from "./ProductImageSlider"
import ProductFavoriteButton from "./ProductFavoriteButton"
import ProductTabs from "./ProductTabs"
import SingleProductSidebar from "./SingleProductSidebar"

interface ProductImage {
  id: number
  url: string
  thumbnail: string
}

interface ProductSeller {
  id: string
  name: string
  username: string | null
  avatar: string
  signedUp: string
  facebookUrl?: string | null
  twitterUrl?: string | null
  dribbbleUrl?: string | null
}

interface ProductMetadata {
  totalSales: number
  favorites: number
  comments: number
  reviews: number
  rating: number
}

interface ProductInfo {
  released: string
  updated: string
  version: string
  layout: string
  retinaReady: string
  filesIncluded: string
  browser: string
  bootstrap: string
  tags: string[]
}

interface PricingOption {
  id: string
  label: string
  price: number
}

interface Product {
  id: string
  title: string
  description: string
  price: string
  priceMin: number
  priceMax: number
  livePreviewUrl?: string | null
  category: {
    name: string
    slug: string
  }
  seller: ProductSeller
  images: ProductImage[]
  metadata: ProductMetadata
  productInfo: ProductInfo
  pricingOptions: PricingOption[]
  isFavorited?: boolean
}

interface SingleProductContentProps {
  product: Product
}

export default function SingleProductContent({ product }: SingleProductContentProps) {
  const [favoriteCount, setFavoriteCount] = useState<number>(product.metadata.favorites)
  const [commentCount, setCommentCount] = useState<number>(product.metadata.comments)
  const [reviewCount, setReviewCount] = useState<number>(product.metadata.reviews)

  useEffect(() => {
    setFavoriteCount(product.metadata.favorites)
    setCommentCount(product.metadata.comments)
    setReviewCount(product.metadata.reviews)
  }, [product.metadata.favorites, product.metadata.comments, product.metadata.reviews])

  return (
    <section className="single-product-desc">
      <div className="container">
        <div className="row">
          <div className="col-lg-8">
            <ProductImageSlider images={product.images} />

            <div className="item__preview-thumb">
              <div className="prev-thumb">
                <div className="item-action">
                  <div className="action-btns">
                    {product.livePreviewUrl ? (
                      <a
                        href={product.livePreviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn--round btn--lg"
                      >
                        Live Preview
                      </a>
                    ) : (
                      <a
                        href="#"
                        className="btn btn--round btn--lg product-disabled-button"
                        onClick={(e) => e.preventDefault()}
                      >
                        Live Preview
                      </a>
                    )}
                  </div>
                  <ProductFavoriteButton
                    productId={product.id}
                    initialFavoriteCount={product.metadata.favorites}
                    initialIsFavorited={Boolean(product.isFavorited)}
                    onFavoriteChange={(count) => {
                      setFavoriteCount(count)
                    }}
                  />
                </div>
              </div>
            </div>

            <ProductTabs
              product={{
                id: product.id,
                title: product.title,
                description: product.description,
              }}
              commentCount={commentCount}
              reviewCount={reviewCount}
              onCommentCountChange={setCommentCount}
              onReviewCountChange={setReviewCount}
            />
          </div>

          <div className="col-lg-4">
            <SingleProductSidebar
              product={product}
              favoriteCount={favoriteCount}
              commentCount={commentCount}
              reviewCount={reviewCount}
            />
          </div>
        </div>
      </div>
    </section>
  )
}