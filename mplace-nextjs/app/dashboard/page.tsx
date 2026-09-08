"use client"

import { useEffect, useRef, useState } from "react"
import { useSession } from "next-auth/react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import Breadcrumb from "@/components/common/Breadcrumb"
import DashboardMenu from "@/components/dashboard/DashboardMenu"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import { Line, Bar, Doughnut } from "react-chartjs-2"
import Image from "next/image"
import Link from "next/link"
import { withBasePath, getApiUrl } from "@/utils/paths"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler)

interface DashboardStats {
  totalItems: number
  monthlySales: number
  monthlySalesAmount: number
  yearlySales: number
  yearlySalesAmount: number
  lifetimeSales: number
  lifetimeSalesAmount: number
  monthlyViews: number
  monthlyEarnings: number
  totalSalesThisMonth: number
  totalEarningsThisMonth: number
  totalViewsThisMonth: number
}

interface RecentSale {
  id: string
  title: string
  slug: string
  image: string
  category: {
    name: string
    icon: string
  }
  price: number
  date: string
}

interface RecentBuyer {
  id: string
  name: string
  image: string
  country: string
  totalSpent: number
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [recentSales, setRecentSales] = useState<RecentSale[]>([])
  const [recentBuyers, setRecentBuyers] = useState<RecentBuyer[]>([])
  const [dailyData, setDailyData] = useState<Array<{ day: number; views: number; sales: number }>>([])
  const [activeChartTab, setActiveChartTab] = useState<"visit_source" | "referrals">("visit_source")

