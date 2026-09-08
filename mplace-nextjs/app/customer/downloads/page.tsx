"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import Breadcrumb from "@/components/common/Breadcrumb"
import CallToActionSection from "@/components/sections/CallToActionSection"
import CustomerMenu from "@/components/customer/CustomerMenu"
import Link from "next/link"
import { getApiUrl } from "@/utils/paths"

interface DownloadItem {
  id: string
  orderId: string
  createdAt: string | null
  totalAmount: number
  quantity: number
  price: number
  product: {
    id: string
    title: string
    slug: string
    downloadUrl: string | null
    image: string | null
  } | null
}

function CustomerDownloadsPageInner() {
  const [downloads, setDownloads] = useState<DownloadItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const searchParams = useSearchParams()

  const orderFilter = searchParams?.get("order") || undefined

  const formatCurrency = useMemo(
    () => (value: number) => value.toLocaleString("en-US", { style: "currency", currency: "USD" }),
    [],
  )

  useEffect(() => {
    const controller = new AbortController()
    const loadDownloads = async () => {
      try {
        setLoading(true)
        setError("")

        const apiPath = orderFilter ? `/api/customer/downloads?order=${encodeURIComponent(orderFilter)}` : "/api/customer/downloads"
        const response = await fetch(getApiUrl(apiPath), {
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        })

        const data = await response.json().catch(() => ({}))

        if (!response.ok) {
          throw new Error(data?.error || "Failed to load downloads")
        }

        setDownloads(Array.isArray(data.downloads) ? data.downloads : [])
      } catch (err: any) {
        if (err?.name === "AbortError") return
        setError(err?.message || "Failed to load downloads")
        setDownloads([])
      } finally {
        setLoading(false)
      }
    }

    void loadDownloads()

    return () => controller.abort()
  }, [orderFilter])

  return (
    <div className="preload customer-downloads-page">
      <Preloader />
      <Header />
      <Breadcrumb
        pageTitle="Customer Downloads"
        paths={[
          { name: "Dashboard", link: "/dashboard/customer" },
          { name: "Customer Downloads", link: "/customer/downloads" },
        ]}
      />
      <section className="dashboard-area dashboard_purchase">
        <CustomerMenu />

        <div className="dashboard_contents">
          <div className="container">
            {loading ? (
              <div className="text-center" style={{ padding: "40px 0" }}>
                <p>Loading your downloads…</p>
              </div>
            ) : error ? (
              <div className="alert alert-warning" role="alert" style={{ maxWidth: 600, margin: "30px auto" }}>
                {error}
              </div>
            ) : (
              <div className="row">
                <div className="col-md-12">
                  <div className="modules__content">
                    <div className="table_module">
                      <div className="table_header">
                        <h3>Downloads</h3>
                      </div>
                      <div className="table-responsive">
                        <table className="table withdraw__table">
                          <thead>
                            <tr>
                              <th>Product</th>
                              <th>Order</th>
                              <th>Date</th>
                              <th>Price</th>
                              <th>Download</th>
                            </tr>
                          </thead>

                          <tbody>
                            {downloads.length === 0 ? (
                              <tr>
                                <td colSpan={5} style={{ textAlign: "center", padding: "25px 0" }}>
                                  No downloadable purchases yet.
                                </td>
                              </tr>
                            ) : (
                              downloads.map((download) => {
                                const orderDate = download.createdAt ? new Date(download.createdAt) : null
                                const productTitle = download.product?.title || "Unknown product"
                                const productDownloadUrl = download.product?.downloadUrl || ""
                                const downloadHref = productDownloadUrl
                                  ? productDownloadUrl.startsWith("http://") || productDownloadUrl.startsWith("https://")
                                    ? productDownloadUrl
                                    : getApiUrl(productDownloadUrl)
                                  : download.product?.slug
                                  ? `/single-product/${download.product.slug}`
                                  : "#"

                                return (
                                  <tr key={download.id}>
                                    <td>
                                      {download.product?.slug ? (
                                        <Link href={`/single-product/${download.product.slug}`}>{productTitle}</Link>
                                      ) : (
                                        productTitle
                                      )}
                                    </td>
                                    <td>#{download.orderId.slice(0, 8)}</td>
                                    <td>{orderDate ? orderDate.toLocaleDateString() : "—"}</td>
                                    <td>{formatCurrency(download.price || 0)}</td>
                                    <td className="bold">
                                      {download.product?.downloadUrl ? (
                                        <a href={downloadHref} download target="_blank" rel="noopener noreferrer">
                                          Download files
                                        </a>
                                      ) : (
                                        <span style={{ color: "#888" }}>Unavailable</span>
                                      )}
                                    </td>
                                  </tr>
                                )
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      <CallToActionSection />
      <Footer />
      <ScrollToTop />
    </div>
  )
}

export default function CustomerDownloadsPage() {
  return (
    <Suspense
      fallback={
        <div className="preload customer-downloads-page">
          <Preloader />
          <Header />
          <ScrollToTop />
        </div>
      }
    >
      <CustomerDownloadsPageInner />
    </Suspense>
  )
}

