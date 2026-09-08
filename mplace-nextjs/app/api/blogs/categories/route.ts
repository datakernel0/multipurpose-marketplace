import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { categoryKeywords, blogMatchesCategory } from "@/lib/blogCategories"

export async function GET() {
  try {
    // Get all blogs
    const blogs = await prisma.blog.findMany({
      select: {
        id: true,
        title: true,
        content: true,
        excerpt: true,
      },
    })

    // Count blogs per category using the same logic as search
    const categoryCounts: Record<string, number> = {}
    
    // Initialize all categories with 0
    Object.keys(categoryKeywords).forEach((category) => {
      categoryCounts[category] = 0
    })

    // Count blogs matching each category using shared matching function
    blogs.forEach((blog) => {
      Object.keys(categoryKeywords).forEach((category) => {
        if (blogMatchesCategory(blog.title, blog.excerpt, blog.content, category)) {
          categoryCounts[category] = (categoryCounts[category] || 0) + 1
        }
      })
    })

    // Format response
    const categories = Object.entries(categoryCounts).map(([name, count]) => ({
      name,
      count,
    }))

    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Error fetching blog categories:", error)
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    )
  }
}

