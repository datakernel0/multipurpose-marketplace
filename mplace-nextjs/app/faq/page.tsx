"use client"

import { useState, useEffect } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import Breadcrumb from "@/components/common/Breadcrumb"
import Link from "next/link"

interface FAQ {
  id: string
  question: string
  answer: string
}

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})
  const [faqItems, setFaqItems] = useState<FAQ[]>([])

  useEffect(() => {
    async function fetchFAQs() {
      try {
        const response = await fetch("/api/faqs?category=For Authors")
        const data = await response.json()
        setFaqItems(
          data.map((faq: any, index: number) => ({
            id: `collapse${index + 1}`,
            question: faq.question,
            answer: faq.answer,
          }))
        )
      } catch (error) {
      }
    }
    fetchFAQs()
  }, [])

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }


  return (
    <div className="preload faq-page">
      <Preloader />
      <Header />
      <Breadcrumb pageTitle="Authors FAQs" paths={[{ name: "FAQs", link: "/faq" }, { name: "For Authors", link: "/faq" }]} />
      <section className="faq_area section--padding">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <div className="cardify faq_module">
                <div className="faq-title">
                  <span className="lnr lnr-file-add"></span>
                  <h4>For Authors ({faqItems.length})</h4>
                </div>
                <div className="faqs">
                  <div className="panel-group accordion" role="tablist" id="accordion">
                    {faqItems.map((item) => (
                      <div key={item.id} className="panel accordion__single">
                        <div className="single_acco_title">
                          <h4>
                            <a
                              href={`#${item.id}`}
                              className={openItems[item.id] ? "" : "collapsed"}
                              onClick={(e) => {
                                e.preventDefault()
                                toggleItem(item.id)
                              }}
                              aria-expanded={openItems[item.id]}
                            >
                              <span>{item.question}</span>
                              <i className={`lnr lnr-chevron-down indicator ${openItems[item.id] ? "open" : ""}`}></i>
                            </a>
                          </h4>
                        </div>
                        <div
                          id={item.id}
                          className={`panel-collapse collapse ${openItems[item.id] ? "show" : ""}`}
                          data-parent="#accordion"
                        >
                          <div className="panel-body">
                            <p>{item.answer}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <aside className="sidebar faq--sidebar">
                <div className="sidebar-card faq--card">
                  <div className="faq-title">
                    <span className="lnr lnr-file-add"></span>
                    <h4>For Buyers (36)</h4>
                  </div>
                  <div className="collapsible-content">
                    <ul className="card-content">
                      {[
                        "How can I update a theme that is live on MartPlace?",
                        "How to write the changelog for theme updates?",
                        "Why my item has been rejected?",
                        "I've submitted an item, how much time will require to be live on?",
                        "What links or texts can I put in the item description, demo and downloadable package?",
                      ].map((link, index) => (
                        <li key={index}>
                          <Link href="#">
                            <span></span>
                            {link}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link href="#" className="btn btn--round btn--sm btn--faq">
                      View All
                    </Link>
                  </div>
                </div>
                <div className="sidebar-card faq--card">
                  <div className="faq-title">
                    <span className="lnr lnr-file-add"></span>
                    <h4>For Community (20)</h4>
                  </div>
                  <div className="collapsible-content">
                    <ul className="card-content">
                      {[
                        "How can I update a theme that is live on MartPlace?",
                        "How to write the changelog for theme updates?",
                        "Why my item has been rejected?",
                        "I've submitted an item, how much time will require to be live on?",
                      ].map((link, index) => (
                        <li key={index}>
                          <Link href="#">
                            <span></span>
                            {link}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link href="#" className="btn btn--round btn--sm btn--faq">
                      View All
                    </Link>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>
      <Footer />
      <ScrollToTop />
    </div>
  )
}

