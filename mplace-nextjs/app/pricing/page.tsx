"use client"

import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import Breadcrumb from "@/components/common/Breadcrumb"
import Link from "next/link"

export default function PricingPage() {
  return (
    <div className="preload pricing-page">
      <Preloader />
      <Header />
      <Breadcrumb pageTitle="Pricing Plan" paths={[{ name: "Pricing Plan", link: "/pricing" }]} />
      <section className="pricing_area section--padding">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="section-title">
                <h1>
                  Fair and Simple
                  <span className="highlighted">Pricing</span>
                </h1>
                <p>
                  Laborum dolo rumes fugats untras. Etharums ser quidem rerum facilis dolores nemis omnis fugats. Lid est laborum
                  dolo rumes fugats untras.
                </p>
              </div>
            </div>
          </div>
          <div className="row">
            {[
              { title: "Starter", price: "69.0", color: "red" },
              { title: "Business", price: "99.00", color: "blue" },
              { title: "Agency", price: "299.00", color: "yellow" },
            ].map((plan, index) => (
              <div key={index} className="col-lg-4 col-md-6">
                <div className={`pricing ${plan.color}`}>
                  <h4 className="pricing--title">{plan.title}</h4>
                  <p className="pricing--price">
                    <sup>$</sup>
                    <span className="ammount">{plan.price}</span>/month
                  </p>
                  <div className="pricing--features">
                    <ul>
                      <li>
                        <strong>3 Months</strong> Membership
                      </li>
                      <li>
                        <strong>All Wordpress Templates</strong>
                        <span className="lnr lnr-question-circle" title="quidem rerum facilis dolores nemis omnis fugats. Lid est laborum dolo rumes fugats."></span>
                      </li>
                      <li>Forum Support</li>
                      <li>Unlimited Domain Usage</li>
                      <li>
                        <strong>1 Domain</strong> Tech Support
                        <span className="lnr lnr-question-circle" title="quidem rerum facilis dolores nemis omnis fugats. Lid est laborum dolo rumes fugats."></span>
                      </li>
                      <li>Copyright Removal</li>
                      <li>
                        <strong>Demos</strong> Included
                        <span className="lnr lnr-question-circle" title="quidem rerum facilis dolores nemis omnis fugats. Lid est laborum dolo rumes fugats."></span>
                      </li>
                      <li>Demo Pagebuilder</li>
                    </ul>
                  </div>
                  <Link href="#" className="pricing--btn">
                    Get Started Plan
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
      <ScrollToTop />
    </div>
  )
}

