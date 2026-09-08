"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { getApiUrl } from "@/utils/paths"

interface ProductCartActionsProps {
  productId: string
}

export default function ProductCartActions({ productId }: ProductCartActionsProps) {
  const [cartStatus, setCartStatus] = useState<{ message?: string; error?: string; loading: boolean }>({ loading: false })
  const router = useRouter()
  const { status } = useSession()

  const handleAddToCart = async () => {
    if (status === "loading") {
      return
    }

    if (status !== "authenticated") {
      if (typeof window !== "undefined") {
        const callbackUrl = encodeURIComponent(window.location.pathname + window.location.search)
        router.push(`/login?callbackUrl=${callbackUrl}`)
      } else {
        router.push("/login")
      }
      return
    }

    try {
      setCartStatus({ loading: true })
      const response = await fetch(getApiUrl("/api/cart"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ productId }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data?.error || "Failed to add to cart")
      }

      setCartStatus({ loading: false, message: "Item added to your cart." })
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cart:update"))
      }
    } catch (error: any) {
      setCartStatus((prev) => ({ ...prev, error: "Unable to add item to cart." }))
    } finally {
      setCartStatus((prev) => ({ ...prev, loading: false }))
    }
  }

  return (
    <>
      <button
        type="button"
        className="btn btn--lg btn--round cart-btn"
        onClick={handleAddToCart}
        disabled={cartStatus.loading}
      >
        {cartStatus.loading ? (
          <span className="lnr lnr-sync"></span>
        ) : (
          <span className="lnr lnr-cart"></span>
        )}
        {cartStatus.loading ? " Adding" : " Add To Cart"}
      </button>
      {(cartStatus.message || cartStatus.error) && (
        <p
          className={`product-message-text ${cartStatus.error ? "text-danger" : "text-success"}`}
        >
          {cartStatus.error || cartStatus.message}
        </p>
      )}
    </>
  )
}

