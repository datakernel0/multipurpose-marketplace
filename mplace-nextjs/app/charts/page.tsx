"use client"

import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import CallToActionSection from "@/components/sections/CallToActionSection"
import Breadcrumb from "@/components/common/Breadcrumb"
import { useEffect, useRef, useState } from "react"
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

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler)

export default function ChartsPage() {
  const [activeTab, setActiveTab] = useState("visit_source")

  // Chart 1: Sales and Views Statistics
  const chart1Data = {
    labels: [5, 10, 15, 20, 25, 30],
    datasets: [
      {
        label: "Daily Views",
        backgroundColor: "rgba(115, 71, 193, 0.5)",
        borderColor: "#7347c1",
        data: [5, 17, 13, 23, 18, 16],
        pointBackgroundColor: "#7347c1",
        pointBorderColor: "#fff",
      },
      {
        label: "Daily Sale",
        backgroundColor: "rgba(5, 116, 236, 0.5)",
        borderColor: "#0674ec",
        data: [10, 12, 17, 19, 15, 9],
        pointBackgroundColor: "#0674ec",
        pointBorderColor: "#fff",
      },
    ],
  }

  const chart1Options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: 40,
        ticks: {
          color: "#8896a5",
        },
      },
      x: {
        ticks: {
          color: "#8896a5",
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  }

  // Chart 2: Single Items Visitors
  const chart2Data = {
    labels: [3, 6, 9, 12, 15, 18, 21, 24, 27, 30],
    datasets: [
      {
        data: [15, 14, 23, 48, 55, 25, 82, 33, 55, 41, 2],
        backgroundColor: "#0674ec",
      },
    ],
  }

  const chart2Options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: 60,
        ticks: {
          color: "#8896a5",
        },
      },
      x: {
        ticks: {
          color: "#8896a5",
        },
        barThickness: 40,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  }

  // Chart 3: Total Revenue
  const chart3Data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "2015",
        data: [3, 2.9, 2.7, 3.5, 4, 3.8, 3.7, 3.5, 4, 4.5, 4.3, 4.2],
        fill: false,
        borderColor: "#7347c1",
        tension: 0,
        pointBorderColor: "#7347c1",
        pointBackgroundColor: "#fff",
        pointBorderWidth: 3,
      },
      {
        label: "2016",
        data: [4, 3.9, 3.7, 4.5, 5, 5.8, 5.1, 4.5, 5.7, 7, 6.25, 5.9],
        fill: false,
        borderColor: "#0674ec",
        tension: 0,
        pointBorderColor: "#0674ec",
        pointBackgroundColor: "#fff",
        pointBorderWidth: 3,
      },
      {
        label: "2019",
        data: [5, 5.5, 5.9, 5.5, 5, 4.8, 5.8, 6.5, 6.1, 5.8, 6.7, 7.2],
        fill: false,
        borderColor: "#62d03a",
        tension: 0,
        pointBorderColor: "#62d03a",
        pointBackgroundColor: "#fff",
        pointBorderWidth: 3,
      },
    ],
  }

  const chart3Options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        ticks: {
          suggestedMax: 10,
          callback: function (value: any) {
            return value + "k"
          },
          color: "#8896a5",
        },
      },
      x: {
        ticks: {
          color: "#8896a5",
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  }

  // Chart 4: Pie Chart
  const pieChartData = {
    datasets: [
      {
        data: [120, 90, 70],
        backgroundColor: ["#0674ec", "#ff6a6c", "#61d039"],
      },
    ],
    labels: ["Google", "Website", "Other"],
  }

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "75%",
    plugins: {
      legend: {
        display: false,
      },
    },
  }

  return (
    <div className="preload charts-page">
      <Preloader />
      <Header />
      <Breadcrumb pageTitle="Charts" paths={[{ name: "Charts", link: "/charts" }]} />
      <section className="section--padding2 bgcolor">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="shortcode_module_title">
                <div className="dashboard__title">
                  <h3>Charts 1</h3>
                </div>
              </div>
              <div className="dashboard_module statistics_module">
                <div className="dashboard__title">
                  <h4>Sales and Views Statistics</h4>

                  <div className="pull-right">
                    <div id="stat_legend" className="legend">
                      <ul>
                        <li>
                          <span style={{ backgroundColor: "#7347c1" }}></span>Daily Views
                        </li>
                        <li>
                          <span style={{ backgroundColor: "#0674ec" }}></span>Daily Sale
                        </li>
                      </ul>
                    </div>
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
                    <Line data={chart1Data} options={chart1Options} />
                  </div>

                  <div className="statistics_data">
                    <div className="row">
                      <div className="col-md-4 col-sm-4">
                        <div className="single_stat_data">
                          <h4 className="single_stat__title">478</h4>
                          <p>
                            Total <span>Sales</span> This Month
                          </p>
                        </div>
                      </div>
                      <div className="col-md-4 text-center col-sm-4">
                        <div className="single_stat_data">
                          <h4 className="single_stat__title">$2,478</h4>
                          <p>
                            Total <span>Earnings</span> This Month
                          </p>
                        </div>
                      </div>
                      <div className="col-md-4 text-right col-sm-4">
                        <div className="single_stat_data">
                          <h4 className="single_stat__title">478</h4>
                          <p>
                            Total <span>Sales</span> This Month
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-12">
              <div className="shortcode_module_title">
                <div className="dashboard__title">
                  <h3>Charts 2</h3>
                </div>
              </div>
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
                    <Bar data={chart2Data} options={chart2Options} />
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
              <div className="shortcode_module_title">
                <div className="dashboard__title">
                  <h3>Charts 3</h3>
                </div>
              </div>
              <div className="dashboard_module single_item_visitor">
                <div className="dashboard__title">
                  <h4>Total Revenue</h4>
                  <div id="visit_legend" className="legend">
                    <ul>
                      <li>
                        <span style={{ backgroundColor: "#7347c1" }}></span>2015
                      </li>
                      <li>
                        <span style={{ backgroundColor: "#0674ec" }}></span>2016
                      </li>
                      <li>
                        <span style={{ backgroundColor: "#62d03a" }}></span>2019
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="dashboard__content">
                  <div style={{ height: "300px", position: "relative" }}>
                    <Line data={chart3Data} options={chart3Options} />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-12">
              <div className="shortcode_module_title">
                <div className="dashboard__title">
                  <h3>Charts 4</h3>
                </div>
              </div>

              <div className="dashboard_module visit_data">
                <div className="row">
                  <div className="col-lg-6 offset-lg-3 col-md-12">
                    <div className="dashboard__content">
                      <div className="chart_top">
                        <div className="v_refer">
                          <ul className="nav nav-tabs" role="tablist">
                            <li>
                              <a
                                href="#visit_source"
                                className={activeTab === "visit_source" ? "active" : ""}
                                aria-controls="visit_source"
                                role="tab"
                                onClick={(e) => {
                                  e.preventDefault()
                                  setActiveTab("visit_source")
                                }}
                              >
                                Visit Source
                              </a>
                            </li>
                            <li>
                              <a
                                href="#referrals"
                                className={activeTab === "referrals" ? "active" : ""}
                                aria-controls="referrals"
                                role="tab"
                                onClick={(e) => {
                                  e.preventDefault()
                                  setActiveTab("referrals")
                                }}
                              >
                                Referrals
                              </a>
                            </li>
                          </ul>
                          <div className="select-wrap">
                            <select name="mon" className="period_selector">
                              <option value="jan">Jan</option>
                              <option value="feb">Feb</option>
                              <option value="mar">Mar</option>
                            </select>
                            <span className="lnr lnr-chevron-down"></span>
                          </div>
                        </div>

                        <div className="charts">
                          {activeTab === "visit_source" && (
                            <div role="tabpanel" className="tab-pane active fade show" id="visit_source">
                              <div style={{ height: "300px", position: "relative" }}>
                                <Doughnut data={pieChartData} options={pieChartOptions} />
                              </div>

                              <div id="pie-legend" className="legend">
                                <ul>
                                  <li>
                                    <span style={{ backgroundColor: "#0674ec" }}></span>Google
                                  </li>
                                  <li>
                                    <span style={{ backgroundColor: "#ff6a6c" }}></span>Website
                                  </li>
                                  <li>
                                    <span style={{ backgroundColor: "#61d039" }}></span>Other
                                  </li>
                                </ul>
                              </div>
                            </div>
                          )}
                          {activeTab === "referrals" && (
                            <div role="tabpanel" className="tab-pane fade show referrals_data" id="referrals">
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
            </div>
          </div>
        </div>
      </section>
      <CallToActionSection />
      <Footer />
      <ScrollToTop />
    </div>
  )
}

