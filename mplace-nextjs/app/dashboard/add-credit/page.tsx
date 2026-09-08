"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import Breadcrumb from "@/components/common/Breadcrumb"
import DashboardMenu from "@/components/dashboard/DashboardMenu"
import Image from "next/image"
import { getApiUrl, withBasePath } from "@/utils/paths"

interface CreditSummaryItem {
  id: string
  amount: number
  paymentMethod: string | null
  source: "MANUAL" | "SALE_CONVERSION"
  paymentMethodLabel?: string
  reference: string | null
  createdAt: string
}

interface CreditSummaryResponse {
  balance: number
  totalCredits: number
  recentCredits: CreditSummaryItem[]
  saleBalance: number
  saleBalanceWithdrawn: number
  saleBalanceConverted: number
  saleBalanceAvailable: number
}

export default function DashboardAddCreditPage() {
  const [selectedAmount, setSelectedAmount] = useState<string | null>(null)
  const [customAmount, setCustomAmount] = useState("")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string>("")
  const [successMessage, setSuccessMessage] = useState<string>("")
  const [summary, setSummary] = useState<CreditSummaryResponse | null>(null)
  const [summaryLoading, setSummaryLoading] = useState<boolean>(true)
  const [summaryError, setSummaryError] = useState<string>("")
  const [convertAmount, setConvertAmount] = useState<string>("")
  const [convertSubmitting, setConvertSubmitting] = useState(false)
  const [convertError, setConvertError] = useState<string>("")
  const [convertSuccess, setConvertSuccess] = useState<string>("")
  const [manualCredit, setManualCredit] = useState(false)
  const [manualNote, setManualNote] = useState("")

  const presetAmounts = [10, 20, 50, 100, 500]

  const formatCurrency = useCallback((value: number) => {
    return value.toLocaleString("en-US", { style: "currency", currency: "USD" })
  }, [])

  const paymentMethodLabel = useMemo(() => {
    if (manualCredit) return "Manual Credit"
    if (!selectedPaymentMethod) return ""
    const labels: Record<string, string> = {
      mastercard: "Mastercard",
      visa: "Visa",
      paypal: "PayPal",
      discover: "Discover",
      amex: "American Express",
    }
    return labels[selectedPaymentMethod] || selectedPaymentMethod
  }, [selectedPaymentMethod, manualCredit])

  const loadCreditSummary = useCallback(async () => {
    try {
      setSummaryLoading(true)
      setSummaryError("")
      const response = await fetch(getApiUrl("/api/dashboard/credits"), {
        credentials: "include",
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data?.error || "Failed to load credit summary")
      }

      const data = (await response.json()) as CreditSummaryResponse
      setSummary(data)
    } catch (error: any) {
      setSummary(null)
      setSummaryError((error as Error)?.message || "Failed to load summary")
    } finally {
      setSummaryLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadCreditSummary()
  }, [loadCreditSummary])

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError("")
    setSuccessMessage("")

    const amountValue = selectedAmount ? Number(selectedAmount) : Number(customAmount)

    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      setFormError("Please select or enter a valid amount")
      return
    }

    if (!manualCredit && !selectedPaymentMethod) {
      setFormError("Please choose a payment method")
      return
    }

    try {
      setIsSubmitting(true)

      const response = await fetch(getApiUrl("/api/dashboard/credits"), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountValue,
          paymentMethod: manualCredit ? "manual" : selectedPaymentMethod,
          note: manualCredit ? manualNote : undefined,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data?.error || "Failed to add credits")
      }

      setSuccessMessage(
        `Successfully added ${formatCurrency(amountValue)} via ${paymentMethodLabel || "Manual Credit"}. Reference: ${data.credit?.reference || "N/A"}`,
      )
      setSelectedAmount(null)
      setCustomAmount("")
      setSelectedPaymentMethod(null)
      setManualCredit(false)
      setManualNote("")
      void loadCreditSummary()

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("credits:update"))
      }
    } catch (error: any) {
      setFormError((error as Error)?.message || "Failed to add credits")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConvertSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setConvertError("")
    setConvertSuccess("")

    const available = summary?.saleBalanceAvailable ?? 0
    const amountValue = Number(convertAmount)

    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      setConvertError("Please enter a valid amount to convert")
      return
    }

    if (amountValue > available) {
      setConvertError("Amount exceeds available sale balance")
      return
    }

    try {
      setConvertSubmitting(true)
      const response = await fetch(getApiUrl("/api/dashboard/credits/convert"), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: amountValue }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data?.error || "Failed to convert sale balance")
      }

      setConvertSuccess(
        `Converted ${formatCurrency(amountValue)} from sale balance. Reference: ${data.credit?.reference || "N/A"}`,
      )
      setConvertAmount("")
      void loadCreditSummary()

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("credits:update"))
      }
    } catch (error: any) {
      setConvertError((error as Error)?.message || "Failed to convert sale balance")
    } finally {
      setConvertSubmitting(false)
    }
  }

  return (
    <div className="preload dashboard-page">
      <Preloader />
      <Header />
      <Breadcrumb
        pageTitle="Add Credits"
        paths={[
          { name: "Dashboard", link: "/dashboard" },
          { name: "Add Credits", link: "/dashboard/add-credit" },
        ]}
      />

      <section className="dashboard-area">
        <DashboardMenu />

        <div className="dashboard_contents">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="dashboard_title_area">
                  <div className="dashboard__title">
                    <h3>Buy Credits</h3>
                    <p className="credit_subtitle">Manage your marketplace credits for digital-product purchases.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12">
                <div className="credit_summary">
                  {summaryLoading ? (
                    <div className="credit_summary__item loading">
                      <span className="label">Current Balance</span>
                      <span className="value">Loading…</span>
                    </div>
                  ) : summary ? (
                    <>
                      <div className="credit_summary__item">
                        <span className="label">Current Balance</span>
                        <span className="value">{formatCurrency(summary.balance)}</span>
                      </div>
                      <div className="credit_summary__item">
                        <span className="label">Total Credits</span>
                        <span className="value">{formatCurrency(summary.totalCredits)}</span>
                      </div>
                      <div className="credit_summary__item">
                        <span className="label">Recent Credit</span>
                        <span className="value">
                          {summary.recentCredits.length > 0
                            ? `${formatCurrency(summary.recentCredits[0].amount)} • ${new Date(
                                summary.recentCredits[0].createdAt,
                              ).toLocaleDateString()}`
                            : "No credits yet"}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="credit_summary__item error">
                      <span className="label">Summary</span>
                      <span className="value">{summaryError}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {formError && (
              <div className="alert alert-danger" role="alert" style={{ marginBottom: 20 }}>
                {formError}
              </div>
            )}
            {successMessage && (
              <div className="alert alert-success" role="alert" style={{ marginBottom: 20 }}>
                {successMessage}
              </div>
            )}
            {convertError && (
              <div className="alert alert-danger" role="alert" style={{ marginBottom: 20 }}>
                {convertError}
              </div>
            )}
            {convertSuccess && (
              <div className="alert alert-success" role="alert" style={{ marginBottom: 20 }}>
                {convertSuccess}
              </div>
            )}

            <form action="#" name="add_credit_form" onSubmit={handleFormSubmit}>
              <div className="row">
                <div className="col-md-12">
                  <div className="credit_modules">
                    <div className="modules__title">
                      <h3>Credit Amount</h3>
                    </div>

                    <div className="modules__content">
                      <p className="subtitle">Select an amount</p>
                      <div className="amounts">
                        <ul>
                          {presetAmounts.map((amount) => (
                            <li
                              key={amount}
                              data-price={amount}
                              onClick={() => {
                                setSelectedAmount(amount.toString())
                                setCustomAmount(amount.toString())
                              }}
                            >
                              <p className={selectedAmount === amount.toString() ? "selected" : ""}>${amount}</p>
                            </li>
                          ))}
                        </ul>
                        <input type="hidden" className="selected_price" value={selectedAmount || ""} />
                      </div>

                      <div className="or"></div>
                      <p className="subtitle">Enter an amount</p>
                      <div className="custom_amount">
                        <div className="input-group">
                          <span className="input-group-addon">$</span>
                          <input
                            type="text"
                            id="rlicense"
                            className="text_field"
                            placeholder="eg: 250"
                            value={customAmount}
                            onChange={(e) => {
                              const sanitized = e.target.value.replace(/[^0-9.]/g, "")
                              setCustomAmount(sanitized)
                              setSelectedAmount(null)
                            }}
                          />
                        </div>
                      </div>
                      <div className="manual_toggle">
                        <label className="custom-checkbox">
                          <input
                            type="checkbox"
                            checked={manualCredit}
                            onChange={(event) => {
                              setManualCredit(event.target.checked)
                              if (event.target.checked) {
                                setSelectedPaymentMethod(null)
                              }
                            }}
                          />
                          <span></span>
                          Add manual credit (no payment method)
                        </label>
                        {manualCredit && (
                          <p className="manual_note_help">
                            Use this for adjustments, goodwill credits, or compensations. Optionally describe the reason below.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="credit_modules">
                <div className="row">
                  <div className="col-md-12">
                    <div className="modules__title">
                      <h3>Payment Method & Confirmation</h3>
                    </div>

                    <div className="modules__content">
                      <p className="subtitle">How much credit would you like to add?</p>
                      {!manualCredit && (
                        <ul className="payment_method">
                          <li>
                            <div className="custom-radio custom_radio--big">
                              <input
                                type="radio"
                                id="opt1"
                                name="card"
                                checked={selectedPaymentMethod === "mastercard"}
                                onChange={() => setSelectedPaymentMethod("mastercard")}
                              />
                              <label htmlFor="opt1">
                                <Image src={withBasePath("/images/mas.jpg")} alt="payment cards" width={50} height={30} />
                                <span className="circle"></span>
                              </label>
                            </div>
                          </li>
                          <li>
                            <div className="custom-radio custom_radio--big">
                              <input
                                type="radio"
                                id="opt2"
                                name="card"
                                checked={selectedPaymentMethod === "visa"}
                                onChange={() => setSelectedPaymentMethod("visa")}
                              />
                              <label htmlFor="opt2">
                                <Image src={withBasePath("/images/vis.jpg")} alt="payment cards" width={50} height={30} />
                                <span className="circle"></span>
                              </label>
                            </div>
                          </li>
                          <li>
                            <div className="custom-radio custom_radio--big">
                              <input
                                type="radio"
                                id="opt3"
                                name="card"
                                checked={selectedPaymentMethod === "paypal"}
                                onChange={() => setSelectedPaymentMethod("paypal")}
                              />
                              <label htmlFor="opt3">
                                <Image src={withBasePath("/images/ppl.jpg")} alt="payment cards" width={50} height={30} />
                                <span className="circle"></span>
                              </label>
                            </div>
                          </li>
                          <li>
                            <div className="custom-radio custom_radio--big">
                              <input
                                type="radio"
                                id="opt5"
                                name="card"
                                checked={selectedPaymentMethod === "discover"}
                                onChange={() => setSelectedPaymentMethod("discover")}
                              />
                              <label htmlFor="opt5">
                                <Image src={withBasePath("/images/dis.jpg")} alt="payment cards" width={50} height={30} />
                                <span className="circle"></span>
                              </label>
                            </div>
                          </li>
                          <li>
                            <div className="custom-radio custom_radio--big">
                              <input
                                type="radio"
                                id="opt6"
                                name="card"
                                checked={selectedPaymentMethod === "amex"}
                                onChange={() => setSelectedPaymentMethod("amex")}
                              />
                              <label htmlFor="opt6">
                                <Image src={withBasePath("/images/ami.jpg")} alt="payment cards" width={50} height={30} />
                                <span className="circle"></span>
                              </label>
                            </div>
                          </li>
                        </ul>
                      )}

                      {manualCredit && (
                        <div className="form-group" style={{ marginTop: 20 }}>
                          <label htmlFor="manual_note">Manual credit note (optional)</label>
                          <textarea
                            id="manual_note"
                            className="text_field"
                            rows={3}
                            placeholder="Describe why this credit is being added"
                            value={manualNote}
                            onChange={(event) => setManualNote(event.target.value)}
                          ></textarea>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="payment_info modules__content">
                      <div className="form-group">
                        <label htmlFor="card_number">Card Number</label>
                        <input id="card_number" name="card_number" type="text" className="text_field" placeholder="Enter your card number here..." />
                      </div>

                      <label htmlFor="name">Expire Date</label>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group">
                            <div className="select-wrap select-wrap2">
                              <select name="months" id="name" className="text_field" defaultValue="">
                                <option value="">Month</option>
                                <option value="jan">jan</option>
                                <option value="feb">Feb</option>
                                <option value="mar">Mar</option>
                                <option value="apr">Apr</option>
                                <option value="may">May</option>
                                <option value="jun">Jun</option>
                                <option value="jul">Jul</option>
                                <option value="aug">Aug</option>
                                <option value="sep">Sep</option>
                                <option value="oct">Oct</option>
                                <option value="nov">Nov</option>
                                <option value="dec">Dec</option>
                              </select>
                              <span className="lnr lnr-chevron-down"></span>
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group">
                            <div className="select-wrap select-wrap2">
                              <select name="years" id="years" className="text_field" defaultValue="">
                                <option value="">Year</option>
                                <option value="28">2028</option>
                                <option value="27">2027</option>
                                <option value="26">2026</option>
                                <option value="25">2025</option>
                                <option value="24">2024</option>
                                <option value="23">2023</option>
                                <option value="22">2022</option>
                                <option value="21">2021</option>
                                <option value="20">2020</option>
                                <option value="19">2019</option>
                              </select>
                              <span className="lnr lnr-chevron-down"></span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="cv_code">CVV Code</label>
                            <input id="cv_code" name="cv_code" type="text" className="text_field" placeholder="Enter code here..." />
                          </div>

                          <div className="custom-radio">
                            <input type="checkbox" id="opt8" name="save_card" />
                            <label htmlFor="opt8">
                              <span className="circle"></span>Save card for next time
                            </label>
                          </div>

                          <button type="submit" className="btn btn--round btn--default" disabled={isSubmitting}>
                            {isSubmitting ? "Processing..." : "Add Credit Now"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>

            <div className="row">
              <div className="col-md-12">
                <div className="credit_convert">
                  <div className="modules__title">
                    <h3>Convert Sale Balance</h3>
                  </div>
                  <div className="modules__content">
                    <p className="subtitle">
                      Available sale balance you can convert: {formatCurrency(summary?.saleBalanceAvailable || 0)}
                    </p>
                    <form onSubmit={handleConvertSubmit} className="convert_form">
                      <div className="input-group">
                        <span className="input-group-addon">$</span>
                        <input
                          type="text"
                          className="text_field"
                          placeholder="Amount to convert"
                          value={convertAmount}
                          onChange={(e) => setConvertAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                        />
                      </div>
                      <button type="submit" className="btn btn--round btn--md" disabled={convertSubmitting}>
                        {convertSubmitting ? "Converting…" : "Convert to Credits"}
                      </button>
                    </form>
                    <div className="sale_balance_meta">
                      <span>Total sales: {formatCurrency(summary?.saleBalance || 0)}</span>
                      <span>Converted: {formatCurrency(summary?.saleBalanceConverted || 0)}</span>
                      <span>Pending/Withdrawn: {formatCurrency(summary?.saleBalanceWithdrawn || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12">
                <div className="credit_history">
                  <div className="modules__title">
                    <h3>Recent Credit History</h3>
                  </div>
                  <div className="modules__content">
                    {summaryLoading ? (
                      <p>Loading history…</p>
                    ) : summary && summary.recentCredits.length > 0 ? (
                      <ul className="credit_history__list">
                        {summary.recentCredits.map((credit) => (
                          <li key={credit.id}>
                            <div className="credit_history__details">
                              <span className="amount">{formatCurrency(credit.amount)}</span>
                              <span className="meta">
                                {new Date(credit.createdAt).toLocaleString()} · {credit.paymentMethodLabel || "Unknown"}
                              </span>
                            </div>
                            {credit.reference && <span className="reference">Ref: {credit.reference}</span>}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No credit transactions yet.</p>
                    )}
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

