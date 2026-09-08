import { Metadata } from "next"
import BlogSingleClient from "@/components/blog/BlogSingleClient"
import { getApiUrl } from "@/utils/paths"

export const dynamic = "force-dynamic"

async function getBlog(slug: string) {
  try {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""
    let baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL?.replace(/\/api\/auth$/, "") || "http://localhost:3000"

    // Remove basePath from baseUrl if it's already included to prevent double prefixing
    let cleanBaseUrl = baseUrl
    if (basePath && baseUrl.includes(basePath)) {
      cleanBaseUrl = baseUrl.replace(basePath, "")
    }
    cleanBaseUrl = cleanBaseUrl.replace(/\/$/, "") // Ensure no trailing slash

    const apiPath = getApiUrl(`/api/blogs?slug=${slug}`)
    const apiUrl = `${cleanBaseUrl}${apiPath}` // Correctly combine base, basePath, and API path
    
    const response = await fetch(apiUrl, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      return null
    }

    const blog = await response.json()
    return blog
  } catch (error) {
    console.error("Error fetching blog:", error)
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const blog = await getBlog(id)

  if (!blog) {
    return {
      title: "Blog Post | MartPlace",
      description: "Read our latest blog post",
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL?.replace(/\/api\/auth$/, "") || "http://localhost:3000"
  const imageUrl = blog.image.startsWith("http") ? blog.image : `${baseUrl}${blog.image}`

  return {
    title: `${blog.title} | MartPlace`,
    description: blog.excerpt || blog.title,
    openGraph: {
      title: blog.title,
      description: blog.excerpt || blog.title,
      images: [imageUrl],
      type: "article",
      publishedTime: blog.publishedAt,
      authors: blog.author?.name ? [blog.author.name] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.excerpt || blog.title,
      images: [imageUrl],
    },
  }
}

export default async function SingleBlogPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <BlogSingleClient postId={id} />
}

