"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Table, Row, Col, Select, Input, Button, Tag, Space, Card, Badge, Spin, Pagination, DatePicker } from "antd"
const { Compact } = Space
import { SearchOutlined } from "@ant-design/icons"
import Link from "next/link"
import { withBasePath, getApiUrl } from "@/utils/paths"
import type { ColumnsType } from "antd/es/table"
import dayjs from "dayjs"
// Note: dayjs should be available with antd v6, but if not, install it: npm install dayjs

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

function getActionTag(action: string) {
  const actionMap: Record<string, { color: string; text: string }> = {
    APPROVED: { color: "success", text: "Approved" },
    REJECTED: { color: "error", text: "Rejected" },
    SUSPENDED: { color: "warning", text: "Suspended" },
    FLAGGED: { color: "processing", text: "Flagged" },
    NEEDS_REVISION: { color: "warning", text: "Needs Revision" },
  }
  const mapped = actionMap[action] || { color: "default", text: formatActionLabel(action) }
  return <Tag color={mapped.color}>{mapped.text}</Tag>
}

export default function AdminLogsManager() {
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

      const response = await fetch(`${getApiUrl("/api/admin/audit-logs")}?${params.toString()}`, {
        cache: "no-store",
        credentials: "include",
      })
      const json = await response.json()
      if (!response.ok) {
        throw new Error(json.error || "Failed to load audit log")
      }

      setData(json)
    } catch (err: any) {
      setError(err?.message || "Failed to load audit logs")
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [page, actionFilter, entityFilter, searchTerm, fromDate, toDate])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const handleSearch = useCallback(() => {
    setPage(1)
    setSearchTerm(searchInput.trim())
  }, [searchInput])

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

  const entries = data?.entries ?? []
  const pagination = data?.pagination

  const columns: ColumnsType<AuditLogEntry> = [
    {
      title: "When",
      dataIndex: "createdAt",
      key: "when",
      width: 180,
      render: (createdAt, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{new Date(createdAt).toLocaleString()}</div>
          <div style={{ fontSize: 12, color: "#868eae", marginTop: 4 }}>ID: {record.id.slice(0, 8)}...</div>
        </div>
      ),
    },
    {
      title: "Entity",
      dataIndex: "entityLabel",
      key: "entity",
      width: 250,
      render: (entityLabel, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{entityLabel}</div>
          <div style={{ fontSize: 12, color: "#868eae", marginTop: 4 }}>{formatEntityLabel(record.entityType)}</div>
          {record.entityLink && (
            <Link href={withBasePath(record.entityLink)} target="_blank" style={{ fontSize: 12, marginTop: 4, display: "block" }}>
              View entity →
            </Link>
          )}
        </div>
      ),
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      width: 150,
      render: (action) => getActionTag(action),
    },
    {
      title: "Moderator",
      dataIndex: "performedBy",
      key: "moderator",
      width: 200,
      render: (performedBy) => (
        <div>
          <div style={{ fontWeight: 500 }}>{performedBy?.name || performedBy?.email || "System"}</div>
          {performedBy?.email && performedBy?.name && (
            <div style={{ fontSize: 12, color: "#868eae", marginTop: 4 }}>{performedBy.email}</div>
          )}
        </div>
      ),
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
      width: 300,
      render: (notes) => <div style={{ color: notes ? "#272b41" : "#868eae" }}>{notes || "—"}</div>,
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
                value={actionFilter}
                onChange={(value) => {
                  setPage(1)
                  setActionFilter(value)
                }}
                placeholder="Action"
                allowClear
              >
                {ACTION_OPTIONS.map((option) => (
                  <Select.Option key={option.value || "all"} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>

              <Select
                style={{ width: 150 }}
                value={entityFilter}
                onChange={(value) => {
                  setPage(1)
                  setEntityFilter(value)
                }}
                placeholder="Entity"
                allowClear
              >
                {ENTITY_OPTIONS.map((option) => (
                  <Select.Option key={option.value || "all"} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>

              <DatePicker
                style={{ width: 150 }}
                placeholder="From Date"
                value={fromDate ? dayjs(fromDate) : null}
                onChange={(date) => {
                  setPage(1)
                  setFromDate(date ? date.format("YYYY-MM-DD") : "")
                }}
                allowClear
              />

              <DatePicker
                style={{ width: 150 }}
                placeholder="To Date"
                value={toDate ? dayjs(toDate) : null}
                onChange={(date) => {
                  setPage(1)
                  setToDate(date ? date.format("YYYY-MM-DD") : "")
                }}
                allowClear
              />

              <Space.Compact style={{ display: "flex", alignItems: "center" }}>
                <Input
                  style={{ width: 250 }}
                  placeholder="Search logs..."
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
              {loading ? "Loading…" : `${pagination?.total ?? 0} records`}
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
            {entityChips.map((chip) => (
              <Tag key={chip.label} color="purple">
                {chip.label}: {chip.value}
              </Tag>
            ))}
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={entries}
          rowKey="id"
          loading={loading}
          pagination={false}
          scroll={{ x: 1200 }}
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

