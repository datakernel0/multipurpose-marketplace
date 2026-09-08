import { Suspense } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import SearchArea from "@/components/product/SearchArea"
import CallToActionSection from "@/components/sections/CallToActionSection"
import { getApiUrl, withBasePath } from "@/utils/paths"
import Link from "next/link"
import { prisma } from "@/lib/prisma"

// Force dynamic rendering to ensure fresh data on each request
export const dynamic = 'force-dynamic'

interface Author {
  id: string
  name: string | null
  username: string | null
  image: string | null
  email: string | null
  bio: string | null
  createdAt: Date
  itemCount: number
  salesCount: number
  averageRating: number
  reviewCount: number
}

async function getTopAuthors(): Promise<Author[]> {
  try {
    // Get all sellers with their product stats
    const sellers = await prisma.user.findMany({
      where: {
        role: "SELLER",
        sellerStatus: "APPROVED",
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        email: true,
        bio: true,
        createdAt: true,
      },
    })

    // Get stats for each seller
    const authorsWithStats = await Promise.all(
      sellers.map(async (seller) => {
        const products = await prisma.product.findMany({
          where: {
            sellerId: seller.id,
            status: "PUBLISHED",
          },
          select: {
            downloads: true,
            reviews: {
              select: {
                rating: true,
              },
            },
          },
        })

        const itemCount = products.length
        const salesCount = products.reduce((sum, p) => sum + (p.downloads || 0), 0)
        const allRatings = products.flatMap((p) => p.reviews.map((r) => r.rating))
        const averageRating =
          allRatings.length > 0 ? allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length : 0
        const reviewCount = allRatings.length

        return {
          ...seller,
          itemCount,
          salesCount,
          averageRating,
          reviewCount,
        }
      })
    )

    // Sort by sales count (descending) and return top authors
    return authorsWithStats
      .sort((a, b) => b.salesCount - a.salesCount)
      .slice(0, 50) // Top 50 authors
  } catch (error) {
    console.error("Error fetching top authors:", error)
    return []
  }
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

export default async function TopAuthorsPage() {
  const authors = await getTopAuthors()

  return (
    <div className="preload home3">
      <Preloader />
      <Header />
      <SearchArea />
      <section className="products section--padding2">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="product-title-area">
                <div className="product__title">
                  <h2>
                    <span className="bold">{authors.length}</span> Top Authors
                  </h2>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-12">
              <Suspense fallback={<div className="text-center">Loading authors...</div>}>
                {authors.length === 0 ? (
                  <div className="text-center" style={{ padding: "60px 20px" }}>
                    <h3>No authors found</h3>
                    <p style={{ color: "#7e7e7e", marginTop: "10px" }}>
                      There are no top authors to display at this time.
                    </p>
                  </div>
                ) : (
                  <div className="user_area">
                    <ul>
                      {authors.map((author) => (
                        <li key={author.id}>
                          <div className="user_single">
                            <div className="user__short_desc">
                              <div className="user_avatar">
                                <img
                                  src={author.image || withBasePath("/images/usr_avatar.png")}
                                  alt={author.name || "Author"}
                                  style={{
                                    width: "60px",
                                    height: "60px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                  }}
                                />
                              </div>
                              <div className="user_info">
                                <Link href={`/author?username=${author.id}`}>
                                  {author.name || author.username || "Unknown Author"}
                                </Link>
                                <p>
                                  Member Since: {new Date(author.createdAt).toLocaleDateString("en-US", {
                                    month: "long",
                                    year: "numeric",
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className="user__meta">
                              <p>{author.itemCount} Items</p>
                              <p>{author.salesCount} Sales</p>
                              {author.averageRating > 0 && (
                                <div className="rating product--rating">
                                  <ul>{renderStars(author.averageRating)}</ul>
                                  <span className="rating__count">({author.reviewCount})</span>
                                </div>
                              )}
                            </div>
                            <div className="user__status user--follow">
                              <Link href={`/author?username=${author.id}`} className="btn btn--round btn--md">
                                View Profile
                              </Link>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Suspense>
            </div>
          </div>
        </div>
      </section>
      <CallToActionSection />
      <Footer />
      <ScrollToTop />
    </div>
  )
}