  const pieChartRef = useRef<ChartJS<"doughnut">>(null)
  const singleItemVisitRef = useRef<ChartJS<"bar">>(null)
  const revenueRef = useRef<ChartJS<"line">>(null)

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        if (session?.user) {
          const response = await fetch(getApiUrl("/api/dashboard/stats"))
          if (response.ok) {
            const data = await response.json()
            setStats(data.stats)
            setRecentSales(data.recentSales || [])
            setRecentBuyers(data.recentBuyers || [])
            setDailyData(data.charts?.dailyData || [])
          } else {
            throw new Error("Dashboard data is unavailable right now.")
          }
        } else {
          setStats(null)
          setRecentSales([])
          setRecentBuyers([])
          setDailyData([])
        }
      } catch (error) {
        setError("Failed to load dashboard data.")
        setLoading(false)
      } finally {
        setLoading(false)
      }
    }

    if (status !== "loading") {
      fetchDashboardStats()
    }
  }, [session, status])

  // Sales and Views Statistics Line Chart
  const salesViewsData = {
    labels: dailyData.length > 0 
      ? dailyData.map((d) => d.day)
      : [],
    datasets: [
      {
        label: "Daily Views",
        backgroundColor: "rgba(115, 71, 193, 0.5)",
        borderColor: "#7347c1",
        data: dailyData.length > 0
          ? dailyData.map((d) => d.views)
          : [],
        pointBackgroundColor: "#7347c1",
        pointBorderColor: "#fff",
        fill: true,
      },
      {
        label: "Daily Sale",
        backgroundColor: "rgba(5, 116, 236, 0.5)",
        borderColor: "#0674ec",
        data: dailyData.length > 0
          ? dailyData.map((d) => d.sales)
          : [],
        pointBackgroundColor: "#0674ec",
        pointBorderColor: "#fff",
        fill: true,
      },
    ],
  }

  const salesViewsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: 40,
        ticks: { color: "#8896a5" },
      },
      x: {
        ticks: { color: "#8896a5" },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  }

  // Pie Chart Data
  const pieChartData = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [],
        borderWidth: 0,
      },
    ],
  }

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
  }

  // Single Item Visitors Bar Chart
  const singleItemVisitData = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: "#0674ec",
      },
    ],
  }

  const singleItemVisitOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: 60,
        ticks: { color: "#8896a5" },
      },
      x: {
        ticks: { color: "#8896a5" },
        barThickness: 40,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  }

  // Revenue Line Chart
  const revenueData = {
    labels: [],
    datasets: [
      {
        label: "2015",
        data: [],
        fill: false,
        borderColor: "#7347c1",
        tension: 0,
        pointBorderColor: "#7347c1",
        pointBackgroundColor: "#fff",
        pointBorderWidth: 3,
      },
      {
        label: "2016",
        data: [],
        fill: false,
        borderColor: "#0674ec",
        tension: 0,
        pointBorderColor: "#0674ec",
        pointBackgroundColor: "#fff",
        pointBorderWidth: 3,
      },
      {
        label: "2019",
        data: [],
        fill: false,
        borderColor: "#62d03a",
        tension: 0,
        pointBorderColor: "#62d03a",
        pointBackgroundColor: "#fff",
        pointBorderWidth: 3,
      },
    ],
  }

  const revenueOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: "#8896a5" },
      },
      x: {
        ticks: { color: "#8896a5" },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  }

  return (
    <div className="preload dashboard-page has_chart">
      <Preloader />
      <Header />
      <Breadcrumb pageTitle="Author's Dashboard" paths={[{ name: "Dashboard", link: "/dashboard" }]} />

      <section className="dashboard-area">
        <DashboardMenu />

        <div className="dashboard_contents">
          <div className="container">
            <div className="row">
              <div className="col-lg-3 col-md-6">
                <div className="author-info author-info--dashboard mcolorbg4">
                  <p>Total Items</p>
                  <h3>{loading ? "..." : stats?.totalItems.toLocaleString()}</h3>
                </div>
              </div>

              <div className="col-lg-3 col-md-6">
                <div className="author-info author-info--dashboard mcolorbg2">
                  <p>Monthly Sales</p>
                  <h3>${loading ? "..." : stats?.monthlySalesAmount.toFixed(2)}</h3>
                </div>
              </div>

              <div className="col-lg-3 col-md-6">
                <div className="author-info author-info--dashboard mcolorbg3">
                  <p>Yearly Sales</p>
                  <h3>${loading ? "..." : stats?.yearlySalesAmount.toFixed(2)}</h3>
                </div>
              </div>

              <div className="col-lg-3 col-md-6">
                <div className="author-info author-info--dashboard mcolorbg1">
                  <p>Lifetime Sales</p>
                  <h3>${loading ? "..." : stats?.lifetimeSalesAmount.toFixed(2)}</h3>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-lg-12">
                <div className="dashboard_module statistics_module">
                  <div className="dashboard__title">
                    <h4>Sales and Views Statistics</h4>

                    <div className="pull-right">
                      <div id="stat_legend" className="legend"></div>
                      <div className="select-wrap">
                        <select name="mon" className="period_selector">
                          <option value="jan">Jan</option>
                          <option value="feb">Feb</option>
                          <option value="mar">Mar</option>
                        </select>
                        <span className="lnr lnr-chevron-down"></span>
                      </div>
                    </div>
                  </div>

                  <div className="dashboard__content">
                    <div style={{ height: "300px", position: "relative" }}>
                      <Line data={salesViewsData} options={salesViewsOptions} />
                    </div>

                    <div className="statistics_data">
                      <div className="row">
                        <div className="col-md-4 col-sm-4">
                          <div className="single_stat_data">
                            <h4 className="single_stat__title">
                              {loading ? "..." : stats?.totalSalesThisMonth.toLocaleString()}
                            </h4>
                            <p>
                              Total <span>Sales</span> This Month
                            </p>
                          </div>
                        </div>
                        <div className="col-md-4 text-center col-sm-4">
                          <div className="single_stat_data">
                            <h4 className="single_stat__title">
                              ${loading ? "..." : stats?.totalEarningsThisMonth.toLocaleString()}
                            </h4>
                            <p>
                              Total <span>Earnings</span> This Month
                            </p>
                          </div>
                        </div>
                        <div className="col-md-4 text-right col-sm-4">
                          <div className="single_stat_data">
                            <h4 className="single_stat__title">
                              {loading ? "..." : stats?.totalViewsThisMonth.toLocaleString()}
                            </h4>
                            <p>
                              Total <span>Views</span> This Month
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="dashboard_module chart country_statistics">
                  <div className="dashboard__title">
                    <h4>Country Statistics</h4>
                    <div className="select-wrap">
                      <select name="months" className="period_selector">
                        <option value="jan">Jan</option>
                        <option value="feb">Feb</option>
                        <option value="mar">Mar</option>
                      </select>
                      <span className="lnr lnr-chevron-down"></span>
                    </div>
                  </div>

                  <div className="dashboard__content">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Country</th>
                          <th>Visitors</th>
                          <th>Sales</th>
                        </tr>
                      </thead>

                      <tbody>
                        <tr>
                          <td>
                            <div className="country_flag">
                              <Image src={withBasePath("/images/flam.jpg")} alt="Country Flag" width={40} height={40} />
                            </div>
                            <span>United States</span>
                          </td>
                          <td>546</td>
                          <td>$230</td>
                        </tr>

                        <tr>
                          <td>
                            <div className="country_flag">
                              <Image src={withBasePath("/images/flg2.png")} alt="Country Flag" width={40} height={40} />
                            </div>
                            <span>United Kingdom</span>
                          </td>
                          <td>246</td>
                          <td>$80</td>
                        </tr>

                        <tr>
                          <td>
                            <div className="country_flag">
                              <Image src={withBasePath("/images/flg3.png")} alt="Country Flag" width={40} height={40} />
                            </div>
                            <span>Canada</span>
                          </td>
                          <td>170</td>
                          <td>$65</td>
                        </tr>

                        <tr>
                          <td>
                            <div className="country_flag">
                              <Image src={withBasePath("/images/flg4.png")} alt="Country Flag" width={40} height={40} />
                            </div>
                            <span>Newzland</span>
                          </td>
                          <td>78</td>
                          <td>$24</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="dashboard_module visit_data">
                  <div className="dashboard__content">
                    <div className="chart_top">
                      <div className="v_refer">
                        <ul className="nav nav-tabs" role="tablist">
                          <li>
                            <button
                              type="button"
                              className={activeChartTab === "visit_source" ? "active" : ""}
                              aria-controls="visit_source"
                              role="tab"
                              aria-selected={activeChartTab === "visit_source"}
                              onClick={() => setActiveChartTab("visit_source")}
                            >
                              Visit Source
                            </button>
                          </li>
                          <li>
                            <button
                              type="button"
                              className={activeChartTab === "referrals" ? "active" : ""}
                              aria-controls="referrals"
                              role="tab"
                              aria-selected={activeChartTab === "referrals"}
                              onClick={() => setActiveChartTab("referrals")}
                            >
                              Referrals
                            </button>
                          </li>
                        </ul>
                        <div className="select-wrap">
                          <select name="month" className="period_selector">
                            <option value="jan">Jan</option>
                            <option value="feb">Feb</option>
                            <option value="mar">Mar</option>
                          </select>
                          <span className="lnr lnr-chevron-down"></span>
                        </div>
                      </div>

                      <div className="charts">
                        <div className="tab-content">
                          {activeChartTab === "visit_source" && (
                            <div role="tabpanel" className="tab-pane fade show active" id="visit_source">
                              <div style={{ height: "250px", position: "relative" }}>
                                <Doughnut data={pieChartData} options={pieChartOptions} ref={pieChartRef} />
                              </div>
                              <div id="pie-legend" className="legend"></div>
                            </div>
                          )}
                          {activeChartTab === "referrals" && (
                            <div role="tabpanel" className="tab-pane fade show active referrals_data" id="referrals">
                              <ul>
                                <li>
                                  <p className="site">google.com</p>
                                  <p className="visit">
                                    <span>visitors:</span>250
                                  </p>
                                </li>

                                <li>
                                  <p className="site">dribbble.com</p>
                                  <p className="visit">
                                    <span>visitors:</span>450
                                  </p>
                                </li>

                                <li>
                                  <p className="site">behance.com</p>
                                  <p className="visit">
                                    <span>visitors:</span>341
                                  </p>
                                </li>

                                <li>
                                  <p className="site">domain.com</p>
                                  <p className="visit">
                                    <span>visitors:</span>98
                                  </p>
                                </li>
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-8">
                <div className="dashboard_module recent_sells">
                  <div className="dashboard__title">
                    <h4>Recent Items Sales</h4>

                    <div className="loading">
                      <a href="#">
                        <span className="lnr lnr-sync"></span>
                      </a>
                    </div>
                  </div>

                  <div className="dashboard__content">
                    {loading ? (
                      <div className="text-center" style={{ padding: "40px" }}>
                        <p>Loading recent sales...</p>
                      </div>
                    ) : stats === null ? (
                      <div className="text-center" style={{ padding: "40px" }}>
                        <p>No data available.</p>
                      </div>
                    ) : recentSales.length === 0 ? (
                      <div className="text-center" style={{ padding: "40px" }}>
                        <p>No recent sales</p>
                      </div>
                    ) : (
                      <ul>
                        {recentSales.map((sale) => (
                          <li key={sale.id}>
                            <div className="single_sell">
                              <div className="single_sell__thumb-title">
                                <div className="prod_thumbnail">
                                  <Image
                                    src={withBasePath(sale.image)}
                                    alt="product thumbnail"
                                    width={60}
                                    height={60}
                                  />
                                </div>
                                <div className="prod_title">
                                  <h4>
                                    {sale.slug ? (
                                      <Link href={`/single-product/${sale.slug}`}>{sale.title}</Link>
                                    ) : (
                                      sale.title
                                    )}
                                  </h4>
                                  <div className="category">
                                    <Image
                                      src={withBasePath(sale.category.icon)}
                                      alt="category"
                                      width={20}
                                      height={20}
                                    />
                                    <span>{sale.category.name}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="ammount">
                                <p>${sale.price.toFixed(2)}</p>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="dashboard_module recent_buyers">
                  <div className="dashboard__title">
                    <h4>Recent Buyers</h4>
                    <div className="loading">
                      <a href="#">
                        <span className="lnr lnr-sync"></span>
                      </a>
                    </div>
                  </div>

                  <div className="dashboard__content">
                    {loading ? (
                      <div className="text-center" style={{ padding: "40px" }}>
                        <p>Loading recent buyers...</p>
                      </div>
                    ) : stats === null ? (
                      <div className="text-center" style={{ padding: "40px" }}>
                        <p>No data available.</p>
                      </div>
                    ) : recentBuyers.length === 0 ? (
                      <div className="text-center" style={{ padding: "40px" }}>
                        <p>No recent buyers</p>
                      </div>
                    ) : (
                      <ul>
                        {recentBuyers.map((buyer, index) => (
                          <li key={`${buyer.id}-${index}`}>
                            <div className="single_buyer">
                              <div className="buyer__thumb_title">
                                <div className="thumb">
                                  <Image
                                    src={withBasePath(buyer.image)}
                                    alt="Buyer Images"
                                    width={50}
                                    height={50}
                                  />
                                </div>
                                <div className="title">
                                  <h4>{buyer.name}</h4>
                                  <p>{buyer.country}</p>
                                </div>
                              </div>

                              <div className="price">
                                <p>${buyer.totalSpent.toFixed(2)}</p>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-lg-8">
                <div className="dashboard_module single_item_visitor">
                  <div className="dashboard__title">
                    <h4>Single Items Visitors</h4>
                    <div className="pull-right">
                      <div className="select-wrap">
                        <select name="months" className="period_selector">
                          <option value="jan">Jan</option>
                          <option value="feb">Feb</option>
                          <option value="mar">Mar</option>
                        </select>
                        <span className="lnr lnr-chevron-down"></span>
                      </div>
                    </div>
                  </div>
                  <div className="dashboard__content">
                    <div style={{ height: "300px", position: "relative" }}>
                      <Bar data={singleItemVisitData} options={singleItemVisitOptions} ref={singleItemVisitRef} />
                    </div>

                    <div className="item_info">
                      <div className="select-wrap">
                        <select name="item" className="period_selector">
                          <option value="mattheme">Material Admin - Responsive Admin Theme</option>
                          <option value="reactAdmin">Best Free Responsive ReactJS Admin Themes</option>
                          <option value="design">Best YouTube Channels For UI/UX Designers</option>
                        </select>
                        <span className="lnr lnr-chevron-down"></span>
                      </div>

                      <div className="info">
                        <h4 className="indicate">+60%</h4>
                        <p>Compared to Last Month</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-12">
                <div className="dashboard_module single_item_visitor">
                  <div className="dashboard__title">
                    <h4>Total Revenue</h4>
                    <div id="visit_legend" className="legend"></div>
                  </div>
                  <div className="dashboard__content">
                    <div style={{ height: "300px", position: "relative" }}>
                      <Line data={revenueData} options={revenueOptions} ref={revenueRef} />
                    </div>
                  </div>
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

