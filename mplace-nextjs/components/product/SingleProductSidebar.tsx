"use client"

import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { withBasePath } from "@/utils/paths"
import ProductCartActions from "./ProductCartActions"

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

interface ProductSidebarProps {
  product: {
    id: string
    priceMin: number
    priceMax: number
    category: {
      name: string
    }
    seller: ProductSeller
    metadata: ProductMetadata
    productInfo: ProductInfo
    pricingOptions: PricingOption[]
  }
  favoriteCount: number
  commentCount: number
  reviewCount: number
}

function renderStars(rating: number) {
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

export default function ProductSidebar({
  product,
  favoriteCount,
  commentCount,
  reviewCount,
}: ProductSidebarProps) {
  const router = useRouter()
  const { status } = useSession()
  const isAuthenticated = status === "authenticated"

  return (
    <aside className="sidebar sidebar--single-product">
      <div className="sidebar-card card-pricing">
        <div className="price">
          <h1>
            <sup>$</sup>
            {product.priceMin} -<sup>$</sup>
            {product.priceMax}
          </h1>
        </div>
        <ul className="pricing-options">
          {product.pricingOptions.map((option) => (
            <li key={option.id}>
              <div className="custom-radio">
                <input
                  type="radio"
                  id={option.id}
                  name="filter_opt"
                  defaultChecked={option.id === "opt1"}
                />
                <label htmlFor={option.id}>
                  <span className="circle"></span>
                  {option.label} –<span className="pricing__opt">${option.price.toFixed(2)}</span>
                </label>
              </div>
            </li>
          ))}
        </ul>

        <div className="purchase-button">
          <button
            type="button"
            className="btn btn--lg btn--round"
            onClick={() => {
              if (!isAuthenticated) {
                if (typeof window !== "undefined") {
                  const callbackUrl = encodeURIComponent(window.location.pathname + window.location.search)
                  router.push(`/login?callbackUrl=${callbackUrl}`)
                } else {
                  router.push("/login")
                }
                return
              }

              const checkoutUrl = `/checkout?productId=${encodeURIComponent(product.id)}`
              router.push(checkoutUrl)
            }}
          >
            Purchase Now
          </button>
          <ProductCartActions productId={product.id} />
        </div>
      </div>

      <div className="sidebar-card card--metadata">
        <ul className="data">
          <li>
            <p>
              <span className="lnr lnr-cart pcolor"></span>Total Sales
            </p>
            <span>{product.metadata.totalSales}</span>
          </li>
          <li>
            <p>
              <span className="lnr lnr-heart scolor"></span>Favorites
            </p>
            <span>{favoriteCount}</span>
          </li>
          <li>
            <p>
              <span className="lnr lnr-bubble mcolor3"></span>Comments
            </p>
            <span>{commentCount}</span>
          </li>
        </ul>

        <div className="rating product--rating">
          <ul>{renderStars(product.metadata.rating)}</ul>
          <span className="rating__count">( {reviewCount} Ratings )</span>
        </div>
      </div>

      <div className="sidebar-card card--product-infos">
        <div className="card-title">
          <h4>Product Information</h4>
        </div>

        <ul className="infos">
          <li>
            <p className="data-label">Released</p>
            <p className="info">{product.productInfo.released}</p>
          </li>
          <li>
            <p className="data-label">Updated</p>
            <p className="info">{product.productInfo.updated}</p>
          </li>
          <li>
            <p className="data-label">Version</p>
            <p className="info">{product.productInfo.version}</p>
          </li>
          <li>
            <p className="data-label">Category</p>
            <p className="info">{product.category.name}</p>
          </li>
          <li>
            <p className="data-label">Layout</p>
            <p className="info">{product.productInfo.layout}</p>
          </li>
          <li>
            <p className="data-label">Retina Ready</p>
            <p className="info">{product.productInfo.retinaReady}</p>
          </li>
          <li>
            <p className="data-label">Files Included</p>
            <p className="info">{product.productInfo.filesIncluded}</p>
          </li>
          <li>
            <p className="data-label">Browser</p>
            <p className="info">{product.productInfo.browser}</p>
          </li>
          <li>
            <p className="data-label">Bootstrap</p>
            <p className="info">{product.productInfo.bootstrap}</p>
          </li>
          <li>
            <p className="data-label">Tags</p>
            <p className="info product-tags-text">
              {product.productInfo.tags && product.productInfo.tags.length > 0 ? (
                product.productInfo.tags.map((tag, index) => (
                  <span key={index} >
                    {tag}
                    {index < product.productInfo.tags.length - 1 && ", "}
                  </span>
                ))
              ) : (
                <span>No tags available</span>
              )}
            </p>
          </li>
        </ul>
      </div>

      <div className="author-card sidebar-card">
        <div className="card-title">
          <h4>Product Author</h4>
        </div>

        <div className="author-infos">
          <div className="author_avatar">
            <Image 
              src={withBasePath(product.seller.avatar)} 
              alt="Author avatar" 
              width={80}
              height={80}
              className="product-author-avatar"
            />
          </div>

          <div className="author">
            <h4>{product.seller.name}</h4>
            <p>Signed Up: {product.seller.signedUp}</p>
          </div>

          <div className="social social--color--filled">
            <ul>
              {product.seller.facebookUrl && (
                <li>
                  <a href={product.seller.facebookUrl} target="_blank" rel="noopener noreferrer">
                    <span className="fa fa-facebook"></span>
                  </a>
                </li>
              )}
              {product.seller.twitterUrl && (
                <li>
                  <a href={product.seller.twitterUrl} target="_blank" rel="noopener noreferrer">
                    <span className="fa fa-twitter"></span>
                  </a>
                </li>
              )}
              {product.seller.dribbbleUrl && (
                <li>
                  <a href={product.seller.dribbbleUrl} target="_blank" rel="noopener noreferrer">
                    <span className="fa fa-dribbble"></span>
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div className="author-btn">
            <Link 
              href={product.seller.username 
                ? `/author?username=${encodeURIComponent(product.seller.username)}` 
                : `/author?username=${product.seller.id}`} 
              className="btn btn--sm btn--round"
            >
              View Profile
            </Link>
            <Link 
              href={`/message?to=${encodeURIComponent(product.seller.id)}`} 
              className="btn btn--sm btn--round"
            >
              Message
            </Link>
          </div>
        </div>
      </div>
    </aside>
  )
}
