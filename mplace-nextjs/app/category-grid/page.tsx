import { Suspense } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import SearchArea from "@/components/product/SearchArea"
import FilterArea2 from "@/components/product/FilterArea2"
import ProductSidebar from "@/components/product/ProductSidebar"
import CategoryGridProducts from "@/components/product/CategoryGridProducts"
import CallToActionSection from "@/components/sections/CallToActionSection"
import { getProducts, Product, ProductsResponse } from "@/app/all-products/page"

export const dynamic = 'force-dynamic'

export default async function CategoryGridPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const productsData = await getProducts(params)
  const currentPage = parseInt(params.page as string) || 1
  const limit = parseInt(params.limit as string) || 12
  const totalPages = Math.ceil(productsData.total / limit)

  return (
    <div className="preload home3">
      <Preloader />
      <Header />
      <SearchArea />
      <FilterArea2 />
      <section className="products section--padding2">
        <div className="container">
          <div className="row">
            <div className="col-lg-3">
              <ProductSidebar />
            </div>
            <div className="col-lg-9">
              <Suspense fallback={<div className="text-center">Loading products...</div>}>
                <CategoryGridProducts
                  initialProducts={productsData.products}
                  total={productsData.total}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  limit={limit}
                  searchParams={params}
                />
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

