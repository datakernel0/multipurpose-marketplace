"use client"

import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import Breadcrumb from "@/components/common/Breadcrumb"
import CallToActionSection from "@/components/sections/CallToActionSection"
import Image from "next/image"
import Link from "next/link"
import { withBasePath } from "@/utils/paths"

export default function HowItWorksPage() {
  return (
    <div className="preload how-it-works-page">
      <Preloader />
      <Header />
      <Breadcrumb pageTitle="Become a MarketNest Seller" subtitle="& Share Your Digital Products" paths={[{ name: "How It Works", link: "/how-it-works" }]} />
      <section className="how_it_works">
        <div className="how_it_works_module">
          <div className="container">
            <div className="row">
              <div className="col-lg-5 col-md-6 v_middle">
                <div className="area_image">
                  <Image src={withBasePath("/images/1.png")} alt="area images" width={500} height={400} />
                </div>
              </div>
              <div className="col-lg-5 col-md-6 offset-lg-2 v_middle">
                <div className="area_content">
                  <h2>Create a Free Account</h2>
                  <p>
                    Nunc placerat mi id nisi interdum mollis. Praesent pharetra justo ut sceler isque the mattis, leo quam aliquet
                    congue this there placerat mi id nisi interdum mollis. Praesent pharetra justo ut scelerisque the mattis, leo
                    quam aliquet. Nunc placer atmi id nisi interdum mollis quam.
                  </p>
                  <Link href="#" className="btn btn--default btn--white btn--round">
                    Register Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="how_it_works_module">
          <div className="container">
            <div className="row">
              <div className="col-lg-5 col-md-6 v_middle">
                <div className="area_content">
                  <h2>Upload Your Products</h2>
                  <p>
                    Nunc placerat mi id nisi interdum mollis. Praesent pharetra justo ut sceler isque the mattis, leo quam aliquet
                    congue this there placerat mi id nisi interdum mollis. Praesent pharetra justo ut scelerisque the mattis, leo
                    quam aliquet. Nunc placer atmi id nisi interdum mollis quam.
                  </p>
                  <Link href="#" className="btn btn--white btn--default btn--round">
                    Register Now
                  </Link>
                </div>
              </div>
              <div className="col-lg-5 col-md-6 v_middle offset-lg-2">
                <div className="area_image">
                  <Image src={withBasePath("/images/2.png")} alt="area images" width={500} height={400} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="how_it_works_module">
          <div className="container">
            <div className="row">
              <div className="col-lg-5 col-md-6 v_middle">
                <div className="area_image">
                  <Image src={withBasePath("/images/3.png")} alt="area images" width={500} height={400} />
                </div>
              </div>
              <div className="col-lg-5 col-md-6 offset-lg-2 v_middle">
                <div className="area_content">
                  <h2>Start Making Money</h2>
                  <p>
                    Nunc placerat mi id nisi interdum mollis. Praesent pharetra justo ut sceler isque the mattis, leo quam aliquet
                    congue this there placerat mi id nisi interdum mollis. Praesent pharetra justo ut scelerisque the mattis, leo
                    quam aliquet. Nunc placer atmi id nisi interdum mollis quam.
                  </p>
                  <Link href="#" className="btn btn--default btn--white btn--round">
                    Register Now
                  </Link>
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

