"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import AdminPageHeader from "./AdminPageHeader"
import { Card, Row, Col, Spin, Alert, Table, Tag, Statistic } from "antd"
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import { Line, Bar } from "react-chartjs-2"
import { withBasePath, getApiUrl } from "@/utils/paths"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler)

interface RevenueSeriesPoint {
  date: string
  amount: number
}

interface SellersSeriesPoint {
  date: string
  count: number
}

interface ModerationSeriesPoint {
  date: string
  approved: number
  rejected: number
  flagged: number
  suspended: number
}

interface DashboardSummaryResponse {
  metrics: {
    products: {
      pending: number
      needsRevision: number
      published: number
    }
    sellers: {
      awaitingReview: number
      suspended: number
    }
    customers: number
    revenue: {
      total: number
      last30Days: number
    }
  }
  moderation: {
    queueSize: number
    flaggedLast7Days: number
  }
  timeseries: {
    revenue: {
      last30Days: RevenueSeriesPoint[]
    }
    sellers: {
      last30Days: SellersSeriesPoint[]
    }
    moderationActions: {
      last30Days: ModerationSeriesPoint[]
    }
  }
  generatedAt: string
}

interface NewsletterSubscriber {
  id: string
  email: string
  name: string | null
  subscribed: boolean
  createdAt: string
  updatedAt: string
}

