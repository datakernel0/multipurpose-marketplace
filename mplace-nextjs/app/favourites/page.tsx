import { Suspense } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import Breadcrumb from "@/components/common/Breadcrumb"
import FilterArea2 from "@/components/product/FilterArea2"
import FavoritesGrid from "@/components/product/FavoritesGrid"
import CallToActionSection from "@/components/sections/CallToActionSection"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default function FavouritesPage() {
  return (
    <div className="preload favourites-page">
      <Preloader />
      <Header />
      <Breadcrumb pageTitle="Your Favourites" paths={[{ name: "Favorites", link: "/favourites" }]} />

      <Suspense fallback={<div className="filter-area"><div className="container"><div className="row"><div className="col-md-12"><div className="filter-bar"></div></div></div></div></div>}>
        <FilterArea2 showTextFilters={false} />
      </Suspense>

      <section className="products">
        <div className="container">
          <Suspense fallback={<div>Loading favorites...</div>}>
            <FavoritesGrid />
          </Suspense>
          <div className="row">
            <div className="col-md-12">
              <div className="pagination-area">
                <nav className="navigation pagination" role="navigation">
                  <div className="nav-links">
                    <Link className="prev page-numbers" href="#">
                      <span className="lnr lnr-arrow-left"></span>
                    </Link>
                    <Link className="page-numbers current" href="#">
                      1
                    </Link>
                    <Link className="page-numbers" href="#">
                      2
                    </Link>
                    <Link className="page-numbers" href="#">
                      3
                    </Link>
                    <Link className="next page-numbers" href="#">
                      <span className="lnr lnr-arrow-right"></span>
                    </Link>
                  </div>
                </nav>
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

