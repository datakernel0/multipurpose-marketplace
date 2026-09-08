"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { getApiUrl } from "@/utils/paths"

interface ProductFavoriteButtonProps {
  productId: string
  initialFavoriteCount: number
  initialIsFavorited: boolean
  onFavoriteChange?: (count: number, isFavorited: boolean) => void
}

export default function ProductFavoriteButton({
  productId,
  initialFavoriteCount,
  initialIsFavorited,
  onFavoriteChange,
}: ProductFavoriteButtonProps) {
  const [favoriteCount, setFavoriteCount] = useState<number>(initialFavoriteCount)
  const [isFavorited, setIsFavorited] = useState<boolean>(initialIsFavorited)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  const [favoriteError, setFavoriteError] = useState("")
  const router = useRouter()
  const { status } = useSession()

  useEffect(() => {
    setFavoriteCount(initialFavoriteCount)
    setIsFavorited(initialIsFavorited)
    setFavoriteError("")
  }, [initialFavoriteCount, initialIsFavorited])

  const handleToggleFavorite = async () => {
    if (favoriteLoading) {
      return
    }

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

    setFavoriteLoading(true)
    setFavoriteError("")

    try {
      const method = isFavorited ? "DELETE" : "POST"
      const response = await fetch(getApiUrl(`/api/favorites/${productId}`), {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data?.error || "Failed to update favorite")
      }

      const updatedCount =
        typeof data?.favoriteCount === "number"
          ? data.favoriteCount
          : isFavorited
          ? Math.max(favoriteCount - 1, 0)
          : favoriteCount + 1

      const newIsFavorited = !isFavorited
      setFavoriteCount(Math.max(0, updatedCount))
      setIsFavorited(newIsFavorited)
      
      onFavoriteChange?.(updatedCount, newIsFavorited)
    } catch (error: any) {
      setFavoriteError("Unable to update favorite. Please try again.")
    } finally {
      setFavoriteLoading(false)
    }
  }

  return (
    <div className="item-action">
      <div className="action-btns">
        <button 
          type="button"
          className="btn btn--round btn--lg btn--icon"
          onClick={handleToggleFavorite}
          disabled={favoriteLoading}
          aria-pressed={isFavorited}
        >
          <span className={`lnr lnr-heart${isFavorited ? " scolor" : ""}`}></span>
          {isFavorited ? "Remove Favorite" : "Add To Favorites"}
        </button>
      </div>
      {favoriteError && (
        <p className="text-danger mt-2 product-error-text">
          {favoriteError}
        </p>
      )}
    </div>
  )
}

