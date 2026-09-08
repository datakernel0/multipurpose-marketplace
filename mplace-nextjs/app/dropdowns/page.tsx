"use client"

import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import CallToActionSection from "@/components/sections/CallToActionSection"
import Breadcrumb from "@/components/common/Breadcrumb"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"

export default function DropdownsPage() {
  const [hoverDropdown1, setHoverDropdown1] = useState(false)
  const [hoverDropdown2, setHoverDropdown2] = useState(false)
  const [clickDropdown1, setClickDropdown1] = useState(false)
  const [clickDropdown2, setClickDropdown2] = useState(false)
  const dropdown1Ref = useRef<HTMLDivElement>(null)
  const dropdown2Ref = useRef<HTMLDivElement>(null)
  const clickDropdown1Ref = useRef<HTMLDivElement>(null)
  const clickDropdown2Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (clickDropdown1Ref.current && !clickDropdown1Ref.current.contains(event.target as Node)) {
        setClickDropdown1(false)
      }
      if (clickDropdown2Ref.current && !clickDropdown2Ref.current.contains(event.target as Node)) {
        setClickDropdown2(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="preload dropdowns-page">
      <Preloader />
      <Header />
      <Breadcrumb pageTitle="Dropdowns" paths={[{ name: "Dropdowns", link: "/dropdowns" }]} />
      <section className="section--padding2 bgcolor">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="shortcode_modules">
                <div className="modules__title">
                  <h3>Dropdown On Hover</h3>
                </div>
                <div className="modules__content">
                  <div className="row">
                    <div className="col-lg-8 offset-lg-2">
                      <div className="inline">
                        <div
                          className="has_dropdown"
                          ref={dropdown1Ref}
                          onMouseEnter={() => setHoverDropdown1(true)}
                          onMouseLeave={() => setHoverDropdown1(false)}
                        >
                          <button className="btn btn--light btn--bordered btn-md">Dropdown One</button>
                          {hoverDropdown1 && (
                            <div className="dropdowns dropdown--author">
                              <ul>
                                <li>
                                  <Link href="/author">
                                    <span className="lnr lnr-user"></span>Profile
                                  </Link>
                                </li>
                                <li>
                                  <Link href="/dashboard">
                                    <span className="lnr lnr-home"></span> Dashboard
                                  </Link>
                                </li>
                                <li>
                                  <Link href="/dashboard-setting">
                                    <span className="lnr lnr-cog"></span> Setting
                                  </Link>
                                </li>
                                <li>
                                  <Link href="/cart">
                                    <span className="lnr lnr-cart"></span>Purchases
                                  </Link>
                                </li>
                                <li>
                                  <Link href="/favourites">
                                    <span className="lnr lnr-heart"></span> Favourite
                                  </Link>
                                </li>
                                <li>
                                  <Link href="/dashboard-add-credit">
                                    <span className="lnr lnr-dice"></span>Add Credits
                                  </Link>
                                </li>
                                <li>
                                  <Link href="/dashboard-statement">
                                    <span className="lnr lnr-chart-bars"></span>Sale Statement
                                  </Link>
                                </li>
                                <li>
                                  <Link href="/dashboard-upload">
                                    <span className="lnr lnr-upload"></span>Upload Item
                                  </Link>
                                </li>
                                <li>
                                  <Link href="/dashboard-manage-item">
                                    <span className="lnr lnr-book"></span>Manage Item
                                  </Link>
                                </li>
                                <li>
                                  <Link href="/dashboard-withdrawal">
                                    <span className="lnr lnr-briefcase"></span>Withdrawals
                                  </Link>
                                </li>
                                <li>
                                  <Link href="#">
                                    <span className="lnr lnr-exit"></span>Logout
                                  </Link>
                                </li>
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="inline pull-right">
                        <div
                          className="has_dropdown"
                          ref={dropdown2Ref}
                          onMouseEnter={() => setHoverDropdown2(true)}
                          onMouseLeave={() => setHoverDropdown2(false)}
                        >
                          <button className="btn btn--light btn--bordered btn-md">Dropdown Two</button>
                          {hoverDropdown2 && (
                            <div className="dropdowns dropdown--menu">
                              <ul>
                                <li>
                                  <Link href="/all-products">Recent Items</Link>
                                </li>
                                <li>
                                  <Link href="/all-products">Popular Items</Link>
                                </li>
                                <li>
                                  <Link href="/index3">Free Templates</Link>
                                </li>
                                <li>
                                  <Link href="#">Follow Feed</Link>
                                </li>
                                <li>
                                  <Link href="#">Top Authors</Link>
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

              <div className="shortcode_modules">
                <div className="modules__title">
                  <h3>Dropdown On Click</h3>
                </div>
                <div className="modules__content">
                  <div className="row">
                    <div className="col-lg-8 offset-lg-2">
                      <div className="inline">
                        <div className="has_dropdown" ref={clickDropdown1Ref}>
                          <a
                            href="#"
                            className="dropdown-toggle btn btn--bordered btn-md"
                            onClick={(e) => {
                              e.preventDefault()
                              setClickDropdown1(!clickDropdown1)
                            }}
                            aria-haspopup="true"
                            aria-expanded={clickDropdown1}
                          >
                            Dropdown One
                          </a>
                          {clickDropdown1 && (
                            <ul className={`custom_dropdown messaging_dropdown dropdown-menu show`} aria-labelledby="drop2">
                            <li>
                              <Link href="#">
                                <span className="lnr lnr-inbox"></span>Inbox
                              </Link>
                            </li>
                            <li>
                              <Link href="#">
                                <span className="fa fa-star-o"></span>Starred
                              </Link>
                            </li>
                            <li>
                              <Link href="#">
                                <span className="lnr lnr-dice"></span>Sent
                              </Link>
                            </li>
                            <li>
                              <Link href="#">
                                <span className="lnr lnr-trash"></span>Trash
                              </Link>
                            </li>
                          </ul>
                          )}
                        </div>
                      </div>

                      <div className="inline pull-right">
                        <div className="has_dropdown" ref={clickDropdown2Ref}>
                          <a
                            href="#"
                            className="dropdown-toggle btn btn--bordered btn-md"
                            onClick={(e) => {
                              e.preventDefault()
                              setClickDropdown2(!clickDropdown2)
                            }}
                            aria-haspopup="true"
                            aria-expanded={clickDropdown2}
                          >
                            Dropdown Two
                          </a>
                          {clickDropdown2 && (
                            <ul className={`custom_dropdown dropdown-menu show`} aria-labelledby="drop3">
                            <li>
                              <Link href="#">Mark as unread</Link>
                            </li>
                            <li>
                              <Link href="#">Dropdown link</Link>
                            </li>
                            <li>
                              <Link href="#">All Attachments</Link>
                            </li>
                          </ul>
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

