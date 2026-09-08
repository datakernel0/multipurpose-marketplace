"use client"

import { useEffect, useMemo, useState } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import Breadcrumb from "@/components/common/Breadcrumb"
import CallToActionSection from "@/components/sections/CallToActionSection"
import CustomerMenu from "@/components/customer/CustomerMenu"
import Link from "next/link"
import { getApiUrl } from "@/utils/paths"

interface PurchaseItem {
  id: string
  quantity: number
  price: number
  product: {
    id: string
    title: string
    slug: string
    image: string | null
  } | null
}

interface PurchaseOrder {
  id: string
  createdAt: string
  totalAmount: number
  paymentMethod: string | null
  paymentStatus: string | null
  items: PurchaseItem[]
}

export default function CustomerDashboardPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

  const formatCurrency = useMemo(
    () => (value: number) => value.toLocaleString("en-US", { style: "currency", currency: "USD" }),
    [],
  )

  useEffect(() => {
    const controller = new AbortController()

    const loadOrders = async () => {
      try {
        setLoading(true)
        setError("")

        const response = await fetch(getApiUrl("/api/customer/orders"), {
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        })

        const data = await response.json().catch(() => ({}))

        if (!response.ok) {
          throw new Error(data?.error || "Failed to load purchase history")
        }

        setOrders(Array.isArray(data.orders) ? data.orders : [])
      } catch (err: any) {
        if (err?.name === "AbortError") return
        setError(err?.message || "Failed to load customer dashboard.")
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    void loadOrders()

    return () => controller.abort()
  }, [])

  return (
    <div className="preload customer-dashboard-page">
      <Preloader />
      <Header />
      <Breadcrumb
        pageTitle="Customer Dashboard"
        paths={[
          { name: "Dashboard", link: "/dashboard/customer" },
          { name: "Customer Dashboard", link: "/dashboard/customer" },
        ]}
      />
      <section className="dashboard-area dashboard_purchase">
        <CustomerMenu />

        <div className="dashboard_contents">
          <div className="container">
            {loading ? (
              <div className="text-center" style={{ padding: "40px 0" }}>
                <p>Loading purchase history…</p>
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
                        <h3>Purchase History</h3>
                      </div>
                      <div className="table-responsive">
                        <table className="table withdraw__table">
                          <thead>
                            <tr>
                              <th>Order</th>
                              <th>Date</th>
                              <th>Items</th>
                              <th>Total</th>
                              <th>Status</th>
                              <th>Details</th>
                            </tr>
                          </thead>

                          <tbody>
                            {orders.length === 0 ? (
                              <tr>
                                <td colSpan={6} style={{ textAlign: "center", padding: "25px 0" }}>
                                  You haven’t purchased anything yet.
                                </td>
                              </tr>
                            ) : (
                              orders.map((order) => {
                                const orderDate = new Date(order.createdAt)
                                const itemCount = order.items.reduce((sum, item) => sum + (item.quantity || 0), 0)
                                return (
                                  <tr key={order.id}>
                                    <td>#{order.id.slice(0, 8)}</td>
                                    <td>{orderDate.toLocaleDateString()}</td>
                                    <td>{itemCount}</td>
                                    <td className="bold">{formatCurrency(order.totalAmount)}</td>
                                    <td>{order.paymentStatus || "Paid"}</td>
                                    <td className="bold">
                                      <Link href={`/customer/downloads?order=${order.id}`}>
                                        View details & downloads
                                      </Link>
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

