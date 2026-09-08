"use client"

import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import CallToActionSection from "@/components/sections/CallToActionSection"
import Breadcrumb from "@/components/common/Breadcrumb"

export default function MenuPage() {
  return (
    <div className="preload menu-page">
      <Preloader />
      <Breadcrumb pageTitle="Menu Styles" paths={[{ name: "Menu Styles", link: "/menu" }]} />
      <section className="menus section--padding">
        <div className="shortcode_wrapper">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="feature_title">
                  <h3>Menu Style 1</h3>
                </div>
              </div>
            </div>
          </div>
          <div className="menu-area">
            <Header />
          </div>
        </div>

        <div className="shortcode_wrapper">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="feature_title">
                  <h3>Menu Style 2</h3>
                </div>
              </div>
            </div>
          </div>
          <div className="menu-area menu--style2">
            <Header />
          </div>
        </div>

        <div className="shortcode_wrapper">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="feature_title">
                  <h3>Menu Style 3</h3>
                </div>
              </div>
            </div>
          </div>
          <div className="menu-area menu--style3">
            <Header />
          </div>
        </div>

        <div className="shortcode_wrapper">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="feature_title">
                  <h3>Menu Style 4</h3>
                </div>
              </div>
            </div>
          </div>
          <div className="menu-area menu--style4">
            <Header />
          </div>
        </div>

        <div className="shortcode_wrapper">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="feature_title">
                  <h3>Menu Style 5</h3>
                </div>
              </div>
            </div>
          </div>
          <div className="menu-area menu--style5">
            <Header />
          </div>
        </div>

        <div className="shortcode_wrapper">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="feature_title">
                  <h3>Menu Style 6</h3>
                </div>
              </div>
            </div>
          </div>
          <div className="menu-area menu--style6">
            <Header />
          </div>
        </div>
      </section>
      <CallToActionSection />
      <Footer />
      <ScrollToTop />
    </div>
  )
}

