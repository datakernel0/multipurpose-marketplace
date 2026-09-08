"use client"

import { useState } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import Breadcrumb from "@/components/common/Breadcrumb"
import DashboardMenu from "@/components/dashboard/DashboardMenu"
import Image from "next/image"
import { withBasePath } from "@/utils/paths"

export default function DashboardAddPaymentMethodPage() {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null)

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
  }

  return (
    <div className="preload dashboard-page">
      <Preloader />
      <Header />
      <Breadcrumb
        pageTitle="Add Payment Method"
        paths={[
          { name: "Dashboard", link: "/dashboard" },
          { name: "Withdrawals", link: "/dashboard/withdrawal" },
          { name: "Add Payment Method", link: "/dashboard/add-payment-method" },
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
                    <h3>Add Payment Method</h3>
                  </div>
                </div>
              </div>
            </div>

            <form action="#" name="add_credit_form" onSubmit={handleFormSubmit}>
              <div className="credit_modules">
                <div className="row">
                  <div className="col-md-12">
                    <div className="modules__title">
                      <h3>Payment Method & Confirmation</h3>
                    </div>

                    <div className="modules__content">
                      <p className="subtitle">Select a payment method</p>

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
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="payment_info modules__content">
                      <div className="form-group">
                        <label htmlFor="card_number">Card Number</label>
                        <input id="card_number" type="text" className="text_field" placeholder="Enter your card number here..." />
                      </div>

                      <label htmlFor="name">Expire Date</label>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group">
                            <div className="select-wrap select-wrap2">
                              <select name="months" id="name" className="text_field">
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
                              <select name="years" id="years" className="text_field">
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
                            <input id="cv_code" type="text" className="text_field" placeholder="Enter code here..." />
                          </div>

                          <div className="custom-radio">
                            <input type="radio" id="opt8" name="filter_opt" />
                            <label htmlFor="opt8">
                              <span className="circle"></span>Save card for next time
                            </label>
                          </div>

                          <button type="submit" className="btn btn--round btn--default">
                            Add Payment Method
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      <Footer />
      <ScrollToTop />
    </div>
  )
}

