import { Suspense } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import SearchArea from "@/components/product/SearchArea"
import FilterArea from "@/components/product/FilterArea"
import ProductsGrid from "@/components/product/ProductsGrid"
import CallToActionSection from "@/components/sections/CallToActionSection"
import { getApiUrl } from "@/utils/paths"

// Force dynamic rendering to ensure fresh data on each request
export const dynamic = 'force-dynamic'

interface Product {
  id: string
  title: string
  slug: string
  price: number
  salePrice?: number | null
  images: string[]
  livePreviewUrl?: string | null
  seller: {
    id: string
    name: string | null
    image: string | null
  } | null
  category: {
    id: string
    name: string
    slug: string
  } | null
  rating: number
  reviewCount: number
  favoriteCount: number
  downloads: number
  views: number
  featured: boolean
  description: string
  tags?: string | null
}

interface ProductsResponse {
  products: Product[]
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

async function getProducts(searchParams: { [key: string]: string | string[] | undefined }): Promise<ProductsResponse> {
  const params = new URLSearchParams()
  
  // Add pagination params
  const page = parseInt(searchParams.page as string) || 1
  const limit = parseInt(searchParams.limit as string) || 9
  const offset = (page - 1) * limit
  params.append("limit", limit.toString())
  params.append("offset", offset.toString())

  // Add filter params
  if (searchParams.category) params.append("category", searchParams.category as string)
  if (searchParams.search || searchParams.q) params.append("search", (searchParams.search || searchParams.q) as string)
  if (searchParams.featured) params.append("featured", searchParams.featured as string)
  if (searchParams.minPrice) params.append("minPrice", searchParams.minPrice as string)
  if (searchParams.maxPrice) params.append("maxPrice", searchParams.maxPrice as string)
  if (searchParams.sortBy) params.append("sortBy", searchParams.sortBy as string)

  try {
    // For server-side rendering, use internal API route directly
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL?.replace(/\/api\/auth$/, "") || "http://localhost:3000"
    const apiPath = getApiUrl(`/api/products?${params.toString()}`)
    const apiUrl = `${baseUrl}${apiPath}`
    
    const response = await fetch(apiUrl, {
      cache: "no-store", // Always fetch fresh data for server-side rendering
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching products:", error)
    return {
      products: [],
      total: 0,
      limit,
      offset,
      hasMore: false,
    }
  }
}

export default async function FollowFeedPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const productsData = await getProducts(params)
  const currentPage = parseInt(params.page as string) || 1
  const limit = parseInt(params.limit as string) || 9
  const totalPages = Math.ceil(productsData.total / limit)

  return (
    <div className="preload home3">
      <Preloader />
      <Header />
      <SearchArea />
      <FilterArea />
      <section className="products">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="product-title-area">
                <div className="product__title">
                  <h2>Your Followers Feed</h2>
                </div>
              </div>
            </div>
          </div>
          <Suspense fallback={<div className="text-center">Loading products...</div>}>
            <ProductsGrid 
              initialProducts={productsData.products}
              total={productsData.total}
              currentPage={currentPage}
              totalPages={totalPages}
              limit={limit}
              searchParams={params}
            />
          </Suspense>
        </div>
      </section>
      <CallToActionSection />
      <Footer />
      <ScrollToTop />
    </div>
  )
}

