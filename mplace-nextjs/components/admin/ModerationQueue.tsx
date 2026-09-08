"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"

const STATUS_OPTIONS = [
  { label: "Pending", value: "PENDING_REVIEW" },
  { label: "In Review", value: "IN_REVIEW" },
  { label: "Needs Revision", value: "NEEDS_REVISION" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
]

interface ModerationProduct {
  id: string
  title: string
  slug: string
  status: string
  moderationStatus: string
  category: { id: string; name: string } | null
  seller: {
    id: string
    name: string | null
    email: string
    username: string | null
    sellerStatus: string
  }
  createdAt: string
  updatedAt: string
}

interface ModerationResponse {
  products: ModerationProduct[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

function statusLabel(status: string) {
  const option = STATUS_OPTIONS.find((item) => item.value === status)
  return option ? option.label : status
}

function sellerStatusLabel(status: string) {
  switch (status) {
    case "APPROVED":
      return "Approved"
    case "PENDING_REVIEW":
      return "Pending Review"
    case "REJECTED":
      return "Rejected"
    case "SUSPENDED":
      return "Suspended"
    default:
      return status
  }
}

export default function ModerationQueue() {
  const [data, setData] = useState<ModerationResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<string>("PENDING_REVIEW")
  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [actingOn, setActingOn] = useState<string | null>(null)

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError("")

      const params = new URLSearchParams()
      params.set("page", String(page))
      params.set("limit", "20")
      if (status) params.set("status", status)
      if (search) params.set("q", search)

      const response = await fetch(`/api/admin/moderation/products?${params.toString()}`)
      const json = await response.json()

      if (!response.ok) {
        throw new Error(json.error || "Failed to load moderation queue")
      }

      setData(json)
    } catch (err: any) {
      setError(err?.message || "Failed to load moderation queue")
    } finally {
      setLoading(false)
    }
  }, [page, status, search])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const actionProduct = useCallback(
    async (productId: string, action: "APPROVE" | "REJECT" | "REVISION", notes?: string) => {
      try {
        setActingOn(productId)
        setError("")

        const response = await fetch(`/api/admin/moderation/products/${productId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, notes }),
        })

        const json = await response.json()
        if (!response.ok) {
          throw new Error(json.error || "Failed to update product")
        }

        await loadProducts()
      } catch (err: any) {
        setError(err?.message || "Failed to update product")
      } finally {
        setActingOn(null)
      }
    },
    [loadProducts]
  )

  const paginationButtons = useMemo(() => {
    if (!data) return null

    const { page: current, totalPages } = data.pagination

    return (
      <div className="admin-pagination">
        <button onClick={() => setPage(Math.max(current - 1, 1))} disabled={current <= 1}>
          Previous
        </button>
        <span>
          Page {current} of {totalPages}
        </span>
        <button
          onClick={() => setPage(Math.min(current + 1, totalPages))}
          disabled={current >= totalPages}
        >
          Next
        </button>
      </div>
    )
  }, [data])

  return (
    <div className="admin-moderation">
      <div className="admin-moderation__toolbar">
        <div className="admin-moderation__filters">
          <label>
            Status
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Search
            <div className="admin-moderation__search">
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search title or seller..."
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    setPage(1)
                    setSearch(searchInput.trim())
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  setPage(1)
                  setSearch(searchInput.trim())
                }}
              >
                Search
              </button>
            </div>
          </label>
        </div>
        <div className="admin-moderation__summary">
          {loading ? (
            <span>Loading...</span>
          ) : (
            <span>
              {data?.pagination.total ?? 0} item{(data?.pagination.total ?? 0) === 1 ? "" : "s"}
            </span>
          )}
        </div>
      </div>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}

      <div className="admin-table admin-table--moderation">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Seller</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (!data || data.products.length === 0) ? (
              <tr>
                <td colSpan={5} className="admin-table__loading">
                  Loading moderation queue...
                </td>
              </tr>
            ) : data && data.products.length > 0 ? (
              data.products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="admin-table__cell-title">
                      <strong>{product.title}</strong>
                      <span>{product.category?.name || "Uncategorised"}</span>
                      <Link href={`/single-product/${product.slug}`} target="_blank">
                        View product
                      </Link>
                    </div>
                  </td>
                  <td>
                    <div className="admin-table__cell-meta">
                      <strong>{product.seller.name || "Unknown"}</strong>
                      <span>{product.seller.email}</span>
                      <span className={`badge badge--${product.seller.sellerStatus.toLowerCase()}`}>
                        {sellerStatusLabel(product.seller.sellerStatus)}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="admin-table__cell-meta">
                      <span className={`badge badge--status-${product.moderationStatus.toLowerCase()}`}>
                        {statusLabel(product.moderationStatus)}
                      </span>
                      <small>Listing: {statusLabel(product.status)}</small>
                    </div>
                  </td>
                  <td>
                    <div className="admin-table__cell-meta">
                      <span>{new Date(product.createdAt).toLocaleDateString()}</span>
                      <small>Updated {new Date(product.updatedAt).toLocaleDateString()}</small>
                    </div>
                  </td>
                  <td>
                    <div className="admin-table__actions">
                      <button
                        type="button"
                        onClick={() => actionProduct(product.id, "APPROVE")}
                        disabled={actingOn === product.id}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => actionProduct(product.id, "REVISION", "Requested changes" )}
                        disabled={actingOn === product.id}
                      >
                        Needs revision
                      </button>
                      <button
                        type="button"
                        className="danger"
                        onClick={() => actionProduct(product.id, "REJECT")}
                        disabled={actingOn === product.id}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="admin-table__empty">
                  No products found for the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {paginationButtons}
    </div>
  )
}
