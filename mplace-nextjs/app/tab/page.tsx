"use client"

import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import CallToActionSection from "@/components/sections/CallToActionSection"
import Breadcrumb from "@/components/common/Breadcrumb"
import { useState } from "react"
import Link from "next/link"
import { withBasePath } from "@/utils/paths"
import Image from "next/image"

export default function TabPage() {
  const [activeTab1, setActiveTab1] = useState("product-details")
  const [activeTab2, setActiveTab2] = useState("product-details1")
  const [activeTab3, setActiveTab3] = useState("product-details2")
  const [activeTab4, setActiveTab4] = useState("tc5")
  const [openAccordion, setOpenAccordion] = useState<string | null>(null)

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id)
  }

  return (
    <div className="preload tab-page">
      <Preloader />
      <Header />
      <Breadcrumb pageTitle="Tabs" paths={[{ name: "Tabs", link: "/tab" }]} />
      <section className="section--padding2 bgcolor">
        <div className="shortcode_wrapper">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="shortcode_module_title">
                  <div className="dashboard__title">
                    <h3>Tab 1</h3>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-lg-8">
                <div className="shortcode_modules">
                  <div className="tab tab1">
                    <div className="item-navigation">
                      <ul className="nav nav-tabs" role="tablist">
                        <li>
                          <a
                            href="#product-details"
                            className={activeTab1 === "product-details" ? "active" : ""}
                            aria-controls="product-details"
                            role="tab"
                            onClick={(e) => {
                              e.preventDefault()
                              setActiveTab1("product-details")
                            }}
                          >
                            Item Details
                          </a>
                        </li>
                        <li>
                          <a
                            href="#product-comment"
                            className={activeTab1 === "product-comment" ? "active" : ""}
                            aria-controls="product-comment"
                            role="tab"
                            onClick={(e) => {
                              e.preventDefault()
                              setActiveTab1("product-comment")
                            }}
                          >
                            Comments
                          </a>
                        </li>
                        <li>
                          <a
                            href="#product-review"
                            className={activeTab1 === "product-review" ? "active" : ""}
                            aria-controls="product-review"
                            role="tab"
                            onClick={(e) => {
                              e.preventDefault()
                              setActiveTab1("product-review")
                            }}
                          >
                            Reviews <span>(35)</span>
                          </a>
                        </li>
                        <li>
                          <a
                            href="#product-support"
                            className={activeTab1 === "product-support" ? "active" : ""}
                            aria-controls="product-support"
                            role="tab"
                            onClick={(e) => {
                              e.preventDefault()
                              setActiveTab1("product-support")
                            }}
                          >
                            Support
                          </a>
                        </li>
                        <li>
                          <a
                            href="#product-faq"
                            className={activeTab1 === "product-faq" ? "active" : ""}
                            aria-controls="product-faq"
                            role="tab"
                            onClick={(e) => {
                              e.preventDefault()
                              setActiveTab1("product-faq")
                            }}
                          >
                            item FAQ
                          </a>
                        </li>
                      </ul>
                    </div>

                    <div className="tab-content">
                      {activeTab1 === "product-details" && (
                        <div role="tabpanel" className="fade show tab-pane product-tab active" id="product-details">
                          <div className="tab-content-wrapper">
                            <h1>Landing Page Details</h1>
                            <p>
                              Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis,
                              leo quam aliquet congue placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scel
                              erisque the mattis, leo quam aliquet congue justo ut scelerisque. Praesent pharetra, justo ut
                              scelerisque the mattis, leo quam aliquet congue justo ut scelerisque.
                            </p>
                          </div>
                        </div>
                      )}

                      {activeTab1 === "product-comment" && (
                        <div role="tabpanel" className="fade tab-pane product-tab" id="product-comment">
                          <div className="thread">
                            <ul className="media-list thread-list">
                              <li className="single-thread">
                                <div className="media">
                                  <div className="media-left">
                                    <Link href="#">
                                      <Image
                                        className="media-object"
                                        src={withBasePath("/images/m5.png")}
                                        alt="Commentator Avatar"
                                        width={64}
                                        height={64}
                                      />
                                    </Link>
                                  </div>
                                  <div className="media-body">
                                    <div>
                                      <div className="media-heading">
                                        <Link href="/author">
                                          <h4>Themexylum</h4>
                                        </Link>
                                        <span>9 Hours Ago</span>
                                      </div>
                                      <Link href="#" className="reply-link">
                                        Reply
                                      </Link>
                                    </div>
                                    <p>
                                      Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceleris que the
                                      mattis, leo quam aliquet congue placerat mi id nisi interdum mollis.
                                    </p>
                                  </div>
                                </div>
                              </li>
                            </ul>
                          </div>
                        </div>
                      )}

                      {activeTab1 === "product-review" && (
                        <div role="tabpanel" className="fade tab-pane product-tab" id="product-review">
                          <div className="thread thread_review">
                            <ul className="media-list thread-list">
                              <li className="single-thread">
                                <div className="media">
                                  <div className="media-left">
                                    <Link href="#">
                                      <Image
                                        className="media-object"
                                        src={withBasePath("/images/m1.png")}
                                        alt="Commentator Avatar"
                                        width={64}
                                        height={64}
                                      />
                                    </Link>
                                  </div>
                                  <div className="media-body">
                                    <div className="clearfix">
                                      <div className="pull-left">
                                        <div className="media-heading">
                                          <Link href="/author">
                                            <h4>Themexylum</h4>
                                          </Link>
                                          <span>9 Hours Ago</span>
                                        </div>
                                        <div className="rating product--rating">
                                          <ul>
                                            {[1, 2, 3, 4, 5].map((i) => (
                                              <li key={i}>
                                                {i <= 4 ? (
                                                  <span className="fa fa-star"></span>
                                                ) : (
                                                  <span className="fa fa-star-half-o"></span>
                                                )}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                        <span className="review_tag">support</span>
                                      </div>
                                      <Link href="#" className="reply-link">
                                        Reply
                                      </Link>
                                    </div>
                                    <p>
                                      Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceleris que the
                                      mattis, leo quam aliquet congue placerat mi id nisi interdum mollis.
                                    </p>
                                  </div>
                                </div>
                              </li>
                            </ul>
                          </div>
                        </div>
                      )}

                      {activeTab1 === "product-support" && (
                        <div role="tabpanel" className="fade tab-pane product-tab" id="product-support">
                          <div className="support">
                            <div className="support__title">
                              <h3>Contact the Author</h3>
                            </div>
                            <div className="support__form">
                              <div className="usr-msg">
                                <p>
                                  Please <Link href="/login">sign in</Link> to contact this author.
                                </p>

                                <form action="#" className="support_form">
                                  <div className="form-group">
                                    <label htmlFor="subj">Support Subject:</label>
                                    <input type="text" id="subj" className="text_field" placeholder="Enter your subject" />
                                  </div>

                                  <div className="form-group">
                                    <label htmlFor="supmsg">Support Query: </label>
                                    <textarea
                                      className="text_field"
                                      id="supmsg"
                                      name="supmsg"
                                      placeholder="Enter your text..."
                                    ></textarea>
                                  </div>
                                  <button type="submit" className="btn btn--lg btn--round">
                                    Submit Now
                                  </button>
                                </form>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab1 === "product-faq" && (
                        <div role="tabpanel" className="fade tab-pane product-tab" id="product-faq">
                          <div className="tab-content-wrapper">
                            <div className="panel-group accordion" role="tablist" id="accordion">
                              {[
                                {
                                  id: "panel-one",
                                  title: "How to write the changelog for theme updates?",
                                  content:
                                    "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceleris que the mattis, leo quam aliquet congue placerat mi id nisi interdum mollis.",
                                },
                                {
                                  id: "panel-two",
                                  title: "Why do I need to login to purchase an item on DigiPro?",
                                  content:
                                    "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceleris que the mattis, leo quam aliquet congue placerat mi id nisi interdum mollis.",
                                },
                                {
                                  id: "panel-three",
                                  title: "How to create an account on DigiPro?",
                                  content:
                                    "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceleris que the mattis, leo quam aliquet congue placerat mi id nisi interdum mollis.",
                                },
                              ].map((item) => (
                                <div key={item.id} className="panel accordion__single" id={item.id}>
                                  <div className="single_acco_title">
                                    <h4>
                                      <Link
                                        href="#"
                                        className={openAccordion === item.id ? "" : "collapsed"}
                                        onClick={(e) => {
                                          e.preventDefault()
                                          toggleAccordion(item.id)
                                        }}
                                      >
                                        <span>{item.title}</span>
                                        <i className="lnr lnr-chevron-down indicator"></i>
                                      </Link>
                                    </h4>
                                  </div>

                                  <div
                                    className={`panel-collapse collapse ${openAccordion === item.id ? "show" : ""}`}
                                    aria-labelledby={item.id}
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
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="shortcode_wrapper">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="shortcode_module_title">
                  <div className="dashboard__title">
                    <h3>Tab 2</h3>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-lg-8">
                <div className="shortcode_modules">
                  <div className="tab tab2">
                    <div className="item-navigation">
                      <ul className="nav nav-tabs nav--tabs2">
                        <li>
                          <a
                            href="#product-details1"
                            className={activeTab2 === "product-details1" ? "active" : ""}
                            aria-controls="product-details1"
                            role="tab"
                            onClick={(e) => {
                              e.preventDefault()
                              setActiveTab2("product-details1")
                            }}
                          >
                            Item Details
                          </a>
                        </li>
                        <li>
                          <a
                            href="#product-comment2"
                            className={activeTab2 === "product-comment2" ? "active" : ""}
                            aria-controls="product-comment2"
                            role="tab"
                            onClick={(e) => {
                              e.preventDefault()
                              setActiveTab2("product-comment2")
                            }}
                          >
                            Comments
                          </a>
                        </li>
                      </ul>
                    </div>

                    <div className="tab-content">
                      {activeTab2 === "product-details1" && (
                        <div className="tab-pane product-tab fade show active" id="product-details1">
                          <h1>Landing Page Details</h1>
                          <p>
                            Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo
                            quam aliquet congue placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scel erisque
                            the mattis, leo quam aliquet congue justo ut scelerisque. Praesent pharetra, justo ut scelerisque
                            the mattis, leo quam aliquet congue justo ut scelerisque.
                          </p>
                        </div>
                      )}

                      {activeTab2 === "product-comment2" && (
                        <div className="tab-pane product-tab fade" id="product-comment2">
                          <div className="thread">
                            <ul className="media-list thread-list">
                              <li className="single-thread">
                                <div className="media">
                                  <div className="media-left">
                                    <Link href="#">
                                      <Image
                                        className="media-object"
                                        src={withBasePath("/images/m3.png")}
                                        alt="Commentator Avatar"
                                        width={64}
                                        height={64}
                                      />
                                    </Link>
                                  </div>
                                  <div className="media-body">
                                    <div>
                                      <div className="media-heading">
                                        <Link href="/author">
                                          <h4>Themexylum</h4>
                                        </Link>
                                        <span>9 Hours Ago</span>
                                      </div>
                                      <Link href="#" className="reply-link">
                                        Reply
                                      </Link>
                                    </div>
                                    <p>
                                      Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceleris que the
                                      mattis, leo quam aliquet congue placerat mi id nisi interdum mollis.
                                    </p>
                                  </div>
                                </div>
                              </li>
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="shortcode_wrapper">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="shortcode_module_title">
                  <div className="dashboard__title">
                    <h3>Tab 3</h3>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12">
                <div className="shortcode_modules">
                  <div className="tab tab3">
                    <div className="item-navigation">
                      <ul className="nav nav-tabs nav--tabs2">
                        <li>
                          <a
                            href="#product-details2"
                            className={activeTab3 === "product-details2" ? "active" : ""}
                            aria-controls="product-details2"
                            role="tab"
                            onClick={(e) => {
                              e.preventDefault()
                              setActiveTab3("product-details2")
                            }}
                          >
                            <span className="lnr lnr-home"></span> Home
                          </a>
                        </li>
                        <li>
                          <a
                            href="#product-comment3"
                            className={activeTab3 === "product-comment3" ? "active" : ""}
                            aria-controls="product-comment3"
                            role="tab"
                            onClick={(e) => {
                              e.preventDefault()
                              setActiveTab3("product-comment3")
                            }}
                          >
                            <span className="lnr lnr-user"></span> Comments
                          </a>
                        </li>
                        <li>
                          <a
                            href="#tc3"
                            className={activeTab3 === "tc3" ? "active" : ""}
                            aria-controls="tc3"
                            role="tab"
                            onClick={(e) => {
                              e.preventDefault()
                              setActiveTab3("tc3")
                            }}
                          >
                            <span className="lnr lnr-envelope"></span> Message
                          </a>
                        </li>
                        <li>
                          <a
                            href="#tc4"
                            className={activeTab3 === "tc4" ? "active" : ""}
                            aria-controls="tc4"
                            role="tab"
                            onClick={(e) => {
                              e.preventDefault()
                              setActiveTab3("tc4")
                            }}
                          >
                            <span className="lnr lnr-cog"></span> Setting
                          </a>
                        </li>
                      </ul>
                    </div>

                    <div className="tab-content">
                      {activeTab3 === "product-details2" && (
                        <div className="tab-pane product-tab fade show active" id="product-details2">
                          <h1>Landing Page Details</h1>
                          <p>
                            Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo
                            quam aliquet congue placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scel erisque
                            the mattis, leo quam aliquet congue justo ut scelerisque. Praesent pharetra, justo ut scelerisque
                            the mattis, leo quam aliquet congue justo ut scelerisque.
                          </p>
                        </div>
                      )}

                      {activeTab3 === "product-comment3" && (
                        <div className="tab-pane product-tab fade" id="product-comment3">
                          <div className="thread">
                            <ul className="media-list thread-list">
                              <li className="single-thread">
                                <div className="media">
                                  <div className="media-left">
                                    <Link href="#">
                                      <Image
                                        className="media-object"
                                        src={withBasePath("/images/m3.png")}
                                        alt="Commentator Avatar"
                                        width={64}
                                        height={64}
                                      />
                                    </Link>
                                  </div>
                                  <div className="media-body">
                                    <div>
                                      <div className="media-heading">
                                        <Link href="/author">
                                          <h4>Themexylum</h4>
                                        </Link>
                                        <span>9 Hours Ago</span>
                                      </div>
                                      <Link href="#" className="reply-link">
                                        Reply
                                      </Link>
                                    </div>
                                    <p>
                                      Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceleris que the
                                      mattis, leo quam aliquet congue placerat mi id nisi interdum mollis.
                                    </p>
                                  </div>
                                </div>
                              </li>
                            </ul>
                          </div>
                        </div>
                      )}

                      {activeTab3 === "tc3" && (
                        <div className="tab-pane product-tab fade" id="tc3">
                          <h1>The Message for the mars</h1>
                          <p>
                            Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo
                            quam aliquet congue placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scel erisque
                            the mattis, leo quam aliquet congue justo ut scelerisque. Praesent pharetra, justo ut scelerisque
                            the mattis, leo quam aliquet congue justo ut scelerisque.
                          </p>
                        </div>
                      )}

                      {activeTab3 === "tc4" && (
                        <div className="tab-pane product-tab fade" id="tc4">
                          <h1>When UX meets user expectancy.</h1>
                          <p>
                            Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo
                            quam aliquet congue placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scel erisque
                            the mattis, leo quam aliquet congue justo ut scelerisque. Praesent pharetra, justo ut scelerisque
                            the mattis, leo quam aliquet congue justo ut scelerisque.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="shortcode_wrapper">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="shortcode_module_title">
                  <div className="dashboard__title">
                    <h3>Tab 4</h3>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12">
                <div className="shortcode_modules">
                  <div className="tab tab4">
                    <div className="item-navigation">
                      <ul className="nav nav-tabs nav--tabs2">
                        <li>
                          <a
                            href="#tc5"
                            className={activeTab4 === "tc5" ? "active" : ""}
                            aria-controls="tc5"
                            role="tab"
                            onClick={(e) => {
                              e.preventDefault()
                              setActiveTab4("tc5")
                            }}
                          >
                            <span className="lnr lnr-home"></span> Home
                          </a>
                        </li>
                        <li>
                          <a
                            href="#tc6"
                            className={activeTab4 === "tc6" ? "active" : ""}
                            aria-controls="tc6"
                            role="tab"
                            onClick={(e) => {
                              e.preventDefault()
                              setActiveTab4("tc6")
                            }}
                          >
                            <span className="lnr lnr-user"></span> Comments
                          </a>
                        </li>
                        <li>
                          <a
                            href="#tc7"
                            className={activeTab4 === "tc7" ? "active" : ""}
                            aria-controls="tc7"
                            role="tab"
                            onClick={(e) => {
                              e.preventDefault()
                              setActiveTab4("tc7")
                            }}
                          >
                            <span className="lnr lnr-envelope"></span> Message
                          </a>
                        </li>
                        <li>
                          <a
                            href="#tc8"
                            className={activeTab4 === "tc8" ? "active" : ""}
                            aria-controls="tc8"
                            role="tab"
                            onClick={(e) => {
                              e.preventDefault()
                              setActiveTab4("tc8")
                            }}
                          >
                            <span className="lnr lnr-cog"></span> Setting
                          </a>
                        </li>
                      </ul>
                    </div>

                    <div className="tab-content">
                      {activeTab4 === "tc5" && (
                        <div className="tab-pane fade show product-tab active" id="tc5">
                          <h1>Landing Page Details</h1>
                          <p>
                            Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo
                            quam aliquet congue placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scel erisque
                            the mattis, leo quam aliquet congue justo ut scelerisque. Praesent pharetra, justo ut scelerisque
                            the mattis, leo quam aliquet congue justo ut scelerisque.
                          </p>
                        </div>
                      )}

                      {activeTab4 === "tc6" && (
                        <div className="tab-pane fade product-tab" id="tc6">
                          <div className="thread">
                            <ul className="media-list thread-list">
                              <li className="single-thread">
                                <div className="media">
                                  <div className="media-left">
                                    <Link href="#">
                                      <Image
                                        className="media-object"
                                        src={withBasePath("/images/m3.png")}
                                        alt="Commentator Avatar"
                                        width={64}
                                        height={64}
                                      />
                                    </Link>
                                  </div>
                                  <div className="media-body">
                                    <div>
                                      <div className="media-heading">
                                        <Link href="/author">
                                          <h4>Themexylum</h4>
                                        </Link>
                                        <span>9 Hours Ago</span>
                                      </div>
                                      <Link href="#" className="reply-link">
                                        Reply
                                      </Link>
                                    </div>
                                    <p>
                                      Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceleris que the
                                      mattis, leo quam aliquet congue placerat mi id nisi interdum mollis.
                                    </p>
                                  </div>
                                </div>
                              </li>
                            </ul>
                          </div>
                        </div>
                      )}

                      {activeTab4 === "tc7" && (
                        <div className="tab-pane fade product-tab" id="tc7">
                          <h1>The Message for the mars</h1>
                          <p>
                            Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo
                            quam aliquet congue placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scel erisque
                            the mattis, leo quam aliquet congue justo ut scelerisque. Praesent pharetra, justo ut scelerisque
                            the mattis, leo quam aliquet congue justo ut scelerisque.
                          </p>
                        </div>
                      )}

                      {activeTab4 === "tc8" && (
                        <div className="tab-pane fade product-tab" id="tc8">
                          <h1>When UX meets user expectancy.</h1>
                          <p>
                            Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo
                            quam aliquet congue placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scel erisque
                            the mattis, leo quam aliquet congue justo ut scelerisque. Praesent pharetra, justo ut scelerisque
                            the mattis, leo quam aliquet congue justo ut scelerisque.
                          </p>
                        </div>
                      )}
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

