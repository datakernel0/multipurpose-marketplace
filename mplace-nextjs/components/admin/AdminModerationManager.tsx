"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Table, Row, Col, Select, Input, Button, Tag, Space, Card, Badge, Spin, Pagination, Popconfirm, message } from "antd"
const { Compact } = Space
import { SearchOutlined } from "@ant-design/icons"
import Link from "next/link"
import Image from "next/image"
import { withBasePath, getApiUrl } from "@/utils/paths"
import type { ColumnsType } from "antd/es/table"

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

const STATUS_OPTIONS = [
  { label: "All Statuses", value: "" },
  { label: "Pending", value: "PENDING_REVIEW" },
  { label: "In Review", value: "IN_REVIEW" },
  { label: "Needs Revision", value: "NEEDS_REVISION" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
]

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString()
}

function getModerationTag(status: string) {
  const statusMap: Record<string, { color: string; text: string }> = {
    APPROVED: { color: "success", text: "Approved" },
    REJECTED: { color: "error", text: "Rejected" },
    NEEDS_REVISION: { color: "warning", text: "Needs Revision" },
    SUSPENDED: { color: "warning", text: "Suspended" },
    IN_REVIEW: { color: "processing", text: "In Review" },
    PENDING_REVIEW: { color: "default", text: "Pending Review" },
  }
  const mapped = statusMap[status] || { color: "default", text: status }
  return <Tag color={mapped.color}>{mapped.text}</Tag>
}

function getStatusTag(status: string) {
  const statusMap: Record<string, { color: string; text: string }> = {
    PUBLISHED: { color: "success", text: "Published" },
    PENDING_REVIEW: { color: "processing", text: "Pending Review" },
    APPROVED: { color: "success", text: "Approved" },
    REJECTED: { color: "error", text: "Rejected" },
    SUSPENDED: { color: "warning", text: "Suspended" },
    ARCHIVED: { color: "default", text: "Archived" },
    DRAFT: { color: "default", text: "Draft" },
  }
  const mapped = statusMap[status] || { color: "default", text: status }
  return <Tag color={mapped.color}>{mapped.text}</Tag>
}

function getSellerStatusTag(status: string) {
  const statusMap: Record<string, { color: string; text: string }> = {
    APPROVED: { color: "success", text: "Approved" },
    REJECTED: { color: "error", text: "Rejected" },
    SUSPENDED: { color: "warning", text: "Suspended" },
    PENDING_REVIEW: { color: "processing", text: "Pending Review" },
  }
  const mapped = statusMap[status] || { color: "default", text: status }
  return <Tag color={mapped.color}>{mapped.text}</Tag>
}

export default function AdminModerationManager() {
  const [data, setData] = useState<ModerationResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<string>("PENDING_REVIEW")
  const [searchInput, setSearchInput] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [actingOn, setActingOn] = useState<string | null>(null)

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError("")

      const params = new URLSearchParams()
      params.set("page", String(page))
      params.set("limit", "20")
      if (status) params.set("status", status)
      if (searchTerm) params.set("q", searchTerm)

      const response = await fetch(`${getApiUrl("/api/admin/moderation/products")}?${params.toString()}`, {
        cache: "no-store",
        credentials: "include",
      })
      const json = await response.json()

      if (!response.ok) {
        throw new Error(json.error || "Failed to load moderation queue")
      }

      setData(json)
    } catch (err: any) {
      setError(err?.message || "Failed to load moderation queue")
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [page, status, searchTerm])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const handleSearch = useCallback(() => {
    setPage(1)
    setSearchTerm(searchInput.trim())
  }, [searchInput])

  const actionProduct = useCallback(
    async (productId: string, action: "APPROVE" | "REJECT" | "REVISION", notes?: string) => {
      try {
        setActingOn(productId)
        setError("")

        const response = await fetch(`${getApiUrl(`/api/admin/moderation/products/${productId}`)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ action, notes }),
        })

        const json = await response.json()
        if (!response.ok) {
          throw new Error(json.error || "Failed to update product")
        }

        message.success(`Product ${action === "APPROVE" ? "approved" : action === "REJECT" ? "rejected" : "marked for revision"}`)
        await loadProducts()
      } catch (err: any) {
        setError(err?.message || "Failed to update product")
        message.error(err?.message || "Failed to update product")
      } finally {
        setActingOn(null)
      }
    },
    [loadProducts],
  )

  const products = data?.products ?? []
  const pagination = data?.pagination

  const columns: ColumnsType<ModerationProduct> = [
    {
      title: "Product",
      dataIndex: "title",
      key: "product",
      width: 300,
      render: (_, record) => (
        <div>
          <div>
            <Link href={`/single-product/${record.slug}`} style={{ fontWeight: 500, color: "#272b41" }} target="_blank">
              {record.title}
            </Link>
          </div>
          <div style={{ fontSize: 12, color: "#868eae", marginTop: 4 }}>
            {record.category ? record.category.name : "Uncategorised"}
          </div>
          <div style={{ fontSize: 12, color: "#868eae" }}>Created {formatDate(record.createdAt)}</div>
        </div>
      ),
    },
    {
      title: "Seller",
      dataIndex: "seller",
      key: "seller",
      width: 200,
      render: (seller) => (
        <div>
          <div style={{ fontWeight: 500 }}>{seller.name || "Unknown"}</div>
          <div style={{ fontSize: 12, color: "#868eae", marginTop: 4 }}>{seller.email}</div>
          <div style={{ marginTop: 4 }}>{getSellerStatusTag(seller.sellerStatus)}</div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "moderationStatus",
      key: "status",
      width: 200,
      render: (moderationStatus, record) => (
        <div>
          {getModerationTag(moderationStatus)}
          <div style={{ fontSize: 12, color: "#868eae", marginTop: 4 }}>
            Listing: {getStatusTag(record.status)}
          </div>
        </div>
      ),
    },
    {
      title: "Submitted",
      dataIndex: "createdAt",
      key: "submitted",
      width: 150,
      render: (createdAt, record) => (
        <div>
          <div>{formatDate(createdAt)}</div>
          <div style={{ fontSize: 12, color: "#868eae", marginTop: 4 }}>Updated {formatDate(record.updatedAt)}</div>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 300,
      fixed: "right",
      render: (_, record) => {
        const acting = actingOn === record.id
        return (
          <Space size="small" wrap>
            <Popconfirm
              title="Approve this product?"
              description="This product will be approved for publication."
              onConfirm={() => actionProduct(record.id, "APPROVE")}
              okText="Yes"
              cancelText="No"
            >
              <Button size="small" type="primary" disabled={acting}>
                Approve
              </Button>
            </Popconfirm>
            <Popconfirm
              title="Request revision?"
              description="The seller will be notified to make changes."
              onConfirm={() => actionProduct(record.id, "REVISION", "Requested changes")}
              okText="Yes"
              cancelText="No"
            >
              <Button size="small" disabled={acting}>
                Needs Revision
              </Button>
            </Popconfirm>
            <Popconfirm
              title="Reject this product?"
              description="This product will be rejected."
              onConfirm={() => actionProduct(record.id, "REJECT")}
              okText="Yes"
              cancelText="No"
            >
              <Button size="small" danger disabled={acting}>
                Reject
              </Button>
            </Popconfirm>
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
                value={status}
                onChange={(value) => {
                  setPage(1)
                  setStatus(value)
                }}
                placeholder="Status"
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
                  placeholder="Search products..."
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
              {loading ? "Loading…" : `${pagination?.total ?? 0} items`}
            </div>
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={products}
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

