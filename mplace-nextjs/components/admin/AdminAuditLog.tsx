"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

const ACTION_OPTIONS = [
  { label: "All Actions", value: "" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Flagged", value: "FLAGGED" },
  { label: "Suspended", value: "SUSPENDED" },
]

const ENTITY_OPTIONS = [
  { label: "All Entities", value: "" },
  { label: "Products", value: "PRODUCT" },
  { label: "Seller Profiles", value: "SELLER_PROFILE" },
  { label: "Users", value: "USER" },
]

interface AuditLogEntry {
  id: string
  entityType: string
  entityId: string
  action: string
  notes: string | null
  metadata: unknown
  createdAt: string
  performedBy: {
    id: string
    name: string | null
    email: string
  } | null
  product: {
    id: string
    title: string
    slug: string | null
  } | null
  entityLabel: string
  entityLink: string | null
}

interface AuditLogResponse {
  entries: AuditLogEntry[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  summary: {
    actions: Record<string, number>
    entities: Record<string, number>
  }
}

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function formatActionLabel(action: string) {
  return toTitleCase(action)
}

function formatEntityLabel(entityType: string) {
  return toTitleCase(entityType)
}

function actionClassName(action: string) {
  switch (action) {
    case "APPROVED":
      return "badge badge--approved"
    case "REJECTED":
      return "badge badge--status-rejected"
    case "SUSPENDED":
      return "badge badge--suspended"
    case "FLAGGED":
    case "NEEDS_REVISION":
      return "badge badge--flagged"
    default:
      return "badge"
  }
}

export default function AdminAuditLog() {
  const [data, setData] = useState<AuditLogResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [page, setPage] = useState(1)
  const [actionFilter, setActionFilter] = useState("")
  const [entityFilter, setEntityFilter] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true)
      setError("")
      const params = new URLSearchParams()
      params.set("page", String(page))
      params.set("limit", "20")
      if (actionFilter) params.set("action", actionFilter)
      if (entityFilter) params.set("entity", entityFilter)
      if (searchTerm) params.set("q", searchTerm)
      if (fromDate) params.set("from", fromDate)
      if (toDate) params.set("to", toDate)

      const response = await fetch(`/api/admin/audit-logs?${params.toString()}`, { cache: "no-store" })
      const json = await response.json()
      if (!response.ok) {
        throw new Error(json.error || "Failed to load audit log")
      }

      setData(json)
    } catch (err: any) {
      setError(err?.message || "Failed to load audit logs")
    } finally {
      setLoading(false)
    }
  }, [page, actionFilter, entityFilter, searchTerm, fromDate, toDate])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const summaryChips = useMemo(() => {
    if (!data) return []
    const chips = [] as Array<{ label: string; value: number }>
    for (const [action, count] of Object.entries(data.summary.actions)) {
      chips.push({ label: formatActionLabel(action), value: count })
    }
    return chips
  }, [data])

  const entityChips = useMemo(() => {
    if (!data) return []
    const chips = [] as Array<{ label: string; value: number }>
    for (const [entity, count] of Object.entries(data.summary.entities)) {
      chips.push({ label: formatEntityLabel(entity), value: count })
    }
    return chips
  }, [data])

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <div>
          <h2>Audit Log</h2>
          <p>Review moderation decisions and administrator actions across the marketplace.</p>
        </div>
        {data && <span className="admin-page__meta">Total entries: {data.pagination.total}</span>}
      </header>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}

      <div className="admin-moderation">
        <div className="admin-moderation__toolbar">
          <div className="admin-moderation__filters">
            <label>
              Action
              <select
                value={actionFilter}
                onChange={(event) => {
                  setPage(1)
                  setActionFilter(event.target.value)
                }}
              >
                {ACTION_OPTIONS.map((option) => (
                  <option key={option.value || "all"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Entity
              <select
                value={entityFilter}
                onChange={(event) => {
                  setPage(1)
                  setEntityFilter(event.target.value)
                }}
              >
                {ENTITY_OPTIONS.map((option) => (
                  <option key={option.value || "all"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              From
              <input
                type="date"
                value={fromDate}
                onChange={(event) => {
                  setPage(1)
                  setFromDate(event.target.value)
                }}
              />
            </label>

            <label>
              To
              <input
                type="date"
                value={toDate}
                onChange={(event) => {
                  setPage(1)
                  setToDate(event.target.value)
                }}
              />
            </label>

            <label>
              Search
              <div className="admin-moderation__search">
                <input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search notes, entity or moderator"
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
            {loading ? "Loading..." : `${data?.pagination.total ?? 0} record${data && data.pagination.total === 1 ? "" : "s"}`}
          </div>
        </div>

        {(summaryChips.length > 0 || entityChips.length > 0) && (
          <div className="admin-stats">
            {summaryChips.length > 0 && (
              <div className="admin-stats__group">
                <h4>By Action</h4>
                <div className="admin-stats-chips">
                  {summaryChips.map((chip) => (
                    <span key={chip.label} className="admin-stats-chip">
                      {chip.label}: <strong>{chip.value}</strong>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {entityChips.length > 0 && (
              <div className="admin-stats__group">
                <h4>By Entity</h4>
                <div className="admin-stats-chips">
                  {entityChips.map((chip) => (
                    <span key={chip.label} className="admin-stats-chip">
                      {chip.label}: <strong>{chip.value}</strong>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>When</th>
                <th>Entity</th>
                <th>Action</th>
                <th>Moderator</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {loading && (!data || data.entries.length === 0) ? (
                <tr>
                  <td colSpan={5} className="admin-table__loading">
                    Loading audit entries...
                  </td>
                </tr>
              ) : data && data.entries.length > 0 ? (
                data.entries.map((entry) => (
                  <tr key={entry.id}>
                    <td>
                      <div className="admin-table__cell-meta">
                        <strong>{new Date(entry.createdAt).toLocaleString()}</strong>
                        <span>ID: {entry.id}</span>
                      </div>
                    </td>
                    <td>
                      <div className="admin-table__cell-title">
                        <strong>{entry.entityLabel}</strong>
                        <span>{formatEntityLabel(entry.entityType)}</span>
                        {entry.entityLink && (
                          <a href={entry.entityLink} target="_blank" rel="noreferrer">
                            View entity
                          </a>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={actionClassName(entry.action)}>{formatActionLabel(entry.action)}</span>
                    </td>
                    <td>
                      <div className="admin-table__cell-meta">
                        <span>{entry.performedBy?.name || entry.performedBy?.email || "System"}</span>
                        {entry.performedBy?.email && entry.performedBy?.name && (
                          <small>{entry.performedBy.email}</small>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="admin-table__cell-meta">
                        <span>{entry.notes || "—"}</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="admin-table__empty">
                    No audit records match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {data && (
          <div className="admin-pagination">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1 || loading}>
              Previous
            </button>
            <span>
              Page {page} of {data.pagination.totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(data.pagination.totalPages, page + 1))}
              disabled={page >= data.pagination.totalPages || loading}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
