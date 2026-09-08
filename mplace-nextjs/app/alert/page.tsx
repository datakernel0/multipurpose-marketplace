"use client"

import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import Breadcrumb from "@/components/common/Breadcrumb"
import { useState } from "react"

export default function AlertPage() {
  const [alerts, setAlerts] = useState<Record<string, boolean>>({
    default: true,
    success: true,
    info: true,
    warning: true,
    danger: true,
  })

  const dismissAlert = (id: string) => {
    setAlerts((prev) => ({ ...prev, [id]: false }))
  }

  return (
    <div className="preload accordion-page">
      <Preloader />
      <Header />
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Alerts", active: true }]} title="Alerts" />
      <section className="section--padding2 bgcolor">
        <div className="container">
          <div className="row">
            <div className="col-md-8 offset-md-2">
              <div className="shortcode_modules">
                <div className="modules__title">
                  <h3>Alerts</h3>
                </div>
                <div className="modules__content">
                  {alerts.default && (
                    <div className="alert alert-default" role="alert">
                      <span className="alert_icon lnr lnr-alarm"></span>
                      <strong>Hello World!</strong> This is default alert message box style.
                      <button
                        type="button"
                        className="close"
                        onClick={() => dismissAlert("default")}
                        aria-label="Close"
                      >
                        <span className="lnr lnr-cross" aria-hidden="true"></span>
                      </button>
                    </div>
                  )}
                  {alerts.success && (
                    <div className="alert alert-success" role="alert">
                      <span className="alert_icon lnr lnr-checkmark-circle"></span>
                      <strong>Well done!</strong> You successfully read this important alert message.
                      <button
                        type="button"
                        className="close"
                        onClick={() => dismissAlert("success")}
                        aria-label="Close"
                      >
                        <span className="lnr lnr-cross" aria-hidden="true"></span>
                      </button>
                    </div>
                  )}
                  {alerts.info && (
                    <div className="alert alert-info" role="alert">
                      <span className="alert_icon lnr lnr-bullhorn"></span>
                      <strong>Heads up!</strong> This alert needs your attention, but it's not super important.
                      <button type="button" className="close" onClick={() => dismissAlert("info")} aria-label="Close">
                        <span className="lnr lnr-cross" aria-hidden="true"></span>
                      </button>
                    </div>
                  )}
                  {alerts.warning && (
                    <div className="alert alert-warning" role="alert">
                      <span className="alert_icon lnr lnr-warning"></span>
                      <strong>Warning!</strong> Better check yourself, you're not looking too good.
                      <button
                        type="button"
                        className="close"
                        onClick={() => dismissAlert("warning")}
                        aria-label="Close"
                      >
                        <span className="lnr lnr-cross" aria-hidden="true"></span>
                      </button>
                    </div>
                  )}
                  {alerts.danger && (
                    <div className="alert alert-danger" role="alert">
                      <span className="alert_icon lnr lnr-warning"></span>
                      <strong>Oh snap!</strong> Change a few things up and try submitting again.
                      <button
                        type="button"
                        className="close"
                        onClick={() => dismissAlert("danger")}
                        aria-label="Close"
                      >
                        <span className="lnr lnr-cross" aria-hidden="true"></span>
                      </button>
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

