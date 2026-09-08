"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

const STATUS_OPTIONS = [
  { label: "Pending Review", value: "PENDING_REVIEW" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Suspended", value: "SUSPENDED" },
]

interface SellerApplicant {
  id: string
  name: string | null
  email: string
  username: string | null
  sellerStatus: string
  createdAt: string
  country: string | null
  sellerVerificationNotes: string | null
  sellerVerifiedAt: string | null
}

interface SellersResponse {
  sellers: SellerApplicant[]
  metrics: Record<string, number>
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

function formatDate(value: string | null) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString()
}

function statusBadge(status: string) {
  switch (status) {
    case "APPROVED":
      return { label: "Approved", className: "badge badge--approved" }
    case "REJECTED":
      return { label: "Rejected", className: "badge badge--status-rejected" }
    case "SUSPENDED":
      return { label: "Suspended", className: "badge badge--suspended" }
    case "PENDING_REVIEW":
    default:
      return { label: "Pending Review", className: "badge badge--pending_review" }
  }
}

export default function SellerReviewQueue() {
  const [data, setData] = useState<SellersResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<string>("PENDING_REVIEW")
  const [searchTerm, setSearchTerm] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [actingOn, setActingOn] = useState<string | null>(null)

  const fetchSellers = useCallback(async () => {
    try {
      setLoading(true)
      setError("")

      const params = new URLSearchParams()
      params.set("page", String(page))
      params.set("limit", "20")
      if (status) params.set("status", status)
      if (searchTerm) params.set("q", searchTerm)

      const response = await fetch(`/api/admin/sellers?${params.toString()}`)
      const json = await response.json()

      if (!response.ok) {
        throw new Error(json.error || "Failed to load sellers")
      }

      setData(json)
    } catch (err: any) {
      setError(err?.message || "Failed to load sellers")
    } finally {
      setLoading(false)
    }
  }, [page, status, searchTerm])

  useEffect(() => {
    fetchSellers()
  }, [fetchSellers])

  const actOnSeller = useCallback(
    async (sellerId: string, nextStatus: string, notes?: string) => {
      try {
        setActingOn(sellerId)
        setError("")

        const response = await fetch(`/api/admin/sellers/${sellerId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus, notes }),
        })

        const json = await response.json()
        if (!response.ok) {
          throw new Error(json.error || "Failed to update seller")
        }

        await fetchSellers()
      } catch (err: any) {
        setError(err?.message || "Failed to update seller")
      } finally {
        setActingOn(null)
      }
    },
    [fetchSellers]
  )

  const pagination = useMemo(() => {
    if (!data) return null

    return (
      <div className="admin-pagination">
        <button onClick={() => setPage(Math.max(1, data.pagination.page - 1))} disabled={data.pagination.page <= 1}>
          Previous
        </button>
        <span>
          Page {data.pagination.page} of {data.pagination.totalPages}
        </span>
        <button
          onClick={() => setPage(Math.min(data.pagination.totalPages, data.pagination.page + 1))}
          disabled={data.pagination.page >= data.pagination.totalPages}
        >
          Next
        </button>
      </div>
    )
  }, [data])

  return (
    <div className="admin-sellers">
      <div className="admin-moderation__toolbar">
        <div className="admin-moderation__filters">
          <label>
            Status
            <select value={status} onChange={(event) => {
              setPage(1)
              setStatus(event.target.value)
            }}>
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
                placeholder="Search name, email or username"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    setPage(1)
                    setSearchTerm(searchInput.trim())
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  setPage(1)
                  setSearchTerm(searchInput.trim())
                }}
              >
                Search
              </button>
            </div>
          </label>
        </div>

        <div className="admin-moderation__summary">
          {loading ? "Loading..." : `${data?.pagination.total ?? 0} seller${(data?.pagination.total ?? 0) === 1 ? "" : "s"}`}
        </div>
      </div>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}

      <div className="admin-table admin-table--sellers">
        <table>
          <thead>
            <tr>
              <th>Seller</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (!data || data.sellers.length === 0) ? (
              <tr>
                <td colSpan={5} className="admin-table__loading">
                  Loading sellers...
                </td>
              </tr>
            ) : data && data.sellers.length > 0 ? (
              data.sellers.map((seller) => {
                const badge = statusBadge(seller.sellerStatus)
                return (
                  <tr key={seller.id}>
                    <td>
                      <div className="admin-table__cell-title">
                        <strong>{seller.name || 'Unnamed Seller'}</strong>
                        <span>Username: {seller.username || '—'}</span>
                        <span>Country: {seller.country || '—'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="admin-table__cell-meta">
                        <span>{seller.email}</span>
                        <small>Last update: {formatDate(seller.sellerVerifiedAt)}</small>
                        {seller.sellerVerificationNotes && (
                          <small>Notes: {seller.sellerVerificationNotes}</small>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={badge.className}>{badge.label}</span>
                    </td>
                    <td>
                      <div className="admin-table__cell-meta">
                        <span>{formatDate(seller.createdAt)}</span>
                      </div>
                    </td>
                    <td>
                      <div className="admin-table__actions">
                        <button
                          type="button"
                          onClick={() => actOnSeller(seller.id, 'APPROVED')}
                          disabled={actingOn === seller.id || seller.sellerStatus === 'APPROVED'}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => actOnSeller(seller.id, 'REJECTED', 'Requirements not met')}
                          disabled={actingOn === seller.id || seller.sellerStatus === 'REJECTED'}
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          className="danger"
                          onClick={() => actOnSeller(seller.id, 'SUSPENDED', 'Account suspended by admin')}
                          disabled={actingOn === seller.id || seller.sellerStatus === 'SUSPENDED'}
                        >
                          Suspend
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={5} className="admin-table__empty">
                  No sellers found for the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination}
    </div>
  )
}
