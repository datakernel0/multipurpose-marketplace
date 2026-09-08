"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Table, Row, Col, Select, Input, Button, Tag, Space, Card, Badge, Spin, Pagination } from "antd"
const { Compact } = Space
import { SearchOutlined, MailOutlined, UserOutlined } from "@ant-design/icons"
import Link from "next/link"
import Image from "next/image"
import { withBasePath, getApiUrl } from "@/utils/paths"
import type { ColumnsType } from "antd/es/table"

interface AdminCustomer {
  id: string
  name: string | null
  email: string
  username: string | null
  avatar: string | null
  country: string | null
  billingName: string | null
  createdAt: string
  orderCount: number
  totalSpend: number
  lastPurchaseAt: string | null
  lastPurchaseAmount: number | null
  lastPurchaseStatus: string | null
}

interface CustomersResponse {
  customers: AdminCustomer[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  summary: {
    totalCustomers: number
    activeLast30Days: number
    newLast30Days: number
    averageLifetimeValue: number
  }
  generatedAt: string
}

const ACTIVITY_OPTIONS = [
  { label: "All customers", value: "" },
  { label: "Active (30 days)", value: "active" },
  { label: "New (30 days)", value: "new" },
  { label: "Dormant", value: "inactive" },
]

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Name A-Z", value: "name-az" },
  { label: "Name Z-A", value: "name-za" },
  { label: "Most Orders", value: "orders" },
]

function formatCurrency(amount: number) {
  return amount.toLocaleString("en-US", { style: "currency", currency: "USD" })
}

function formatDate(iso: string | null) {
  if (!iso) return "—"
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}

function formatJoined(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
}

function formatRelativeTime(iso: string | null) {
  if (!iso) return "No purchases"
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "No purchases"
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

export default function AdminCustomersManager() {
  const [data, setData] = useState<CustomersResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [page, setPage] = useState(1)
  const [activity, setActivity] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [searchInput, setSearchInput] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true)
      setError("")
      const params = new URLSearchParams()
      params.set("page", String(page))
      params.set("limit", "20")
      if (activity) params.set("activity", activity)
      if (sortBy) params.set("sort", sortBy)
      if (searchTerm) params.set("q", searchTerm)

      const response = await fetch(`${getApiUrl("/api/admin/customers")}?${params.toString()}`, {
        cache: "no-store",
        credentials: "include",
      })
      const json = await response.json()
      if (!response.ok) {
        throw new Error(json.error || "Failed to load customers")
      }
      setData(json)
    } catch (err: any) {
      setError(err?.message || "Failed to load customers")
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [page, activity, sortBy, searchTerm])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  const handleSearch = useCallback(() => {
    setPage(1)
    setSearchTerm(searchInput.trim())
  }, [searchInput])

  const customers = data?.customers ?? []
  const pagination = data?.pagination

  const columns: ColumnsType<AdminCustomer> = [
    {
      title: "Customer",
      dataIndex: "name",
      key: "customer",
      width: 250,
      render: (_, record) => (
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Image
            src={withBasePath(record.avatar || "/images/usr_avatar.png")}
            alt={record.name || record.email}
            width={48}
            height={48}
            style={{ objectFit: "cover", borderRadius: "50%" }}
          />
          <div>
            <div>
              <Link
                href={`/author?username=${record.username || record.id}`}
                style={{ fontWeight: 500, color: "#272b41" }}
              >
                {record.name || record.billingName || record.email}
              </Link>
            </div>
            <div style={{ fontSize: 12, color: "#868eae", marginTop: 4 }}>
              {record.username ? `@${record.username}` : "No username"}
            </div>
            <div style={{ fontSize: 12, color: "#868eae" }}>Joined {formatJoined(record.createdAt)}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Contact",
      dataIndex: "email",
      key: "contact",
      width: 200,
      render: (email, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{email}</div>
          {record.country && (
            <div style={{ fontSize: 12, color: "#868eae", marginTop: 4 }}>{record.country}</div>
          )}
        </div>
      ),
    },
    {
      title: "Orders",
      dataIndex: "orderCount",
      key: "orders",
      width: 120,
      render: (count) => (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontWeight: 500, fontSize: 16 }}>{count}</div>
          <div style={{ fontSize: 12, color: "#868eae" }}>orders</div>
        </div>
      ),
    },
    {
      title: "Lifetime Spend",
      dataIndex: "totalSpend",
      key: "spend",
      width: 150,
      render: (amount) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: 16 }}>{formatCurrency(amount)}</div>
          <div style={{ fontSize: 12, color: "#868eae" }}>lifetime</div>
        </div>
      ),
    },
    {
      title: "Last Purchase",
      dataIndex: "lastPurchaseAt",
      key: "lastPurchase",
      width: 180,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {record.lastPurchaseAmount != null ? formatCurrency(record.lastPurchaseAmount) : "—"}
          </div>
          <div style={{ fontSize: 12, color: "#868eae" }}>{formatRelativeTime(record.lastPurchaseAt)}</div>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      fixed: "right",
      render: (_, record) => (
        <Space size="small" wrap>
          <Button
            size="small"
            icon={<MailOutlined />}
            onClick={() => (window.location.href = `mailto:${record.email}`)}
          >
            Email
          </Button>
          {record.username && (
            <Link href={`/author?username=${record.username}`}>
              <Button size="small" icon={<UserOutlined />}>
                Profile
              </Button>
            </Link>
          )}
        </Space>
      ),
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
                style={{ width: 180 }}
                value={activity}
                onChange={(value) => {
                  setPage(1)
                  setActivity(value)
                }}
                placeholder="Activity"
                allowClear
              >
                {ACTIVITY_OPTIONS.map((option) => (
                  <Select.Option key={option.value || "all"} value={option.value}>
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
                  placeholder="Search customers..."
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
              {loading ? "Loading…" : `${pagination?.total ?? 0} customers`}
            </div>
          </div>
        }
        extra={
          data && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Tag color="blue">Total: {data.summary.totalCustomers}</Tag>
              <Tag color="green">Active 30d: {data.summary.activeLast30Days}</Tag>
              <Tag color="purple">New 30d: {data.summary.newLast30Days}</Tag>
              <Tag color="orange">
                Avg LTV: {formatCurrency(data.summary.averageLifetimeValue || 0)}
              </Tag>
            </div>
          )
        }
      >
        <Table
          columns={columns}
          dataSource={customers}
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
