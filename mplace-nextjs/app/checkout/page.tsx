"use client"

import { Suspense, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import Breadcrumb from "@/components/common/Breadcrumb"
import Link from "next/link"
import Image from "next/image"
import { getApiUrl, withBasePath } from "@/utils/paths"
import { useRouter, useSearchParams } from "next/navigation"

interface ProductSummary {
  id: string
  title: string
  slug: string
  description?: string | null
  price: number
  salePrice: number | null
  seller?: {
    id: string
    name: string | null
    username: string | null
    image: string | null
    email: string | null
  } | null
  image?: string | null
}

interface CartCheckoutItem {
  productId: string
  title: string
  slug: string
  image: string
  price: number
  salePrice: number | null
  effectivePrice: number
  quantity: number
}

interface BillingForm {
  firstName: string
  lastName: string
  company: string
  email: string
  country: string
  address1: string
  address2: string
  city: string
  postalCode: string
}

function CheckoutPageInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const productId = searchParams?.get("productId")
  const cartMode = searchParams?.get("cart") === "1"

  const [paymentMethod, setPaymentMethod] = useState("martplace")
  const [product, setProduct] = useState<ProductSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [productError, setProductError] = useState("")
  const [orderError, setOrderError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [orderSubmitting, setOrderSubmitting] = useState(false)
  const [creditBalance, setCreditBalance] = useState<number | null>(null)
  const [creditError, setCreditError] = useState<string>("")
  const [billing, setBilling] = useState<BillingForm>({
    firstName: "",
    lastName: "",
    company: "",
    email: "",
    country: "",
    address1: "",
    address2: "",
    city: "",
    postalCode: "",
  })
  const [cartItems, setCartItems] = useState<CartCheckoutItem[]>([])

  useEffect(() => {
    const controller = new AbortController()

    async function loadData() {
      try {
        setLoading(true)
        setProductError("")

        if (cartMode) {
          const response = await fetch(getApiUrl("/api/cart"), {
            credentials: "include",
            signal: controller.signal,
          })

          const data = await response.json().catch(() => ({}))
          if (!response.ok) {
            throw new Error(data?.error || "Failed to load cart")
          }

          const items: CartCheckoutItem[] = (data.items || []).map((item: any) => ({
            productId: item.productId,
            title: item.title,
            slug: item.slug,
            image: item.image || "/images/p1.jpg",
            price: Number(item.price) || 0,
            salePrice: item.salePrice !== null ? Number(item.salePrice) : null,
            effectivePrice: Number(item.effectivePrice) || Number(item.price) || 0,
            quantity: Number(item.quantity) || 1,
          }))

          setCartItems(items)
          setProduct(null)

          if (items.length === 0) {
            setProductError("Your cart is empty.")
          }
        } else {
          if (!productId) {
            setProductError("Missing product id")
            setProduct(null)
            return
          }

          const response = await fetch(getApiUrl(`/api/public/products/${encodeURIComponent(productId)}`), {
            signal: controller.signal,
          })

          const data = await response.json().catch(() => ({}))

          if (!response.ok) {
            throw new Error(data?.error || "Failed to load product")
          }

          const firstImage = Array.isArray(data.images) && data.images.length > 0 ? data.images[0] : "/images/p1.jpg"

          setProduct({
            id: data.id,
            title: data.title,
            slug: data.slug,
            description: data.description,
            price: Number(data.price) || 0,
            salePrice: data.salePrice !== null && data.salePrice !== undefined ? Number(data.salePrice) : null,
            seller: data.seller || null,
            image: firstImage,
          })
        }
      } catch (err: any) {
        if (err?.name === "AbortError") return
        setProduct(null)
        setCartItems([])
        setProductError(err?.message || "Failed to load checkout data")
      } finally {
        setLoading(false)
      }
    }

    void loadData()

    return () => controller.abort()
  }, [productId, cartMode])

  useEffect(() => {
    const controller = new AbortController()

    async function loadCredits() {
      try {
        setCreditError("")
        const response = await fetch(getApiUrl("/api/dashboard/credits"), {
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        })

        const data = await response.json().catch(() => ({}))

        if (!response.ok) {
          throw new Error(data?.error || "Failed to load MartPlace credits")
        }

        setCreditBalance(Number(data.balance || 0))
      } catch (error: any) {
        if (error?.name === "AbortError") return
        setCreditBalance(null)
        setCreditError(error?.message || "Failed to load credit balance")
      }
    }

    void loadCredits()

    const handleCreditsUpdate = () => {
      void loadCredits()
    }

    if (typeof window !== "undefined") {
      window.addEventListener("credits:update", handleCreditsUpdate)
    }

    return () => {
      controller.abort()
      if (typeof window !== "undefined") {
        window.removeEventListener("credits:update", handleCreditsUpdate)
      }
    }
  }, [])

  const priceToCharge = useMemo(() => {
    if (!product) return 0
    if (product.salePrice && product.salePrice < product.price) {
      return Number(product.salePrice)
    }
    return Number(product.price)
  }, [product])

  const summaryItems: CartCheckoutItem[] = useMemo(() => {
    if (cartMode) {
      return cartItems
    }
    if (!product) return []
    const effectivePrice = priceToCharge
    return [
      {
        productId: product.id,
        title: product.title,
        slug: product.slug,
        image: product.image || "/images/p1.jpg",
        price: product.price,
        salePrice: product.salePrice,
        effectivePrice,
        quantity: 1,
      },
    ]
  }, [cartMode, cartItems, product, priceToCharge])

  const subtotal = useMemo(
    () => summaryItems.reduce((sum, item) => sum + item.effectivePrice * item.quantity, 0),
    [summaryItems]
  )
  const estimatedTaxes = useMemo(() => Number((subtotal * 0.05).toFixed(2)), [subtotal])
  const totalAmount = useMemo(() => Number((subtotal + estimatedTaxes).toFixed(2)), [subtotal, estimatedTaxes])

  const insufficientCredits = useMemo(() => {
    if (creditBalance === null) return false
    return creditBalance < totalAmount
  }, [creditBalance, totalAmount])

  const handleBillingChange = (field: keyof BillingForm) => (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value = event.target.value
    setBilling((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
 
    if (summaryItems.length === 0) {
      setOrderError(cartMode ? "Your cart is empty." : "Product details are missing.")
      return
    }
 
    if (!billing.firstName.trim() || !billing.lastName.trim()) {
      setOrderError("First and last name are required.")
      return
    }

    if (!billing.email.trim()) {
      setOrderError("Email address is required.")
      return
    }

    if (paymentMethod !== "martplace") {
      setOrderError("Only MartPlace credit is supported at the moment. Please select MartPlace credit to continue.")
      return
    }

    if (insufficientCredits) {
      setOrderError("Your MartPlace credit balance is not enough to cover this purchase. Please add more credits.")
      return
    }

    try {
      setOrderSubmitting(true)
      setOrderError("")
      setSuccessMessage("")

      const payload: Record<string, any> = {
        paymentMethod,
        billing,
      }

      if (cartMode) {
        payload.cartCheckout = true
      } else if (product) {
        payload.productId = product.id
      }

      const response = await fetch(getApiUrl("/api/checkout"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data?.error || "Failed to complete checkout.")
      }

      setSuccessMessage("Order confirmed! You will receive an email with download details shortly.")
      setCreditBalance((prev) => (typeof prev === "number" ? Number((prev - totalAmount).toFixed(2)) : prev))

      setTimeout(() => {
        if (cartMode) {
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("cart:update"))
            window.dispatchEvent(new CustomEvent("credits:update"))
          }
          router.push("/cart")
        } else if (product) {
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("credits:update"))
          }
          router.push(`/single-product/${product.slug}`)
        }
      }, 3500)
    } catch (err: any) {
      setOrderError(err?.message || "Failed to submit order.")
    } finally {
      setOrderSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="preload checkout-page">
        <Preloader />
        <Header />
        <div className="text-center" style={{ padding: "100px 0" }}>
          <p>Loading checkout...</p>
        </div>
        <Footer />
        <ScrollToTop />
      </div>
    )
  }

  if (!cartMode && (productError || !product)) {
    return (
      <div className="preload checkout-page">
        <Preloader />
        <Header />
        <div className="container" style={{ padding: "100px 0" }}>
          <div className="alert alert-warning" style={{ maxWidth: 600, margin: "0 auto" }}>
            {productError || "Product not available for checkout."}
          </div>
          <div className="text-center" style={{ marginTop: 20 }}>
            <Link href="/" className="btn btn--round btn--default">
              Continue Browsing Products
            </Link>
          </div>
        </div>
        <Footer />
        <ScrollToTop />
      </div>
    )
  }

  if (cartMode && (productError || summaryItems.length === 0)) {
    return (
      <div className="preload checkout-page">
        <Preloader />
        <Header />
        <div className="container" style={{ padding: "100px 0" }}>
          <div className="alert alert-warning" style={{ maxWidth: 600, margin: "0 auto" }}>
            {productError || "Your cart is empty."}
          </div>
          <div className="text-center" style={{ marginTop: 20 }}>
            <Link href="/cart" className="btn btn--round btn--default">
              View Cart
            </Link>
          </div>
        </div>
        <Footer />
        <ScrollToTop />
      </div>
    )
  }

  return (
    <div className="preload checkout-page">
      <Preloader />
      <Header />
      <Breadcrumb pageTitle="Checkout" paths={[{ name: "Checkout", link: "/checkout" }]} />

      <section className="dashboard-area">
        <div className="dashboard_contents">
          <div className="container">
            <form action="#" className="setting_form" onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-lg-6">
                  <div className="information_module">
                    <div className="toggle_title">
                      <h4>Biling Information</h4>
                    </div>

                    <div className="information__set">
                      <div className="information_wrapper form--fields">
                        <div className="row">
                          <div className="col-md-6">
                            <div className="form-group">
                              <label htmlFor="first_name">
                                First Name<sup>*</sup>
                              </label>
                              <input
                                type="text"
                                id="first_name"
                                className="text_field"
                                placeholder="First Name"
                                value={billing.firstName}
                                onChange={handleBillingChange("firstName")}
                                required
                              />
                            </div>
                          </div>

                          <div className="col-md-6">
                            <div className="form-group">
                              <label htmlFor="last_name">
                                Last Name<sup>*</sup>
                              </label>
                              <input
                                type="text"
                                id="last_name"
                                className="text_field"
                                placeholder="Last Name"
                                value={billing.lastName}
                                onChange={handleBillingChange("lastName")}
                                required
                              />
                            </div>
                          </div>
                        </div>

                        <div className="form-group">
                          <label htmlFor="company">
                            Company Name
                          </label>
                          <input
                            type="text"
                            id="company"
                            className="text_field"
                            placeholder="Company"
                            value={billing.company}
                            onChange={handleBillingChange("company")}
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="email1">
                            Email Address<sup>*</sup>
                          </label>
                          <input
                            type="email"
                            id="email1"
                            className="text_field"
                            placeholder="Email address"
                            value={billing.email}
                            onChange={handleBillingChange("email")}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="country1">
                            Country
                          </label>
                          <div className="select-wrap select-wrap2">
                            <select
                              name="country"
                              id="country1"
                              className="text_field"
                              value={billing.country}
                              onChange={handleBillingChange("country")}
                            >
                              <option value="">Select one</option>
                              <option value="Bangladesh">Bangladesh</option>
                              <option value="India">India</option>
                              <option value="Uruguay">Uruguay</option>
                              <option value="Australia">Australia</option>
                              <option value="United Kingdom">United Kingdom</option>
                              <option value="United States">United States</option>
                              <option value="Atlantis">Atlantis</option>
                            </select>
                            <span className="lnr lnr-chevron-down"></span>
                          </div>
                        </div>

                        <div className="form-group">
                          <label htmlFor="address1">Address Line 1</label>
                          <input
                            type="text"
                            id="address1"
                            className="text_field"
                            placeholder="Address line one"
                            value={billing.address1}
                            onChange={handleBillingChange("address1")}
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="address2">Address Line 2</label>
                          <input
                            type="text"
                            id="address2"
                            className="text_field"
                            placeholder="Address line two"
                            value={billing.address2}
                            onChange={handleBillingChange("address2")}
                          />
                        </div>

                        <div className="row">
                          <div className="col-md-6">
                            <div className="form-group">
                              <label htmlFor="city">
                                City / State
                              </label>
                              <div className="select-wrap select-wrap2">
                                <select
                                  name="city"
                                  id="city"
                                  className="text_field"
                                  value={billing.city}
                                  onChange={handleBillingChange("city")}
                                >
                                  <option value="">Select one</option>
                                  <option value="Dhaka">Dhaka</option>
                                  <option value="Sydney">Sydney</option>
                                  <option value="New York">New York</option>
                                  <option value="London">London</option>
                                  <option value="Mexico">New Mexico</option>
                                </select>
                                <span className="lnr lnr-chevron-down"></span>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="form-group">
                              <label htmlFor="zipcode">
                                Zip / Postal Code
                              </label>
                              <input
                                type="text"
                                id="zipcode"
                                className="text_field"
                                placeholder="Zip / postal code"
                                value={billing.postalCode}
                                onChange={handleBillingChange("postalCode")}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-6">
                  <div className="information_module order_summary">
                    <div className="toggle_title">
                      <h4>Order Summary</h4>
                    </div>
 
                     <ul>
                      {summaryItems.map((item) => (
                        <li className="item" key={item.productId}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Link href={`/single-product/${item.slug}`} target="_blank">
                              {item.title}
                            </Link>
                            <span>
                              {item.salePrice !== null && item.salePrice < item.price ? (
                                <>
                                  <span style={{ textDecoration: "line-through", opacity: 0.7 }}>
                                    ${item.price.toFixed(2)}
                                  </span>
                                  <span style={{ marginLeft: 8 }}>${item.effectivePrice.toFixed(2)}</span>
                                </>
                              ) : (
                                <>${item.effectivePrice.toFixed(2)}</>
                              )}
                              {item.quantity > 1 && <span style={{ marginLeft: 8 }}>× {item.quantity}</span>}
                            </span>
                          </div>
                        </li>
                      ))}
                      <li>
                        <p>Estimated Taxes & Fees:</p>
                        <span>${estimatedTaxes.toFixed(2)}</span>
                      </li>
                      <li className="total_ammount">
                        <p>Total</p>
                        <span>${totalAmount.toFixed(2)}</span>
                      </li>
                    </ul>
                  </div>

                  <div className="information_module payment_options">
                    <div className="toggle_title">
                      <h4>Select Payment Method</h4>
                    </div>

                    <ul>
                      <li>
                        <div className="custom-radio">
                          <input
                            type="radio"
                            id="opt1"
                            name="filter_opt"
                            checked={paymentMethod === "credit"}
                            onChange={() => setPaymentMethod("credit")}
                          />
                          <label htmlFor="opt1">
                            <span className="circle"></span>Credit Card
                          </label>
                        </div>
                        <Image src={withBasePath("/images/cards.png")} alt="Visa Cards" width={150} height={30} />
                      </li>

                      <li>
                        <div className="custom-radio">
                          <input
                            type="radio"
                            id="opt2"
                            name="filter_opt"
                            checked={paymentMethod === "paypal"}
                            onChange={() => setPaymentMethod("paypal")}
                          />
                          <label htmlFor="opt2">
                            <span className="circle"></span>Paypal
                          </label>
                        </div>
                        <Image src={withBasePath("/images/paypal.png")} alt="Paypal" width={100} height={30} />
                      </li>

                      <li>
                        <div className="custom-radio">
                          <input
                            type="radio"
                            id="opt3"
                            name="filter_opt"
                            checked={paymentMethod === "martplace"}
                            onChange={() => setPaymentMethod("martplace")}
                          />
                          <label htmlFor="opt3">
                            <span className="circle"></span>MartPlace Credit
                          </label>
                        </div>
                        <p>
                          Balance {creditError ? (
                            <span className="text-danger">{creditError}</span>
                          ) : creditBalance === null ? (
                            <span>Loading…</span>
                          ) : (
                            <span className="bold">${creditBalance.toFixed(2)}</span>
                          )}
                        </p>
                        {creditBalance !== null && creditBalance < totalAmount && (
                          <p className="text-danger" style={{ marginTop: 8 }}>
                            Your balance is lower than the order total (${totalAmount.toFixed(2)}).
                          </p>
                        )}
                      </li>
                    </ul>

                    {orderError && (
                      <div className="alert alert-danger" style={{ marginBottom: 20 }}>
                        {orderError}
                      </div>
                    )}

                    {paymentMethod === "credit" && (
                      <div className="payment_info modules__content">
                        <div className="form-group">
                          <label htmlFor="card_number">Card Number</label>
                          <input id="card_number" type="text" className="text_field" placeholder="Enter your card number here..." />
                        </div>

                        <label htmlFor="exp_month">Expire Date</label>
                        <div className="row">
                          <div className="col-md-6 col-sm-6">
                            <div className="form-group">
                              <div className="select-wrap select-wrap2">
                                <select name="months" id="exp_month">
                                  <option value="">Month</option>
                                  <option value="Jan">Jan</option>
                                  <option value="Feb">Feb</option>
                                  <option value="Mar">Mar</option>
                                  <option value="Apr">Apr</option>
                                  <option value="May">May</option>
                                  <option value="Jun">Jun</option>
                                  <option value="Jul">Jul</option>
                                  <option value="Aug">Aug</option>
                                  <option value="Sep">Sep</option>
                                  <option value="Oct">Oct</option>
                                  <option value="Nov">Nov</option>
                                  <option value="Dec">Dec</option>
                                </select>
                                <span className="lnr lnr-chevron-down"></span>
                              </div>
                            </div>
                          </div>

                          <div className="col-md-6 col-sm-6">
                            <div className="form-group">
                              <div className="select-wrap select-wrap2">
                                <select name="years" id="exp_year">
                                  <option value="">Year</option>
                                  <option value="2028">2028</option>
                                  <option value="2027">2027</option>
                                  <option value="2026">2026</option>
                                  <option value="2025">2025</option>
                                  <option value="2024">2024</option>
                                  <option value="2023">2023</option>
                                </select>
                                <span className="lnr lnr-chevron-down"></span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="row">
                          <div className="col-md-6">
                            <div className="form-group">
                              <label htmlFor="cv_code">CVV Code</label>
                              <input id="cv_code" type="text" className="text_field" placeholder="Enter code here..." />
                            </div>

                            <p className="text-warning" style={{ marginBottom: 12 }}>
                              Card processing is not yet enabled. Please use MartPlace credit to complete your order.
                            </p>
                            <button type="submit" className="btn btn--round btn--default" disabled>
                              Confirm Order
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === "paypal" && (
                      <div className="payment_info modules__content">
                        <p>PayPal checkout will be available soon. Please switch to MartPlace credit for now.</p>
                        <button type="submit" className="btn btn--round btn--default" disabled>
                          Confirm with PayPal
                        </button>
                      </div>
                    )}

                    {paymentMethod === "martplace" && (
                      <div className="payment_info modules__content">
                        <button
                          type="submit"
                          className="btn btn--round btn--default"
                          disabled={orderSubmitting || insufficientCredits || creditBalance === null}
                        >
                          {orderSubmitting ? "Processing..." : insufficientCredits ? "Insufficient Credits" : "Confirm Order"}
                        </button>
                      </div>
                    )}
                  </div>

                  {successMessage && (
                    <div className="alert alert-success" style={{ marginTop: 20 }}>
                      {successMessage}
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      <Footer />
      <ScrollToTop />
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="preload checkout-page">
          <Preloader />
          <Header />
          <ScrollToTop />
        </div>
      }
    >
      <CheckoutPageInner />
    </Suspense>
  )
}

