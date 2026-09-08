"use client"

import { useState } from "react"
import Link from "next/link"
import SingleProductComments from "@/components/product/SingleProductComments"
import SingleProductReviews from "@/components/product/SingleProductReviews"
import type { ReviewStats } from "@/components/product/SingleProductReviews"
import ProductSupportForm from "./ProductSupportForm"
import ProductFAQ from "./ProductFAQ"
import SafeHTMLRenderer from "@/components/common/SafeHTMLRenderer"
import { withBasePath } from "@/utils/paths"

interface ProductTabsProps {
  product: {
    id: string
    title: string
    description: string
  }
  commentCount: number
  reviewCount: number
  onCommentCountChange: (count: number) => void
  onReviewCountChange: (count: number) => void
}

export default function ProductTabs({
  product,
  commentCount,
  reviewCount,
  onCommentCountChange,
  onReviewCountChange,
}: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState("product-details")

  return (
    <div className="item-info">
      <div className="item-navigation">
        <ul className="nav nav-tabs">
          <li>
            <a
              href="#0"
              className={activeTab === "product-details" ? "active" : ""}
              onClick={() => setActiveTab("product-details")}
            >
              Item Details
            </a>
          </li>
          <li>
            <a
              href="#0"
              className={activeTab === "product-comment" ? "active" : ""}
              onClick={() => setActiveTab("product-comment")}
            >
              Comments <span>({commentCount})</span>
            </a>
          </li>
          <li>
            <a
              href="#0"
              className={activeTab === "product-review" ? "active" : ""}
              onClick={() => setActiveTab("product-review")}
            >
              Reviews <span>({reviewCount})</span>
            </a>
          </li>
          <li>
            <a
              href="#0"
              className={activeTab === "product-support" ? "active" : ""}
              onClick={() => setActiveTab("product-support")}
            >
              Support
            </a>
          </li>
          <li>
            <a
              href="#0"
              className={activeTab === "product-faq" ? "active" : ""}
              onClick={() => setActiveTab("product-faq")}
            >
              item FAQ
            </a>
          </li>
        </ul>
      </div>

      <div className="tab-content">
        {activeTab === "product-details" && (
          <div className="fade show tab-pane product-tab active">
            <div className="tab-content-wrapper">
              <h1>{product.title} Details</h1>
              {product.description ? (
                <SafeHTMLRenderer
                  html={product.description}
                  className="product-description product-description-text"
                />
              ) : (
                <p>No description provided.</p>
              )}
              <h2>Features With Image:</h2>
              <img src={withBasePath("/images/prodesc.jpg")} alt="Product description" />

              <h2>Features With HTML List Unordered:</h2>
              <ul>
                <li>Six different themes for product slider</li>
                <li>Featured products slider form selected categories.</li>
                <li>Product slider form specific categories of products. Include or exclude categories.</li>
                <li>Product slider form specific tags of products. Include or exclude tags. New</li>
              </ul>

              <h2>Features With HTML List Ordered:</h2>
              <ol>
                <li>Six different themes for product slider</li>
                <li>Featured products slider form selected categories.</li>
                <li>Product slider form specific categories of products. Include or exclude categories.</li>
                <li>Product slider form specific tags of products. Include or exclude tags. New</li>
              </ol>

              <h2>Features With Video:</h2>
              <iframe
                width="100%"
                height="400"
                src="https://www.youtube.com/embed/w2zIUJrglR4"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                title="Product video"
                loading="lazy"
              ></iframe>
            </div>
          </div>
        )}

        <div
          className={`fade tab-pane product-tab${activeTab === "product-comment" ? " show active" : ""}`}
          id="product-comment"
          role="tabpanel"
          aria-labelledby="product-comment-tab"
        >
          <SingleProductComments
            productId={product.id}
            onCountsChange={(counts) => {
              onCommentCountChange(counts.total)
            }}
          />
        </div>

        {activeTab === "product-review" && (
          <div className="fade show tab-pane product-tab active">
            <SingleProductReviews
              productId={product.id}
              onStatsChange={(stats: ReviewStats) => onReviewCountChange(stats.total)}
            />
          </div>
        )}

        {activeTab === "product-support" && (
          <div className="fade show tab-pane product-tab active">
            <div className="support">
              <div className="support__title">
                <h3>Contact the Author</h3>
              </div>
              <div className="support__form">
                <div className="usr-msg">
                  <ProductSupportForm productId={product.id} />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "product-faq" && (
          <div className="fade show tab-pane product-tab active">
            <ProductFAQ />
          </div>
        )}
      </div>
    </div>
  )
}

