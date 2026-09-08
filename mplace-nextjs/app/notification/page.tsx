import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import Breadcrumb from "@/components/common/Breadcrumb"
import NotificationListClient, { ApiNotification } from "@/components/notification/NotificationListClient"
import Link from "next/link"
import { headers } from "next/headers"

const PAGE_SIZE = 12

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000"
}

function buildNotificationLink(page: number) {
  if (page <= 1) {
    return "/notification"
  }
  return `/notification?page=${page}`
}

async function fetchNotifications(page: number): Promise<{
  notifications: ApiNotification[]
  totalPages: number
  error?: string
}> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: PAGE_SIZE.toString(),
  })

  const apiUrl = `${getSiteUrl()}${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/notifications?${params.toString()}`
  const headerList = await headers()
  const cookieHeader = typeof headerList?.get === "function" ? headerList.get("cookie") || "" : ""

  try {
    const response = await fetch(apiUrl, {
      cache: "no-store",
      headers: cookieHeader ? { cookie: cookieHeader } : undefined,
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      const message = data?.error || `Failed to load notifications (${response.status})`
      return { notifications: [], totalPages: 1, error: message }
    }

    const notifications: ApiNotification[] = Array.isArray(data.notifications) ? data.notifications : []
    const totalPages = Number.isFinite(data.pagination?.totalPages) ? Number(data.pagination.totalPages) : 1

    return {
      notifications,
      totalPages: Math.max(1, totalPages),
    }
  } catch (error) {
    return { notifications: [], totalPages: 1, error: "Unable to load notifications." }
  }
}

export const dynamic = "force-dynamic"

export default async function NotificationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolvedSearchParams = await searchParams
  const pageParam = resolvedSearchParams?.page
  const currentPage = Math.max(1, Number.parseInt(Array.isArray(pageParam) ? pageParam[0] : pageParam || "1", 10) || 1)

  const { notifications, totalPages, error } = await fetchNotifications(currentPage)

  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)
  const prevLink = currentPage > 1 ? buildNotificationLink(currentPage - 1) : null
  const nextLink = currentPage < totalPages ? buildNotificationLink(currentPage + 1) : null

  return (
    <div className="preload notification-page">
      <Preloader />
      <Header />
      <Breadcrumb pageTitle="All Notifications" paths={[{ name: "Notifications", link: "/notification" }]} />

      <section className="dashboard-area">
        <div className="dashboard_contents">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="dashboard_title_area">
                  <div className="dashboard__title">
                    <h3>Your Notifications</h3>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12">
                <div className="cardify notifications_module">
                  {error ? (
                    <div className="text-center" style={{ padding: "60px 0" }}>
                      <p>{error}</p>
                    </div>
                  ) : (
                    <NotificationListClient initialNotifications={notifications} />
                  )}

                  {!error && totalPages > 1 && (
                    <div className="pagination-area pagination-area2">
                      <nav className="navigation pagination" role="navigation">
                        <div className="nav-links">
                          {prevLink ? (
                            <Link className="prev page-numbers" href={prevLink} prefetch={false}>
                              <span className="lnr lnr-arrow-left"></span>
                            </Link>
                          ) : (
                            <span className="prev page-numbers disabled">
                              <span className="lnr lnr-arrow-left"></span>
                            </span>
                          )}
                          {pageNumbers.map((pageNumber) => (
                            pageNumber === currentPage ? (
                              <span key={`page-${pageNumber}`} className="page-numbers current">
                                {pageNumber}
                              </span>
                            ) : (
                              <Link
                                key={`page-${pageNumber}`}
                                className="page-numbers"
                                href={buildNotificationLink(pageNumber)}
                                prefetch={false}
                              >
                                {pageNumber}
                              </Link>
                            )
                          ))}
                          {nextLink ? (
                            <Link className="next page-numbers" href={nextLink} prefetch={false}>
                              <span className="lnr lnr-arrow-right"></span>
                            </Link>
                          ) : (
                            <span className="next page-numbers disabled">
                              <span className="lnr lnr-arrow-right"></span>
                            </span>
                          )}
                        </div>
                      </nav>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <ScrollToTop />
    </div>
  )
}

