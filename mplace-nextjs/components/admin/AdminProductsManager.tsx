"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Table, Row, Col, Select, Input, Button, Tag, Space, Card, Badge, Spin, Pagination } from "antd"
const { Compact } = Space
import { SearchOutlined } from "@ant-design/icons"
import Link from "next/link"
import Image from "next/image"
import { withBasePath, getApiUrl } from "@/utils/paths"
import type { ColumnsType } from "antd/es/table"

interface AdminProduct {
  id: string
  title: string
  slug: string
  price: number
  salePrice: number | null
  status: string
  moderationStatus: string
  featured: boolean
  downloads: number
  views: number
  rating: number
  createdAt: string
  updatedAt: string
  moderationNotes?: string | null
  thumbnail: string | null
  category: {
    id: string
    name: string
    slug: string
  } | null
  seller: {
    id: string
    name: string | null
    email: string
    username: string | null
    status: string
  } | null
}

interface AdminProductsResponse {
  products: AdminProduct[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  summary: {
    status: Record<string, number>
    moderation: Record<string, number>
    featured: number
  }
}

interface CategoryOption {
  id: string
  name: string
}

const STATUS_OPTIONS = [
  { label: "All Statuses", value: "" },
  { label: "Draft", value: "DRAFT" },
  { label: "Pending Review", value: "PENDING_REVIEW" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Suspended", value: "SUSPENDED" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Archived", value: "ARCHIVED" },
]

const MODERATION_OPTIONS = [
  { label: "All Moderation States", value: "" },
  { label: "Pending Review", value: "PENDING_REVIEW" },
  { label: "In Review", value: "IN_REVIEW" },
  { label: "Needs Revision", value: "NEEDS_REVISION" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Suspended", value: "SUSPENDED" },
]

const FEATURED_OPTIONS = [
  { label: "All", value: "" },
  { label: "Featured", value: "true" },
  { label: "Not Featured", value: "false" },
]

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Price (High - Low)", value: "price-high" },
  { label: "Price (Low - High)", value: "price-low" },
  { label: "Downloads", value: "downloads" },
  { label: "Views", value: "views" },
  { label: "Rating", value: "rating" },
]

function formatCurrency(amount: number) {
  return amount.toLocaleString("en-US", { style: "currency", currency: "USD" })
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString()
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

function toTitle(value: string) {
  return value
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ")
}

export default function AdminProductsManager() {
  const [data, setData] = useState<AdminProductsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState("")
  const [moderationFilter, setModerationFilter] = useState("")
  const [featuredFilter, setFeaturedFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [searchInput, setSearchInput] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [actingProduct, setActingProduct] = useState<string | null>(null)
  const [categories, setCategories] = useState<CategoryOption[]>([])

  const loadCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/categories")
      const json = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(json.error || "Failed to load categories")
      }
      if (Array.isArray(json.categories)) {
        setCategories(json.categories.map((category: any) => ({ id: category.id, name: category.name })))
      }
    } catch (_error) {
      setCategories([])
    }
  }, [])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError("")

      const params = new URLSearchParams()
      params.set("page", String(page))
      params.set("limit", "20")
      if (statusFilter) params.set("status", statusFilter)
      if (moderationFilter) params.set("moderationStatus", moderationFilter)
      if (featuredFilter) params.set("featured", featuredFilter)
      if (categoryFilter) params.set("category", categoryFilter)
      if (searchTerm) params.set("q", searchTerm)
      if (sortBy) params.set("sort", sortBy)

      const response = await fetch(`${getApiUrl("/api/admin/products")}?${params.toString()}`, {
        cache: "no-store",
        credentials: "include",
      })
      const json = await response.json()

      if (!response.ok) {
        throw new Error(json.error || "Failed to load products")
      }

      setData(json)
    } catch (err: any) {
      setError(err?.message || "Failed to load products")
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, moderationFilter, featuredFilter, categoryFilter, searchTerm, sortBy])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleSearch = useCallback(() => {
    setPage(1)
    setSearchTerm(searchInput.trim())
  }, [searchInput])

  const products = data?.products ?? []
  const pagination = data?.pagination

  const statusSummary = useMemo(() => {
    if (!data?.summary?.status) return []
    return Object.entries(data.summary.status).map(([key, count]) => ({ label: toTitle(key), count }))
  }, [data])

  const moderationSummary = useMemo(() => {
    if (!data?.summary?.moderation) return []
    return Object.entries(data.summary.moderation).map(([key, count]) => ({ label: toTitle(key), count }))
  }, [data])

  const handleProductUpdate = useCallback(
    async (productId: string, payload: Record<string, unknown>) => {
      try {
        setActingProduct(productId)
        setError("")

        const response = await fetch(`${getApiUrl(`/api/admin/products/${productId}`)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        })
        const json = await response.json().catch(() => ({}))
        if (!response.ok) {
          throw new Error(json.error || "Failed to update product")
        }
        await fetchProducts()
      } catch (err: any) {
        setError(err?.message || "Failed to update product")
      } finally {
        setActingProduct(null)
      }
    },
    [fetchProducts],
  )

  const toggleFeatured = useCallback(
    (product: AdminProduct) => {
      void handleProductUpdate(product.id, { featured: !product.featured })
    },
    [handleProductUpdate],
  )

  const publishProduct = useCallback(
    (product: AdminProduct) => {
      void handleProductUpdate(product.id, { status: "PUBLISHED" })
    },
    [handleProductUpdate],
  )

  const archiveProduct = useCallback(
    (product: AdminProduct) => {
      void handleProductUpdate(product.id, { status: "ARCHIVED" })
    },
    [handleProductUpdate],
  )

  const suspendProduct = useCallback(
    (product: AdminProduct) => {
      void handleProductUpdate(product.id, { status: "SUSPENDED" })
    },
    [handleProductUpdate],
  )

  const restoreProduct = useCallback(
    (product: AdminProduct) => {
      void handleProductUpdate(product.id, { status: "APPROVED" })
    },
    [handleProductUpdate],
  )

  const columns: ColumnsType<AdminProduct> = [
    {
      title: "Product",
      dataIndex: "title",
      key: "product",
      width: 300,
      render: (_, record) => (
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Image
            src={withBasePath(record.thumbnail || "/images/placeholder-thumb.png")}
            alt="Product thumbnail"
            width={64}
            height={64}
            style={{ objectFit: "cover", borderRadius: 4 }}
          />
          <div>
            <div>
              <Link href={`/single-product/${record.slug}`} style={{ fontWeight: 500, color: "#272b41" }}>
                {record.title}
              </Link>
            </div>
            <div style={{ fontSize: 12, color: "#868eae", marginTop: 4 }}>
              {record.category ? record.category.name : "Uncategorised"}
            </div>
            <div style={{ fontSize: 12, color: "#868eae" }}>Created {formatDate(record.createdAt)}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Seller",
      dataIndex: "seller",
      key: "seller",
      width: 200,
      render: (seller) =>
        seller ? (
          <div>
            <Link href={`/author?username=${seller.username || seller.id}`} style={{ fontWeight: 500 }}>
              {seller.name || seller.email}
            </Link>
            <div style={{ fontSize: 12, color: "#868eae", marginTop: 4 }}>{seller.email}</div>
          </div>
        ) : (
          <span style={{ color: "#868eae" }}>Unknown seller</span>
        ),
    },
    {
      title: "Pricing",
      dataIndex: "price",
      key: "pricing",
      width: 150,
      render: (price, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{formatCurrency(price)}</div>
          {record.salePrice != null && record.salePrice !== price && (
            <div style={{ fontSize: 12, color: "#868eae" }}>Sale: {formatCurrency(record.salePrice)}</div>
          )}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status, record) => (
        <div>
          {getStatusTag(status)}
          {record.featured && (
            <Tag color="blue" style={{ marginLeft: 4 }}>
              Featured
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Moderation",
      dataIndex: "moderationStatus",
      key: "moderation",
      width: 150,
      render: (status, record) => (
        <div>
          {getModerationTag(status)}
          {record.moderationNotes && (
            <div style={{ fontSize: 12, color: "#868eae", marginTop: 4 }}>{record.moderationNotes}</div>
          )}
        </div>
      ),
    },
    {
      title: "Performance",
      dataIndex: "downloads",
      key: "performance",
      width: 150,
      render: (_, record) => (
        <div style={{ fontSize: 12 }}>
          <div>
            <span style={{ color: "#868eae" }}>Downloads: </span>
            <span style={{ fontWeight: 500 }}>{record.downloads}</span>
          </div>
          <div>
            <span style={{ color: "#868eae" }}>Views: </span>
            <span style={{ fontWeight: 500 }}>{record.views}</span>
          </div>
          <div>
            <span style={{ color: "#868eae" }}>Rating: </span>
            <span style={{ fontWeight: 500 }}>{record.rating.toFixed(1)}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 250,
      fixed: "right",
      render: (_, record) => {
        const acting = actingProduct === record.id
        return (
          <Space size="small" wrap>
            <Button size="small" disabled={acting} onClick={() => toggleFeatured(record)}>
              {record.featured ? "Unfeature" : "Feature"}
            </Button>
            {record.status === "PUBLISHED" ? (
              <Button size="small" disabled={acting} onClick={() => archiveProduct(record)}>
                Archive
              </Button>
            ) : (
              <Button size="small" type="primary" disabled={acting} onClick={() => publishProduct(record)}>
                Publish
              </Button>
            )}
            {record.status === "SUSPENDED" ? (
              <Button size="small" disabled={acting} onClick={() => restoreProduct(record)}>
                Restore
              </Button>
            ) : (
              <Button size="small" danger disabled={acting} onClick={() => suspendProduct(record)}>
                Suspend
              </Button>
            )}
            <Link href={`/dashboard/edit-item?id=${record.id}`}>
              <Button size="small">Edit</Button>
            </Link>
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
                {STATUS_OPTIONS.map((option) => (
                  <Select.Option key={option.value || "all"} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>

              <Select
                style={{ width: 180 }}
                value={moderationFilter}
                onChange={(value) => {
                  setPage(1)
                  setModerationFilter(value)
                }}
                placeholder="Moderation"
                allowClear
              >
                {MODERATION_OPTIONS.map((option) => (
                  <Select.Option key={option.value || "all"} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>

              <Select
                style={{ width: 150 }}
                value={featuredFilter}
                onChange={(value) => {
                  setPage(1)
                  setFeaturedFilter(value)
                }}
                placeholder="Featured"
                allowClear
              >
                {FEATURED_OPTIONS.map((option) => (
                  <Select.Option key={option.value || "all"} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>

              <Select
                style={{ width: 180 }}
                value={categoryFilter}
                onChange={(value) => {
                  setPage(1)
                  setCategoryFilter(value)
                }}
                placeholder="Category"
                allowClear
              >
                <Select.Option value="">All Categories</Select.Option>
                {categories.map((category) => (
                  <Select.Option key={category.id} value={category.id}>
                    {category.name}
                  </Select.Option>
                ))}
              </Select>

              <Select
                style={{ width: 180 }}
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

              <Space.Compact>
                <Input
                  style={{ width: 200 }}
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
              {loading ? "Loading…" : `${pagination?.total ?? 0} products`}
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
            {typeof data?.summary?.featured === "number" && (
              <Tag color="purple">Featured: {data.summary.featured}</Tag>
            )}
            {moderationSummary.map((chip) => (
              <Tag key={chip.label} color="orange">
                {chip.label}: {chip.count}
              </Tag>
            ))}
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
                // You can add limit state if needed
              }}
            />
          </div>
        )}
      </Card>
    </div>
  )
}
