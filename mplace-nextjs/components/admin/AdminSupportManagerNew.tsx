"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Table, Row, Col, Select, Input, Button, Tag, Space, Card, Badge, Spin, Pagination, message } from "antd"
const { Compact } = Space
import { SearchOutlined, MailOutlined, UserOutlined } from "@ant-design/icons"
import Link from "next/link"
import Image from "next/image"
import { withBasePath, getApiUrl } from "@/utils/paths"
import type { ColumnsType } from "antd/es/table"

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

function getStatusTag(status: string) {
  const statusMap: Record<string, { color: string; text: string }> = {
    OPEN: { color: "processing", text: "Open" },
    IN_PROGRESS: { color: "processing", text: "In Progress" },
    WAITING_CUSTOMER: { color: "warning", text: "Waiting Customer" },
    WAITING_SUPPORT: { color: "default", text: "Waiting Support" },
    RESOLVED: { color: "success", text: "Resolved" },
    CLOSED: { color: "default", text: "Closed" },
  }
  const mapped = statusMap[status] || { color: "default", text: titleCase(status) }
  return <Tag color={mapped.color}>{mapped.text}</Tag>
}

function getPriorityTag(priority: string) {
  const priorityMap: Record<string, { color: string; text: string }> = {
    LOW: { color: "default", text: "Low" },
    MEDIUM: { color: "processing", text: "Medium" },
    HIGH: { color: "warning", text: "High" },
    CRITICAL: { color: "error", text: "Critical" },
  }
  const mapped = priorityMap[priority] || { color: "default", text: titleCase(priority) }
  return <Tag color={mapped.color}>{mapped.text}</Tag>
}

