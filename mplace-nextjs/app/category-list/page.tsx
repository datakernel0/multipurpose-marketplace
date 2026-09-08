import { Suspense } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import SearchArea from "@/components/product/SearchArea"
import FilterArea2 from "@/components/product/FilterArea2"
import ProductSidebar from "@/components/product/ProductSidebar"
import CategoryListProducts from "@/components/product/CategoryListProducts"
import CallToActionSection from "@/components/sections/CallToActionSection"

export const dynamic = 'force-dynamic'

export default function CategoryListPage() {
  return (
    <div className="preload category-list-page">
      <Preloader />
      <Header />
      <Suspense fallback={<div className="search-area"><div className="container"><div className="row"><div className="col-sm-12"><div className="search_box"></div></div></div></div></div>}>
        <SearchArea />
      </Suspense>
      <Suspense fallback={<div className="filter-area"><div className="container"><div className="row"><div className="col-md-12"><div className="filter-bar"></div></div></div></div></div>}>
        <FilterArea2 showTextFilters={true} />
      </Suspense>
      <section className="products section--padding2">
        <div className="container">
          <div className="row">
            <div className="col-lg-3">
              <Suspense fallback={<div className="sidebar sidebar--product"><div className="sidebar-card"><div className="card-title"><h4>Loading...</h4></div></div></div>}>
                <ProductSidebar />
              </Suspense>
            </div>
            <div className="col-lg-9">
              <Suspense fallback={<div>Loading products...</div>}>
                <CategoryListProducts />
              </Suspense>
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

