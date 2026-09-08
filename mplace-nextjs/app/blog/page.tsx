import { Suspense } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import Breadcrumb from "@/components/common/Breadcrumb"
import CallToActionSection from "@/components/sections/CallToActionSection"
import BlogsGrid from "@/components/blog/BlogsGrid"
import { getApiUrl } from "@/utils/paths"

// Force dynamic rendering to ensure fresh data on each request
export const dynamic = 'force-dynamic'

interface Blog {
  id: string
  title: string
  slug: string
  excerpt: string
  image: string
  author: {
    id: string
    name: string | null
    image: string | null
  } | null
  views: number
  commentCount: number
  publishedAt: string
}

interface BlogsResponse {
  blogs: Blog[]
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

async function getBlogs(searchParams: { [key: string]: string | string[] | undefined }): Promise<BlogsResponse> {
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
  if (searchParams.authorId) params.append("authorId", searchParams.authorId as string)

  try {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""
    let baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL?.replace(/\/api\/auth$/, "") || "http://localhost:3000"

    // Remove basePath from baseUrl if it's already included to prevent double prefixing
    let cleanBaseUrl = baseUrl
    if (basePath && baseUrl.includes(basePath)) {
      cleanBaseUrl = baseUrl.replace(basePath, "")
    }
    cleanBaseUrl = cleanBaseUrl.replace(/\/$/, "") // Ensure no trailing slash

    const apiPath = getApiUrl(`/api/blogs?${params.toString()}`)
    const apiUrl = `${cleanBaseUrl}${apiPath}` // Correctly combine base, basePath, and API path
    
    const response = await fetch(apiUrl, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch blogs: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching blogs:", error)
    return {
      blogs: [],
      total: 0,
      limit,
      offset,
      hasMore: false,
    }
  }
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const blogsData = await getBlogs(params)
  const currentPage = parseInt(params.page as string) || 1
  const limit = parseInt(params.limit as string) || 9
  const totalPages = Math.ceil(blogsData.total / limit)

  return (
    <div className="preload blog-page">
      <Preloader />
      <Header />
      <Breadcrumb pageTitle="Blog" paths={[{ name: "Blog", link: "/blog" }]} />
      <section className="blog_area section--padding2">
        <div className="container">
          <Suspense fallback={<div className="text-center">Loading blogs...</div>}>
            <BlogsGrid 
              initialBlogs={blogsData.blogs}
              total={blogsData.total}
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