export default function AdminSupportManagerNew() {
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

      const response = await fetch(`${getApiUrl("/api/admin/support/tickets")}?${params.toString()}`, {
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

  const updateTicket = useCallback(
    async (ticketId: string, payload: Record<string, unknown>) => {
      try {
        setActingTicket(ticketId)
        setError("")
        const response = await fetch(`${getApiUrl(`/api/admin/support/tickets/${ticketId}`)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        })
        const json = await response.json()
        if (!response.ok) {
          throw new Error(json.error || "Failed to update ticket")
        }
        message.success("Ticket updated successfully")
        await fetchTickets()
      } catch (err: any) {
        setError(err?.message || "Failed to update ticket")
        message.error(err?.message || "Failed to update ticket")
      } finally {
        setActingTicket(null)
      }
    },
    [fetchTickets],
  )

  const tickets = data?.tickets ?? []
  const pagination = data?.pagination

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

  const columns: ColumnsType<SupportTicketRow> = [
    {
      title: "Ticket",
      dataIndex: "subject",
      key: "ticket",
      width: 300,
      render: (subject, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{subject}</div>
          <div style={{ fontSize: 12, color: "#868eae", marginTop: 4 }}>Ref: {record.reference}</div>
          <div style={{ fontSize: 12, color: "#868eae", marginTop: 4 }}>{record.descriptionSnippet}…</div>
          <div style={{ fontSize: 12, color: "#868eae", marginTop: 4 }}>
            Opened {new Date(record.createdAt).toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      title: "Customer",
      dataIndex: "customer",
      key: "customer",
      width: 200,
      render: (customer) =>
        customer ? (
          <div>
            <div style={{ fontWeight: 500 }}>{customer.name || customer.email}</div>
            <div style={{ fontSize: 12, color: "#868eae", marginTop: 4 }}>{customer.email}</div>
          </div>
        ) : (
          <span style={{ color: "#868eae" }}>Anonymous</span>
        ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => getStatusTag(status),
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      width: 120,
      render: (priority) => getPriorityTag(priority),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 120,
      render: (category) => titleCase(category),
    },
    {
      title: "Last Activity",
      dataIndex: "lastActivityAt",
      key: "activity",
      width: 150,
      render: (lastActivityAt, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{formatRelativeTime(lastActivityAt)}</div>
          <div style={{ fontSize: 12, color: "#868eae", marginTop: 4 }}>Updated {formatRelativeTime(record.updatedAt)}</div>
        </div>
      ),
    },
    {
      title: "Assignee",
      dataIndex: "assignedTo",
      key: "assignee",
      width: 150,
      render: (assignedTo) =>
        assignedTo ? (
          <div>
            <div style={{ fontWeight: 500 }}>{assignedTo.name || assignedTo.email}</div>
          </div>
        ) : (
          <span style={{ color: "#868eae" }}>Unassigned</span>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 250,
      fixed: "right",
      render: (_, record) => {
        const acting = actingTicket === record.id
        return (
          <Space size="small" wrap>
            <Button
              size="small"
              disabled={acting}
              onClick={() => updateTicket(record.id, { status: "IN_PROGRESS" })}
            >
              Start
            </Button>
            <Button
              size="small"
              type="primary"
              disabled={acting}
              onClick={() => updateTicket(record.id, { status: "RESOLVED" })}
            >
              Resolve
            </Button>
            {record.customer && (
              <Link href={`/dashboard/customer?user=${record.customer.id}`}>
                <Button size="small" icon={<UserOutlined />}>
                  Customer
                </Button>
              </Link>
            )}
          </Space>
        )
      },
    },
  ]

  return (
    <div style={{ padding: "30px", background: "#f4f5f7", minHeight: "calc(100vh - 64px)" }}>
      {error && (
        <div style={{ marginBottom: 16, padding: 12, background: "#fff2f0", border: "1px solid #ffccc7", borderRadius: 4, color: "#a8071a" }}>
          {error}
        </div>
      )}

      <Card
        title={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <Select
                style={{ width: 150 }}
                value={statusFilter}
                onChange={(value) => {
                  setPage(1)
                  setStatusFilter(value)
                }}
                placeholder="Status"
                allowClear
              >
                {STATUS_FILTERS.map((option) => (
                  <Select.Option key={option.value || "status-all"} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>

              <Select
                style={{ width: 150 }}
                value={priorityFilter}
                onChange={(value) => {
                  setPage(1)
                  setPriorityFilter(value)
                }}
                placeholder="Priority"
                allowClear
              >
                {PRIORITY_FILTERS.map((option) => (
                  <Select.Option key={option.value || "priority-all"} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>

              <Select
                style={{ width: 150 }}
                value={categoryFilter}
                onChange={(value) => {
                  setPage(1)
                  setCategoryFilter(value)
                }}
                placeholder="Category"
                allowClear
              >
                {CATEGORY_FILTERS.map((option) => (
                  <Select.Option key={option.value || "category-all"} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>

              <Select
                style={{ width: 150 }}
                value={assignedFilter}
                onChange={(value) => {
                  setPage(1)
                  setAssignedFilter(value)
                }}
                placeholder="Assignment"
                allowClear
              >
                {ASSIGNED_FILTERS.map((option) => (
                  <Select.Option key={option.value || "assigned-all"} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>

              <Select
                style={{ width: 150 }}
                value={sortBy}
                onChange={(value) => {
                  setPage(1)
                  setSortBy(value)
                }}
                placeholder="Sort By"
              >
                {SORT_OPTIONS.map((option) => (
                  <Select.Option key={option.value} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>

              <Space.Compact style={{ display: "flex", alignItems: "center" }}>
                <Input
                  style={{ width: 250 }}
                  placeholder="Search tickets..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onPressEnter={handleSearch}
                  prefix={<SearchOutlined style={{ color: "#868eae", fontSize: 14 }} />}
                  allowClear
                />
                <Button type="primary" onClick={handleSearch} style={{ height: 32 }}>
                  Search
                </Button>
              </Space.Compact>
            </div>

            <div style={{ fontSize: 14, color: "#868eae" }}>
              {loading ? "Loading…" : `${pagination?.total ?? 0} tickets`}
            </div>
          </div>
        }
        extra={
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {summaryChips.map((chip) => (
              <Tag key={chip.label} color="blue">
                {chip.label}: {chip.value}
              </Tag>
            ))}
            {priorityChips.map((chip) => (
              <Tag key={chip.label} color="purple">
                {chip.label}: {chip.value}
              </Tag>
            ))}
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={tickets}
          rowKey="id"
          loading={loading}
          pagination={false}
          scroll={{ x: 1500 }}
        />

        {pagination && (
          <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
            <Pagination
              current={pagination.page}
              total={pagination.total}
              pageSize={pagination.limit}
              showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
              onChange={(page) => setPage(page)}
              showSizeChanger
              onShowSizeChange={(_, size) => {
                setPage(1)
              }}
            />
          </div>
        )}
      </Card>
    </div>
  )
}

