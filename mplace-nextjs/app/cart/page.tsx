"use client"

import { useEffect, useState } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import Breadcrumb from "@/components/common/Breadcrumb"
import Link from "next/link"
import Image from "next/image"
import { getApiUrl, withBasePath } from "@/utils/paths"

interface CartItem {
  productId: string
  slug: string
  title: string
  description: string
  image: string
  category: {
    name: string
    icon: string
  } | null
  price: number
  salePrice: number | null
  effectivePrice: number
  quantity: number
}

const truncateWords = (text: string, limit: number) => {
  if (!text) return ""
  const words = text.trim().split(/\s+/)
  if (words.length <= limit) {
    return text.trim()
  }
  return `${words.slice(0, limit).join(" ")}…`
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [removing, setRemoving] = useState<string | null>(null)

  const fetchCart = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await fetch(getApiUrl("/api/cart"), {
        credentials: "include",
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data?.error || "Failed to load cart")
      }

      const items: CartItem[] = (data.items || []).map((item: any) => ({
        productId: item.productId,
        slug: item.slug,
        title: item.title,
        description: item.description || "",
        image: item.image || "/images/p1.jpg",
        category: item.category || null,
        price: Number(item.price) || 0,
        salePrice: item.salePrice !== null ? Number(item.salePrice) : null,
        effectivePrice: Number(item.effectivePrice) || Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
      }))

      setCartItems(items)
    } catch (err: any) {
      setError(err?.message || "Failed to load cart items.")
      setCartItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchCart()
  }, [])

  const handleRemoveItem = async (productId: string) => {
    try {
      setRemoving(productId)
      const response = await fetch(getApiUrl(`/api/cart/${encodeURIComponent(productId)}`), {
        method: "DELETE",
        credentials: "include",
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data?.error || "Failed to remove item")
      }

      await fetchCart()
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cart:update"))
      }
    } catch (err: any) {
      setError(err?.message || "Failed to remove item from cart.")
    } finally {
      setRemoving(null)
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.effectivePrice * item.quantity, 0)
  const total = subtotal
  const isEmpty = cartItems.length === 0

  return (
    <div className="preload cart-page">
      <Preloader />
      <Header />
      <Breadcrumb pageTitle="Shopping Cart" paths={[{ name: "Shopping Cart", link: "/cart" }]} />

      <section className="cart_area section--padding2 bgcolor">
        <div className="container">
          {loading ? (
            <div className="text-center" style={{ padding: "40px 0" }}>
              <p>Loading cart…</p>
            </div>
          ) : error ? (
            <div className="alert alert-warning" style={{ maxWidth: 600, margin: "0 auto 30px" }}>
              {error}
            </div>
          ) : null}
          <div className="row">
            <div className="col-md-12">
              <div className="product_archive added_to__cart">
                <div className="title_area">
                  <div className="row">
                    <div className="col-md-5">
                      <h4>Product Details</h4>
                    </div>
                    <div className="col-md-3">
                      <h4 className="add_info">Category</h4>
                    </div>
                    <div className="col-md-2">
                      <h4>Price</h4>
                    </div>
                    <div className="col-md-2">
                      <h4>Remove</h4>
                    </div>
                  </div>
                </div>

                <div className="row">
                  {isEmpty ? (
                    <div className="col-md-12">
                      <div className="single_product clearfix" style={{ padding: "30px", textAlign: "center" }}>
                        <p>Your cart is currently empty.</p>
                        <Link href="/" className="btn btn--round btn--md" style={{ marginTop: 15 }}>
                          Browse Products
                        </Link>
                      </div>
                    </div>
                  ) : (
                    cartItems.map((item) => (
                      <div key={item.productId} className="col-md-12">
                        <div className="single_product clearfix">
                          <div className="col-lg-5 col-md-7 v_middle">
                            <div className="product__description">
                              <Image src={withBasePath(item.image)} alt="Purchase image" width={100} height={100} />
                              <div className="short_desc">
                                <Link href={`/single-product/${item.slug}`}>
                                  <h4>{item.title}</h4>
                                </Link>
                                <p>{truncateWords(item.description, 10)}</p>
                              </div>
                            </div>
                          </div>

                          <div className="col-lg-3 col-md-2 v_middle">
                            {item.category && (
                              <div className="product__additional_info">
                                <ul>
                                  <li>
                                    <Link href="#">
                                      <Image src={withBasePath(item.category.icon)} alt={item.category.name} width={20} height={20} />
                                      {item.category.name}
                                    </Link>
                                  </li>
                                </ul>
                              </div>
                            )}
                          </div>

                          <div className="col-lg-4 col-md-3 v_middle">
                            <div className="product__price_download">
                              <div className="item_price v_middle">
                                {item.salePrice !== null && item.salePrice < item.price ? (
                                  <>
                                    <span style={{ textDecoration: "line-through", opacity: 0.7, marginRight: 8 }}>
                                      ${item.price.toFixed(2)}
                                    </span>
                                    <span>${item.effectivePrice.toFixed(2)}</span>
                                  </>
                                ) : (
                                  <span>${item.effectivePrice.toFixed(2)}</span>
                                )}
                                {item.quantity > 1 && <span style={{ marginLeft: 10 }}>× {item.quantity}</span>}
                              </div>
                              <div className="item_action v_middle">
                                <button
                                  type="button"
                                  className="remove_from_cart"
                                  onClick={() => handleRemoveItem(item.productId)}
                                  aria-label="Remove from cart"
                                  disabled={removing === item.productId}
                                >
                                  {removing === item.productId ? (
                                    <span className="lnr lnr-sync"></span>
                                  ) : (
                                    <span className="lnr lnr-trash"></span>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="row">
                  <div className="col-md-6 offset-md-6">
                    <div className="cart_calculation">
                      <div className="cart--subtotal">
                        <p>
                          <span>Cart Subtotal</span>${subtotal.toFixed(2)}
                        </p>
                      </div>
                      <div className="cart--total">
                        <p>
                          <span>total</span>${total.toFixed(2)}
                        </p>
                      </div>

                      <Link
                        href={isEmpty ? "#" : "/checkout?cart=1"}
                        className={`btn btn--round btn--md checkout_link${isEmpty ? " disabled" : ""}`}
                        aria-disabled={isEmpty}
                      >
                        Proceed To Checkout
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <ScrollToTop />
    </div>
  )
}

