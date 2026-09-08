"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"

import { getApiUrl, withBasePath } from "@/utils/paths"

interface FavoriteProduct {
  id: string
  title: string
  slug: string
  price: string
  salePrice: string | null
  images: string[]
  livePreviewUrl: string | null
  description: string | null
  rating: number
  reviewCount: number
  favoriteCount: number
  downloads: number
  views: number
  seller: {
    id: string
    name: string | null
    image: string | null
    username?: string | null
  } | null
  category: {
    id: string
    name: string | null
    slug: string | null
  } | null
  favoritedAt: string
}

type RemovingState = Record<string, boolean>

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

export default function FavoritesGrid() {
  const { status } = useSession()
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [removing, setRemoving] = useState<RemovingState>({})

  const isAuthenticated = status === "authenticated"

  const fetchFavorites = useMemo(
    () => async () => {
      if (!isAuthenticated) {
        setFavorites([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError("")
        const response = await fetch(getApiUrl("/api/favorites"), {
          cache: "no-store",
        })
        const data = await response.json().catch(() => ({}))
        if (!response.ok) {
          throw new Error(data?.error || "Failed to load favourites")
        }
        setFavorites(Array.isArray(data?.favorites) ? data.favorites : [])
      } catch (err: any) {
        setError(err?.message || "Failed to load favourites.")
        setFavorites([])
      } finally {
        setLoading(false)
      }
    },
    [isAuthenticated]
  )

  useEffect(() => {
    if (status === "loading") {
      return
    }
    void fetchFavorites()
  }, [status, fetchFavorites])

  const handleRemove = async (productId: string) => {
    if (removing[productId]) {
      return
    }

    setRemoving((prev) => ({ ...prev, [productId]: true }))
    setError("")

    try {
      const response = await fetch(getApiUrl(`/api/favorites/${productId}`), {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data?.error || "Failed to remove favourite")
      }
      setFavorites((prev) => prev.filter((favorite) => favorite.id !== productId))
    } catch (err: any) {
      setError(err?.message || "Failed to remove favourite")
    } finally {
      setRemoving((prev) => {
        const next = { ...prev }
        delete next[productId]
        return next
      })
    }
  }

  if (status === "loading" || loading) {
    return <div className="text-center p-4">Loading favourites...</div>
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center p-5">
        <h4>Please sign in to view your favourites.</h4>
        <p>
          <Link href="/login" className="btn btn--round btn--sm">
            Sign In
          </Link>
        </p>
      </div>
    )
  }

  if (!loading && favorites.length === 0) {
    return (
      <div className="text-center p-5">
        <h4>You have not added any favourites yet.</h4>
        <p>
          Browse our{" "}
          <Link href="/all-products" className="text--primary">
            product catalogue
          </Link>{" "}
          to add items to your favourites list.
        </p>
      </div>
    )
  }

  return (
    <>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      <div className="row">
        {favorites.map((product) => {
          const imageSrc = product.images?.[0]
            ? withBasePath(product.images[0])
            : withBasePath("/images/p1.jpg")
          const sellerImage = product.seller?.image
            ? withBasePath(product.seller.image)
            : withBasePath("/images/auth.jpg")
          const priceDisplay = product.salePrice ? `$${product.salePrice}` : product.price
          const removingInProgress = removing[product.id] ?? false

          return (
            <div key={product.id} className="col-lg-4 col-md-6">
              <div className="product product--card">
                <div className="product__thumbnail">
                  <img src={imageSrc} alt={product.title} />
                  <div className="prod_btn">
                    <Link href={`/single-product/${product.slug || product.id}`} className="transparent btn--sm btn--round">
                      More Info
                    </Link>
                    {product.livePreviewUrl ? (
                      <Link
                        href={product.livePreviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transparent btn--sm btn--round"
                      >
                        Live Demo
                      </Link>
                    ) : null}
                    <button
                      type="button"
                      className="transparent btn--sm btn--round"
                      onClick={() => handleRemove(product.id)}
                      disabled={removingInProgress}
                      style={{ cursor: removingInProgress ? "not-allowed" : "pointer" }}
                    >
                      {removingInProgress ? "Removing..." : "Remove"}
                    </button>
                  </div>
                </div>

                <div className="product-desc">
                  <Link href={`/single-product/${product.slug || product.id}`} className="product_title">
                    <h4>{product.title}</h4>
                  </Link>
                  <ul className="titlebtm">
                    <li>
                      <img className="auth-img" src={sellerImage} alt={product.seller?.name || "Seller"} />
                      <p>
                        {product.seller?.name ? (
                          <Link
                            href={
                              product.seller.username
                                ? `/author?username=${product.seller.username}`
                                : `/author?username=${product.seller.id}`
                            }
                          >
                            {product.seller.name}
                          </Link>
                        ) : (
                          "Unknown"
                        )}
                      </p>
                    </li>
                    {product.category?.name && (
                      <li className="product_cat">
                        <Link href={`/category/${product.category.slug || ""}`}>
                          <span className="lnr lnr-book"></span>
                          {product.category.name}
                        </Link>
                      </li>
                    )}
                  </ul>
                  {product.description && <p>{product.description}</p>}
                </div>

                <div className="product-purchase">
                  <div className="price_love">
                    <span>{priceDisplay}</span>
                    <p>
                      <span className="lnr lnr-heart"></span> {product.favoriteCount}
                    </p>
                  </div>
                  {product.rating > 0 && (
                    <div className="rating product--rating">
                      <ul>{renderStars(product.rating)}</ul>
                    </div>
                  )}
                  <div className="sell">
                    <p>
                      <span className="lnr lnr-cart"></span>
                      <span>{product.downloads}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

