"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"

interface SupportTicketRow {
  id: string
  reference: string
  subject: string
  descriptionSnippet: string
  status: string
  priority: string
  category: string
  createdAt: string
  updatedAt: string
  lastActivityAt: string | null
  resolvedAt: string | null
  customer: {
    id: string
    name: string | null
    email: string
    username: string | null
    image: string | null
  } | null
  assignedTo: {
    id: string
    name: string | null
    email: string
  } | null
}

interface TicketsResponse {
  tickets: SupportTicketRow[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  summary: {
    status: Record<string, number>
    priority: Record<string, number>
    category: Record<string, number>
    activeLast30Days: number
  }
  generatedAt: string
}

const STATUS_FILTERS = [
  { label: "All Statuses", value: "" },
  { label: "Open", value: "OPEN" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Waiting Customer", value: "WAITING_CUSTOMER" },
  { label: "Waiting Support", value: "WAITING_SUPPORT" },
  { label: "Resolved", value: "RESOLVED" },
  { label: "Closed", value: "CLOSED" },
]

const PRIORITY_FILTERS = [
  { label: "All Priorities", value: "" },
  { label: "Low", value: "LOW" },
  { label: "Medium", value: "MEDIUM" },
  { label: "High", value: "HIGH" },
  { label: "Critical", value: "CRITICAL" },
]

const CATEGORY_FILTERS = [
  { label: "All Categories", value: "" },
  { label: "General", value: "GENERAL" },
  { label: "Billing", value: "BILLING" },
  { label: "Technical", value: "TECHNICAL" },
  { label: "Account", value: "ACCOUNT" },
  { label: "Sales", value: "SALES" },
]

const ASSIGNED_FILTERS = [
  { label: "All", value: "" },
  { label: "Assigned", value: "assigned" },
  { label: "Unassigned", value: "unassigned" },
]

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Priority", value: "priority" },
  { label: "Updated", value: "updated" },
  { label: "Last Activity", value: "last-activity" },
]

function titleCase(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function formatRelativeTime(iso: string | null) {
  if (!iso) return "No activity"
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "No activity"
  const diffMs = Date.now() - date.getTime()
  const minutes = Math.floor(diffMs / (1000 * 60))
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} mo${months === 1 ? "" : "s"} ago`
  const years = Math.floor(months / 12)
  return `${years} yr${years === 1 ? "" : "s"} ago`
}

export default function AdminSupportManager() {
  const [data, setData] = useState<TicketsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [assignedFilter, setAssignedFilter] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [actingTicket, setActingTicket] = useState<string | null>(null)

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true)
      setError("")
      const params = new URLSearchParams()
      params.set("page", String(page))
      params.set("limit", "20")
      if (statusFilter) params.set("status", statusFilter)
      if (priorityFilter) params.set("priority", priorityFilter)
      if (categoryFilter) params.set("category", categoryFilter)
      if (assignedFilter) params.set("assigned", assignedFilter)
      if (searchTerm) params.set("q", searchTerm)
      if (sortBy) params.set("sort", sortBy)

      const response = await fetch(`/api/admin/support/tickets?${params.toString()}`, {
        cache: "no-store",
        credentials: "include",
      })
      const json = await response.json()
      if (!response.ok) {
        throw new Error(json.error || "Failed to load tickets")
      }
      setData(json)
    } catch (err: any) {
      setError(err?.message || "Failed to load tickets")
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, priorityFilter, categoryFilter, assignedFilter, searchTerm, sortBy])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  const handleSearch = useCallback(() => {
    setPage(1)
    setSearchTerm(searchInput.trim())
  }, [searchInput])

  const pagination = data?.pagination
  const tickets = data?.tickets ?? []

  const paginationControls = useMemo(() => {
    if (!pagination) return null
    const { page: current, totalPages } = pagination
    return (
      <div className="admin-pagination">
        <button onClick={() => setPage(Math.max(current - 1, 1))} disabled={current <= 1 || loading}>
          Previous
        </button>
        <span>
          Page {current} of {totalPages}
        </span>
        <button onClick={() => setPage(Math.min(current + 1, totalPages))} disabled={current >= totalPages || loading}>
          Next
        </button>
      </div>
    )
  }, [pagination, loading])

  const summaryChips = useMemo(() => {
    if (!data) return []
    const chips: Array<{ label: string; value: number }> = []
    for (const [status, count] of Object.entries(data.summary.status)) {
      chips.push({ label: titleCase(status), value: count })
    }
    chips.push({ label: "Active (30d)", value: data.summary.activeLast30Days })
    return chips
  }, [data])

  const priorityChips = useMemo(() => {
    if (!data) return []
    return Object.entries(data.summary.priority).map(([priority, count]) => ({ label: titleCase(priority), value: count }))
  }, [data])

  const updateTicket = useCallback(
    async (ticketId: string, payload: Record<string, unknown>) => {
      try {
        setActingTicket(ticketId)
        setError("")
        const response = await fetch(`/api/admin/support/tickets/${ticketId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        })
        const json = await response.json()
        if (!response.ok) {
          throw new Error(json.error || "Failed to update ticket")
        }
        await fetchTickets()
      } catch (err: any) {
        setError(err?.message || "Failed to update ticket")
      } finally {
        setActingTicket(null)
      }
    },
    [fetchTickets],
  )

  return (
    <div className="admin-support">
      {error && <div className="admin-alert admin-alert--error">{error}</div>}

      <div className="admin-moderation">
        <div className="admin-moderation__toolbar">
          <div className="admin-moderation__filters">
            <label>
              Status
              <select
                value={statusFilter}
                onChange={(event) => {
                  setPage(1)
                  setStatusFilter(event.target.value)
                }}
              >
                {STATUS_FILTERS.map((option) => (
                  <option key={option.value || "status-all"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Priority
              <select
                value={priorityFilter}
                onChange={(event) => {
                  setPage(1)
                  setPriorityFilter(event.target.value)
                }}
              >
                {PRIORITY_FILTERS.map((option) => (
                  <option key={option.value || "priority-all"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Category
              <select
                value={categoryFilter}
                onChange={(event) => {
                  setPage(1)
                  setCategoryFilter(event.target.value)
                }}
              >
                {CATEGORY_FILTERS.map((option) => (
                  <option key={option.value || "category-all"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Assignment
              <select
                value={assignedFilter}
                onChange={(event) => {
                  setPage(1)
                  setAssignedFilter(event.target.value)
                }}
              >
                {ASSIGNED_FILTERS.map((option) => (
                  <option key={option.value || "assigned-all"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Sort
              <select
                value={sortBy}
                onChange={(event) => {
                  setPage(1)
                  setSortBy(event.target.value)
                }}
              >
                {SORT_OPTIONS.map((option) => (
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
                  placeholder="Search reference, subject, or customer"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleSearch()
                    }
                  }}
                />
                <button type="button" onClick={handleSearch}>
                  Search
                </button>
              </div>
            </label>
          </div>

          <div className="admin-moderation__summary">
            {loading ? <span>Loading…</span> : <span>{pagination?.total ?? 0} tickets</span>}
          </div>
        </div>

        {summaryChips.length > 0 && (
          <div className="admin-summary-chips">
            {summaryChips.map((chip) => (
              <span key={chip.label} className="admin-summary-chip">
                {chip.label}: {chip.value}
              </span>
            ))}
          </div>
        )}

        {priorityChips.length > 0 && (
          <div className="admin-summary-chips admin-summary-chips--secondary">
            {priorityChips.map((chip) => (
              <span key={chip.label} className="admin-summary-chip">
                {chip.label}: {chip.value}
              </span>
            ))}
          </div>
        )}

        <div className="admin-table admin-table--support">
          <table>
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Category</th>
                <th>Last Activity</th>
                <th>Assignee</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "30px" }}>
                    Loading support tickets…
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "30px" }}>
                    No tickets found for the selected filters.
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => {
                  const acting = actingTicket === ticket.id
                  return (
                    <tr key={ticket.id}>
                      <td>
                        <div className="admin-support-cell">
                          <strong>{ticket.subject}</strong>
                          <span className="admin-support-cell__ref">Ref: {ticket.reference}</span>
                          <span className="admin-support-cell__snippet">{ticket.descriptionSnippet}…</span>
                          <span className="admin-support-cell__created">
                            Opened {new Date(ticket.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td>
                        {ticket.customer ? (
                          <div className="admin-support-cell__customer">
                            <span>{ticket.customer.name || ticket.customer.email}</span>
                            <a href={`mailto:${ticket.customer.email}`}>{ticket.customer.email}</a>
                          </div>
                        ) : (
                          <span>Anonymous</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge badge--status-${ticket.status.toLowerCase()}`}>{titleCase(ticket.status)}</span>
                      </td>
                      <td>
                        <span className={`badge badge--priority-${ticket.priority.toLowerCase()}`}>{titleCase(ticket.priority)}</span>
                      </td>
                      <td>{titleCase(ticket.category)}</td>
                      <td>
                        <div className="admin-support-cell__activity">
                          <strong>{formatRelativeTime(ticket.lastActivityAt)}</strong>
                          <span>Updated {formatRelativeTime(ticket.updatedAt)}</span>
                        </div>
                      </td>
                      <td>
                        {ticket.assignedTo ? (
                          <span>{ticket.assignedTo.name || ticket.assignedTo.email}</span>
                        ) : (
                          <span className="admin-support-cell__unassigned">Unassigned</span>
                        )}
                      </td>
                      <td>
                        <div className="admin-support-cell__actions">
                          <button
                            type="button"
                            className="btn btn--xs"
                            disabled={acting}
                            onClick={() => updateTicket(ticket.id, { status: "IN_PROGRESS" })}
                          >
                            Start
                          </button>
                          <button
                            type="button"
                            className="btn btn--xs"
                            disabled={acting}
                            onClick={() => updateTicket(ticket.id, { status: "RESOLVED" })}
                          >
                            Resolve
                          </button>
                          <Link className="btn btn--xs btn--outline" href={`/dashboard/customer?user=${ticket.customer?.id ?? ""}`}>
                            View Customer
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {paginationControls}
      </div>
    </div>
  )
}
