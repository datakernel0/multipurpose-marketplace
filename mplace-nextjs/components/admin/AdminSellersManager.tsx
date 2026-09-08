"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Table, Row, Col, Select, Input, Button, Tag, Space, Card, Badge, Spin, Pagination, Popconfirm, message } from "antd"
const { Compact } = Space
import { SearchOutlined } from "@ant-design/icons"
import Link from "next/link"
import Image from "next/image"
import { withBasePath, getApiUrl } from "@/utils/paths"
import type { ColumnsType } from "antd/es/table"

interface AdminSeller {
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

interface AdminSellersResponse {
  sellers: AdminSeller[]
  metrics: Record<string, number>
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const STATUS_OPTIONS = [
  { label: "All Statuses", value: "" },
  { label: "Pending Review", value: "PENDING_REVIEW" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Suspended", value: "SUSPENDED" },
]

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Name (A-Z)", value: "name-asc" },
  { label: "Name (Z-A)", value: "name-desc" },
]

function formatDate(value: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString()
}

function getStatusTag(status: string) {
  const statusMap: Record<string, { color: string; text: string }> = {
    APPROVED: { color: "success", text: "Approved" },
    REJECTED: { color: "error", text: "Rejected" },
    SUSPENDED: { color: "warning", text: "Suspended" },
    PENDING_REVIEW: { color: "processing", text: "Pending Review" },
  }
  const mapped = statusMap[status] || { color: "default", text: status }
  return <Tag color={mapped.color}>{mapped.text}</Tag>
}

export default function AdminSellersManager() {
  const [data, setData] = useState<AdminSellersResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [searchInput, setSearchInput] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [actingSeller, setActingSeller] = useState<string | null>(null)

  const fetchSellers = useCallback(async () => {
    try {
      setLoading(true)
      setError("")

      const params = new URLSearchParams()
      params.set("page", String(page))
      params.set("limit", "20")
      if (statusFilter) params.set("status", statusFilter)
      if (searchTerm) params.set("q", searchTerm)

      const response = await fetch(`${getApiUrl("/api/admin/sellers")}?${params.toString()}`, {
        cache: "no-store",
        credentials: "include",
      })
      const json = await response.json()

      if (!response.ok) {
        throw new Error(json.error || "Failed to load sellers")
      }

      setData(json)
    } catch (err: any) {
      setError(err?.message || "Failed to load sellers")
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, searchTerm])

  useEffect(() => {
    fetchSellers()
  }, [fetchSellers])

  const handleSearch = useCallback(() => {
    setPage(1)
    setSearchTerm(searchInput.trim())
  }, [searchInput])

  const actOnSeller = useCallback(
    async (sellerId: string, nextStatus: string, notes?: string) => {
      try {
        setActingSeller(sellerId)
        setError("")

        const response = await fetch(`${getApiUrl(`/api/admin/sellers/${sellerId}`)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status: nextStatus, notes }),
        })

        const json = await response.json()
        if (!response.ok) {
          throw new Error(json.error || "Failed to update seller")
        }

        message.success(`Seller status updated to ${nextStatus}`)
        await fetchSellers()
      } catch (err: any) {
        setError(err?.message || "Failed to update seller")
        message.error(err?.message || "Failed to update seller")
      } finally {
        setActingSeller(null)
      }
    },
    [fetchSellers],
  )

  const sellers = data?.sellers ?? []
  const pagination = data?.pagination

  const statusSummary = useMemo(() => {
    if (!data?.metrics) return []
    return Object.entries(data.metrics).map(([key, count]) => ({
      label: key.replace(/_/g, " "),
      count,
    }))
  }, [data])

  const columns: ColumnsType<AdminSeller> = [
    {
      title: "Seller",
      dataIndex: "name",
      key: "seller",
      width: 250,
      render: (_, record) => (
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Image
            src={withBasePath("/images/usr_avatar.png")}
            alt="Seller avatar"
            width={48}
            height={48}
            style={{ objectFit: "cover", borderRadius: "50%" }}
          />
          <div>
            <div>
              <Link href={`/author?username=${record.username || record.id}`} style={{ fontWeight: 500, color: "#272b41" }}>
                {record.name || "Unnamed Seller"}
              </Link>
            </div>
            <div style={{ fontSize: 12, color: "#868eae", marginTop: 4 }}>
              @{record.username || "no-username"}
            </div>
            {record.country && (
              <div style={{ fontSize: 12, color: "#868eae" }}>{record.country}</div>
            )}
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
          {record.sellerVerifiedAt && (
            <div style={{ fontSize: 12, color: "#868eae", marginTop: 4 }}>
              Verified: {formatDate(record.sellerVerifiedAt)}
            </div>
          )}
          {record.sellerVerificationNotes && (
            <div style={{ fontSize: 12, color: "#868eae", marginTop: 4, fontStyle: "italic" }}>
              {record.sellerVerificationNotes}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "sellerStatus",
      key: "status",
      width: 150,
      render: (status) => getStatusTag(status),
    },
    {
      title: "Joined",
      dataIndex: "createdAt",
      key: "joined",
      width: 120,
      render: (date) => formatDate(date),
    },
    {
      title: "Actions",
      key: "actions",
      width: 300,
      fixed: "right",
      render: (_, record) => {
        const acting = actingSeller === record.id
        return (
          <Space size="small" wrap>
            {record.sellerStatus !== "APPROVED" && (
              <Popconfirm
                title="Approve this seller?"
                description="This seller will be able to publish products."
                onConfirm={() => actOnSeller(record.id, "APPROVED")}
                okText="Yes"
                cancelText="No"
              >
                <Button size="small" type="primary" disabled={acting}>
                  Approve
                </Button>
              </Popconfirm>
            )}
            {record.sellerStatus !== "REJECTED" && (
              <Popconfirm
                title="Reject this seller?"
                description="This seller application will be rejected."
                onConfirm={() => actOnSeller(record.id, "REJECTED", "Requirements not met")}
                okText="Yes"
                cancelText="No"
              >
                <Button size="small" danger disabled={acting}>
                  Reject
                </Button>
              </Popconfirm>
            )}
            {record.sellerStatus !== "SUSPENDED" && (
              <Popconfirm
                title="Suspend this seller?"
                description="This seller account will be suspended."
                onConfirm={() => actOnSeller(record.id, "SUSPENDED", "Account suspended by admin")}
                okText="Yes"
                cancelText="No"
              >
                <Button size="small" danger disabled={acting}>
                  Suspend
                </Button>
              </Popconfirm>
            )}
            {record.sellerStatus === "SUSPENDED" && (
              <Popconfirm
                title="Restore this seller?"
                description="This seller account will be restored."
                onConfirm={() => actOnSeller(record.id, "APPROVED")}
                okText="Yes"
                cancelText="No"
              >
                <Button size="small" disabled={acting}>
                  Restore
                </Button>
              </Popconfirm>
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
                style={{ width: 180 }}
                value={statusFilter}
                onChange={(value) => {
                  setPage(1)
                  setStatusFilter(value)
                }}
                placeholder="Status"
                allowClear
              >
                {STATUS_OPTIONS.map((option) => (
                  <Select.Option key={option.value || "all"} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>

              <Space.Compact style={{ display: "flex", alignItems: "center" }}>
                <Input
                  style={{ width: 250 }}
                  placeholder="Search sellers..."
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
              {loading ? "Loading…" : `${pagination?.total ?? 0} sellers`}
            </div>
          </div>
        }
        extra={
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {statusSummary.map((chip) => (
              <Tag key={chip.label} color="blue">
                {chip.label}: {chip.count}
              </Tag>
            ))}
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={sellers}
          rowKey="id"
          loading={loading}
          pagination={false}
          scroll={{ x: 1000 }}
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

