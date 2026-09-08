"use client"

import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import Image from "next/image"
import Link from "next/link"
import { withBasePath } from "@/utils/paths"

export default function NotFound() {
  return (
    <div className="preload 404-page">
      <Preloader />
      <Header />
      <section className="four_o_four_area section--padding2">
        <div className="container">
          <div className="row">
            <div className="col-md-6 offset-md-3 text-center">
              <Image src={withBasePath("/images/404.png")} alt="404 page" width={500} height={400} />
              <div className="not_found">
                <h3>Oops! Page Not Found</h3>
                <Link href="/" className="btn btn--round btn--default">
                  Back to Home
                </Link>
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

