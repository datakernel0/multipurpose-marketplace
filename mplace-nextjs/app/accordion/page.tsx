"use client"

import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import Breadcrumb from "@/components/common/Breadcrumb"
import { useState } from "react"

export default function AccordionPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const accordionItems = [
    {
      id: "collapse1",
      panelId: "panel-one",
      title: "How to write the changelog for theme updates?",
      content:
        "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceleris que the mattis, leo quam aliquet congue placerat mi id nisi interdum mollis. Aliquip placeat salvia cillum iphone. Seitan aliquip quis cardigan american apparel, butcher. Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceleris que the mattis, leo quam aliquet congue placerat mi id nisi interdum mollis. Aliquip placeat salvia cillum iphone. Seitan aliquip quis cardigan american apparel, butcher .",
    },
    {
      id: "collapse2",
      panelId: "panel-two",
      title: "Why do I need to login to purchase an item on DigiPro?",
      content:
        "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceleris que the mattis, leo quam aliquet congue placerat mi id nisi interdum mollis. Aliquip placeat salvia cillum iphone. Seitan aliquip quis cardigan american apparel, butcher. Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceleris que the mattis, leo quam aliquet congue placerat mi id nisi interdum mollis. Aliquip placeat salvia cillum iphone. Seitan aliquip quis cardigan american apparel, butcher .",
    },
    {
      id: "collapse3",
      panelId: "panel-three",
      title: "How to create an account on DigiPro?",
      content:
        "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceleris que the mattis, leo quam aliquet congue placerat mi id nisi interdum mollis. Aliquip placeat salvia cillum iphone. Seitan aliquip quis cardigan american apparel, butcher. Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceleris que the mattis, leo quam aliquet congue placerat mi id nisi interdum mollis. Aliquip placeat salvia cillum iphone. Seitan aliquip quis cardigan american apparel, butcher .",
    },
    {
      id: "collapse4",
      panelId: "panel-four",
      title: "How to write the changelog for theme updates?",
      content:
        "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceleris que the mattis, leo quam aliquet congue placerat mi id nisi interdum mollis. Aliquip placeat salvia cillum iphone. Seitan aliquip quis cardigan american apparel, butcher. Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceleris que the mattis, leo quam aliquet congue placerat mi id nisi interdum mollis. Aliquip placeat salvia cillum iphone. Seitan aliquip quis cardigan american apparel, butcher .",
    },
    {
      id: "collapse5",
      panelId: "panel-five",
      title: "Do you recommend using a download manager software?",
      content:
        "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceleris que the mattis, leo quam aliquet congue placerat mi id nisi interdum mollis. Aliquip placeat salvia cillum iphone. Seitan aliquip quis cardigan american apparel, butcher. Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceleris que the mattis, leo quam aliquet congue placerat mi id nisi interdum mollis. Aliquip placeat salvia cillum iphone. Seitan aliquip quis cardigan american apparel, butcher .",
    },
    {
      id: "collapse6",
      panelId: "panel-six",
      title: "How to purchase an item on DigiPro?",
      content:
        "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceleris que the mattis, leo quam aliquet congue placerat mi id nisi interdum mollis. Aliquip placeat salvia cillum iphone. Seitan aliquip quis cardigan american apparel, butcher. Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceleris que the mattis, leo quam aliquet congue placerat mi id nisi interdum mollis. Aliquip placeat salvia cillum iphone. Seitan aliquip quis cardigan american apparel, butcher .",
    },
  ]

  return (
    <div className="preload accordion-page">
      <Preloader />
      <Header />
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Accordions", active: true }]} title="Accordions" />
      <section className="section--padding2 bgcolor">
        <div className="container">
          <div className="row">
            <div className="col-md-8 offset-md-2 col-sm-12">
              <div className="shortcode_modules">
                <div className="modules__title">
                  <h3>Basic Accordion</h3>
                </div>
                <div className="modules__content">
                  <div className="panel-group accordion" role="tablist" id="accordion">
                    {accordionItems.map((item) => (
                      <div key={item.id} className="panel accordion__single" id={item.panelId}>
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
                              aria-controls={item.id}
                            >
                              <span>{item.title}</span>
                              <i className={`lnr lnr-chevron-down indicator ${openItems[item.id] ? "open" : ""}`}></i>
                            </a>
                          </h4>
                        </div>
                        <div
                          id={item.id}
                          className={`panel-collapse collapse ${openItems[item.id] ? "show" : ""}`}
                          aria-labelledby={item.panelId}
                          data-parent="#accordion"
                        >
                          <div className="panel-body">
                            <p>{item.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
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