interface NewsletterResponse {
  subscribers: NewsletterSubscriber[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  summary: {
    recentSevenDays: number
  }
  generatedAt: string
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

const numberFormatter = new Intl.NumberFormat("en-US")

function formatShortDate(input: string) {
  const date = new Date(input)
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

function formatRelativeTime(isoDate: string) {
  const updatedAt = new Date(isoDate)
  const now = new Date()
  const diffMs = now.getTime() - updatedAt.getTime()
  const diffMinutes = Math.round(diffMs / (60 * 1000))

  if (diffMinutes < 1) return "Just now"
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`
  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`
  const diffDays = Math.round(diffHours / 24)
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`
}

function formatLongDate(isoDate: string) {
  const date = new Date(isoDate)
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export default function AdminDashboardOverview() {
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [newsletter, setNewsletter] = useState<NewsletterResponse | null>(null)
  const [newsletterLoading, setNewsletterLoading] = useState(true)
  const [newsletterError, setNewsletterError] = useState<string>("")

  useEffect(() => {
    let isMounted = true

    const loadSummary = async () => {
      try {
        setLoading(true)
        setError("")
        const response = await fetch(getApiUrl("/api/admin/dashboard/summary"), { cache: "no-store", credentials: "include" })
        const json = await response.json()
        if (!response.ok) {
          throw new Error(json.error || "Failed to load dashboard summary")
        }
        if (isMounted) {
          setSummary(json)
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load dashboard summary")
        if (isMounted) {
          setSummary(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    const loadNewsletter = async () => {
      try {
        setNewsletterLoading(true)
        setNewsletterError("")
        const response = await fetch(`${getApiUrl("/api/admin/newsletter")}?limit=50`, { cache: "no-store", credentials: "include" })
        const json = await response.json()
        if (!response.ok) {
          throw new Error(json.error || "Failed to load newsletter subscribers")
        }
        if (isMounted) {
          setNewsletter(json)
        }
      } catch (err: any) {
        if (isMounted) {
          setNewsletterError(err?.message || "Failed to load newsletter subscribers")
          setNewsletter(null)
        }
      } finally {
        if (isMounted) {
          setNewsletterLoading(false)
        }
      }
    }

    loadSummary()
    loadNewsletter()

    return () => {
      isMounted = false
    }
  }, [])

  const revenueSeries = summary?.timeseries.revenue.last30Days ?? []
  const sellersSeries = summary?.timeseries.sellers.last30Days ?? []
  const moderationSeries = summary?.timeseries.moderationActions.last30Days ?? []
  const newsletterSubscribers = newsletter?.subscribers ?? []
  const totalNewsletter = newsletter?.pagination.total ?? 0
  const recentNewsletter = newsletter?.summary.recentSevenDays ?? 0

  const revenueChartData = useMemo(() => {
    const labels = revenueSeries.map((point) => formatShortDate(point.date))
    return {
      labels,
      datasets: [
        {
          label: "Revenue",
          data: revenueSeries.map((point) => point.amount),
          borderColor: "#0674ec",
          backgroundColor: "rgba(6, 116, 236, 0.12)",
          pointBackgroundColor: "#0674ec",
          pointBorderColor: "#fff",
          fill: true,
          tension: 0.3,
        },
      ],
    }
  }, [revenueSeries])

  const revenueChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: "#6c7a91",
            callback: (value: any) => `$${value}`,
          },
          grid: {
            color: "rgba(15, 23, 42, 0.06)",
          },
        },
        x: {
          ticks: { color: "#6c7a91" },
          grid: { display: false },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context: any) => currencyFormatter.format(context.parsed.y || 0),
          },
        },
      },
    }),
    []
  )

  const sellerChartData = useMemo(() => {
    const labels = sellersSeries.map((point) => formatShortDate(point.date))
    return {
      labels,
      datasets: [
        {
          label: "New Sellers",
          data: sellersSeries.map((point) => point.count),
          backgroundColor: "rgba(98, 208, 58, 0.6)",
          borderRadius: 6,
        },
      ],
    }
  }, [sellersSeries])

  const sellerChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: "#6c7a91", precision: 0 },
          grid: {
            color: "rgba(15, 23, 42, 0.06)",
          },
        },
        x: {
          ticks: { color: "#6c7a91" },
          grid: { display: false },
        },
      },
      plugins: {
        legend: { display: false },
      },
    }),
    []
  )

  const moderationChartData = useMemo(() => {
    const labels = moderationSeries.map((point) => formatShortDate(point.date))
    return {
      labels,
      datasets: [
        {
          label: "Approved",
          data: moderationSeries.map((point) => point.approved),
          backgroundColor: "rgba(6, 116, 236, 0.6)",
          stack: "moderation",
          borderRadius: 6,
        },
        {
          label: "Rejected",
          data: moderationSeries.map((point) => point.rejected),
          backgroundColor: "rgba(227, 74, 51, 0.7)",
          stack: "moderation",
          borderRadius: 6,
        },
        {
          label: "Flagged",
          data: moderationSeries.map((point) => point.flagged),
          backgroundColor: "rgba(247, 181, 0, 0.8)",
          stack: "moderation",
          borderRadius: 6,
        },
        {
          label: "Suspended",
          data: moderationSeries.map((point) => point.suspended),
          backgroundColor: "rgba(115, 71, 193, 0.7)",
          stack: "moderation",
          borderRadius: 6,
        },
      ],
    }
  }, [moderationSeries])

  const moderationChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: "#6c7a91", precision: 0 },
          grid: {
            color: "rgba(15, 23, 42, 0.06)",
          },
        },
        x: {
          ticks: { color: "#6c7a91" },
          grid: { display: false },
          stacked: true,
        },
      },
      plugins: {
        legend: {
          position: "bottom" as const,
          labels: { color: "#424b5f" },
        },
      },
    }),
    []
  )

  const newsletterColumns = [
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email: string) => <div style={{ fontWeight: 500 }}>{email}</div>,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name: string | null) => <span style={{ color: "#868eae" }}>{name || "—"}</span>,
    },
    {
      title: "Joined",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt: string) => <span style={{ color: "#868eae" }}>{formatLongDate(createdAt)}</span>,
    },
    {
      title: "Status",
      dataIndex: "subscribed",
      key: "subscribed",
      render: (subscribed: boolean) => (
        <Tag color={subscribed ? "success" : "default"}>{subscribed ? "Subscribed" : "Unsubscribed"}</Tag>
      ),
    },
  ]

  return (
    <div style={{ padding: "30px", background: "#f4f5f7", minHeight: "calc(100vh - 64px)" }}>
      <AdminPageHeader
        title="Platform Overview"
        subTitle="Realtime performance snapshots for marketplace leadership"
        routes={[
          { breadcrumbName: "Home", path: "/admin" },
          { breadcrumbName: "Overview", path: "/admin" },
        ]}
      />

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          closable
          style={{ marginBottom: 24 }}
        />
      )}

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
          <Spin size="large" />
        </div>
      ) : summary ? (
        <>
          {/* Stats Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Pending Reviews"
                  value={summary.metrics.products.pending}
                  styles={{ content: { color: "#faad14" } }}
                  prefix={<ArrowUpOutlined />}
                />
                <div style={{ marginTop: 8 }}>
                  <Link href={withBasePath("/admin/moderation")} style={{ fontSize: 14 }}>
                    View details →
                  </Link>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Awaiting Seller Approvals"
                  value={summary.metrics.sellers.awaitingReview}
                  styles={{ content: { color: "#1890ff" } }}
                  prefix={<ArrowUpOutlined />}
                />
                <div style={{ marginTop: 8 }}>
                  <Link href={withBasePath("/admin/sellers")} style={{ fontSize: 14 }}>
                    View details →
                  </Link>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Flagged This Week"
                  value={summary.moderation.flaggedLast7Days}
                  styles={{ content: { color: "#ff4d4f" } }}
                  prefix={<ArrowUpOutlined />}
                />
                <div style={{ marginTop: 8 }}>
                  <Link href={withBasePath("/admin/moderation")} style={{ fontSize: 14 }}>
                    View details →
                  </Link>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="30-Day Revenue"
                  value={summary.metrics.revenue.last30Days || 0}
                  prefix="$"
                  styles={{ content: { color: "#52c41a" } }}
                />
                <div style={{ marginTop: 8 }}>
                  <Link href={withBasePath("/admin/reports")} style={{ fontSize: 14 }}>
                    View details →
                  </Link>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Charts */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} lg={12}>
              <Card
                title={
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 500 }}>Revenue Last 30 Days</div>
                    <div style={{ fontSize: 14, color: "#868eae", marginTop: 4 }}>
                      Total: {currencyFormatter.format(summary.metrics.revenue.last30Days || 0)}
                    </div>
                  </div>
                }
                style={{ height: "100%" }}
              >
                <div style={{ height: 300 }}>
                  {revenueSeries.length > 0 ? (
                    <Line data={revenueChartData} options={revenueChartOptions} />
                  ) : (
                    <div style={{ textAlign: "center", padding: 40, color: "#868eae" }}>No revenue data available</div>
                  )}
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card
                title={
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 500 }}>New Sellers</div>
                    <div style={{ fontSize: 14, color: "#868eae", marginTop: 4 }}>
                      {numberFormatter.format(summary.metrics.sellers.awaitingReview + summary.metrics.sellers.suspended)} current in pipeline
                    </div>
                  </div>
                }
                style={{ height: "100%" }}
              >
                <div style={{ height: 300 }}>
                  {sellersSeries.length > 0 ? (
                    <Bar data={sellerChartData} options={sellerChartOptions} />
                  ) : (
                    <div style={{ textAlign: "center", padding: 40, color: "#868eae" }}>No seller intake data available</div>
                  )}
                </div>
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24}>
              <Card
                title={
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 500 }}>Moderation Outcomes</div>
                    <div style={{ fontSize: 14, color: "#868eae", marginTop: 4 }}>Decisions captured across the last month</div>
                  </div>
                }
              >
                <div style={{ height: 300 }}>
                  {moderationSeries.length > 0 ? (
                    <Bar data={moderationChartData} options={moderationChartOptions} />
                  ) : (
                    <div style={{ textAlign: "center", padding: 40, color: "#868eae" }}>No moderation activity recorded</div>
                  )}
                </div>
              </Card>
            </Col>
          </Row>

          {/* Newsletter Subscribers */}
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Card
                title={
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 500 }}>Newsletter Subscribers</div>
                    <div style={{ fontSize: 14, color: "#868eae", marginTop: 4 }}>
                      {numberFormatter.format(totalNewsletter)} total • {numberFormatter.format(recentNewsletter)} new this week
                      {newsletter && ` • Updated ${formatRelativeTime(newsletter.generatedAt)}`}
                    </div>
                  </div>
                }
              >
                {newsletterError && (
                  <Alert
                    message="Error"
                    description={newsletterError}
                    type="error"
                    showIcon
                    closable
                    style={{ marginBottom: 16 }}
                  />
                )}

                {newsletterLoading ? (
                  <div style={{ textAlign: "center", padding: 40 }}>
                    <Spin />
                  </div>
                ) : newsletterSubscribers.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 40, color: "#868eae" }}>No newsletter subscribers yet.</div>
                ) : (
                  <Table
                    columns={newsletterColumns}
                    dataSource={newsletterSubscribers}
                    rowKey="id"
                    pagination={false}
                    size="small"
                  />
                )}
              </Card>
            </Col>
          </Row>
        </>
      ) : (
        <Card>
          <div style={{ textAlign: "center", padding: 40, color: "#868eae" }}>No dashboard metrics available.</div>
        </Card>
      )}
    </div>
  )
}
