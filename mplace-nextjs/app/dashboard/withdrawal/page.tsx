"use client"

import { useState } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import Breadcrumb from "@/components/common/Breadcrumb"
import DashboardMenu from "@/components/dashboard/DashboardMenu"
import Link from "next/link"

interface WithdrawalHistory {
  date: string
  paymentMethod: string
  amount: string
  status: "pending" | "paid"
}

export default function DashboardWithdrawalPage() {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null)
  const [withdrawOption, setWithdrawOption] = useState<string | null>(null)
  const [customAmount, setCustomAmount] = useState("")

  const withdrawalHistory: WithdrawalHistory[] = [
    { date: "09 Jul 2019", paymentMethod: "Payoneer", amount: "$568.50", status: "pending" },
    { date: "20 May 2019", paymentMethod: "Payoneer", amount: "$1300.50", status: "paid" },
    { date: "16 Dec 2016", paymentMethod: "Local Bank (USD) - Account ending in 5790", amount: "$2380", status: "paid" },
    { date: "09 Jul 2019", paymentMethod: "Payoneer", amount: "$568.50", status: "pending" },
    { date: "20 May 2019", paymentMethod: "Payoneer", amount: "$1300.50", status: "paid" },
    { date: "16 Dec 2016", paymentMethod: "Local Bank (USD) - Account ending in 5790", amount: "$2380", status: "paid" },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle withdrawal submission
  }

  return (
    <div className="preload dashboard-page">
      <Preloader />
      <Header />
      <Breadcrumb
        pageTitle="Withdrawals"
        paths={[
          { name: "Dashboard", link: "/dashboard" },
          { name: "Withdraw", link: "/dashboard/withdrawal" },
        ]}
      />

      <section className="dashboard-area">
        <DashboardMenu />

        <div className="dashboard_contents">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="dashboard_title_area clearfix">
                  <div className="dashboard__title pull-left">
                    <h3>Withdrawals</h3>
                  </div>

                  <div className="pull-right">
                    <Link href="/dashboard/add-payment-method" className="btn btn--round btn--md">
                      Add Payment Method
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12">
                <div className="withdraw_module cardify">
                  <div className="row">
                    <div className="col-lg-6">
                      <div className="modules__title">
                        <h3>Payment Methods</h3>
                      </div>

                      <div className="modules__content">
                        <p className="subtitle">
                          Select your Payment Method for <Link href="#">Withdraw Earnings</Link>
                        </p>
                        <div className="options">
                          <div className="custom-radio">
                            <input
                              type="radio"
                              id="opt1"
                              name="filter_opt"
                              checked={selectedPaymentMethod === "payoneer"}
                              onChange={() => setSelectedPaymentMethod("payoneer")}
                            />
                            <label htmlFor="opt1">
                              <span className="circle"></span>Payoneer Debit Card
                            </label>
                          </div>

                          <div className="custom-radio">
                            <input
                              type="radio"
                              id="opt2"
                              name="filter_opt"
                              checked={selectedPaymentMethod === "paypal"}
                              onChange={() => setSelectedPaymentMethod("paypal")}
                            />
                            <label htmlFor="opt2">
                              <span className="circle"></span>Paypal
                            </label>
                          </div>

                          <div className="custom-radio">
                            <input
                              type="radio"
                              id="opt3"
                              name="filter_opt"
                              checked={selectedPaymentMethod === "bank"}
                              onChange={() => setSelectedPaymentMethod("bank")}
                            />
                            <label htmlFor="opt3">
                              <span className="circle"></span>Direct to Local Bank (USD) - Account ending in 5790 (Minimum $50)
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-6">
                      <div className="modules__title">
                        <h3>Withdraw Amount</h3>
                      </div>

                      <div className="modules__content">
                        <p className="subtitle">How much amount would you like to Withdraw?</p>
                        <div className="options">
                          <div className="custom-radio">
                            <input
                              type="radio"
                              id="opt4"
                              name="withdraw_opt"
                              checked={withdrawOption === "full"}
                              onChange={() => setWithdrawOption("full")}
                            />
                            <label htmlFor="opt4">
                              <span className="circle"></span>Available balance: <span className="bold">$690.50</span>
                            </label>
                          </div>

                          <div className="custom-radio">
                            <input
                              type="radio"
                              id="opt5"
                              name="withdraw_opt"
                              checked={withdrawOption === "partial"}
                              onChange={() => setWithdrawOption("partial")}
                            />
                            <label htmlFor="opt5">
                              <span className="circle"></span>A partial amount...
                            </label>
                          </div>

                          {withdrawOption === "partial" && (
                            <div className="withdraw_amount">
                              <div className="input-group">
                                <span className="input-group-addon">$</span>
                                <input
                                  type="text"
                                  id="rlicense"
                                  className="text_field"
                                  placeholder="00.00"
                                  value={customAmount}
                                  onChange={(e) => setCustomAmount(e.target.value)}
                                />
                              </div>
                              <span className="fee">$2 USD Fee per withdrawal</span>
                            </div>
                          )}
                        </div>

                        <div className="button_wrapper">
                          <button type="submit" className="btn btn--round btn--md" onClick={handleSubmit}>
                            Submit Withdrawal
                          </button>
                          <a href="#" className="btn btn--round btn-sm cancel_btn">
                            Cancel
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12">
                <div className="withdraw_module withdraw_history">
                  <div className="withdraw_table_header">
                    <h3>Withdrawal History</h3>
                  </div>
                  <div className="table-responsive">
                    <table className="table withdraw__table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Payment Method</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>

                      <tbody>
                        {withdrawalHistory.map((withdrawal, index) => (
                          <tr key={index}>
                            <td>{withdrawal.date}</td>
                            <td>{withdrawal.paymentMethod}</td>
                            <td className="bold">{withdrawal.amount}</td>
                            <td className={withdrawal.status}>
                              <span>{withdrawal.status === "pending" ? "Pending" : "Paid"}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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

