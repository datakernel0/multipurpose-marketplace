import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// Type definitions for product data structures
interface ProductRaw {
  id: string
  title: string
  slug: string
  price: number
  salePrice: number | null
  images: string[]
  livePreviewUrl: string | null
  tags: string[] | null
  downloads: number
  views: number
  featured: boolean
  description: string
  createdAt: Date
  updatedAt: Date
  sellerId: string | null
  category: {
    id: string
    name: string
    slug: string
  } | null
  reviews: Array<{ rating: number }>
  favorites: Array<{ userId: string }>
}

interface Seller {
  id: string
  name: string | null
  image: string | null
}

interface ProductWithSeller extends ProductRaw {
  seller: Seller | null
}

interface FormattedProduct {
  id: string
  title: string
  slug: string
  price: number
  salePrice: number | null
  images: string[]
  livePreviewUrl: string | null
  tags: string[]
  downloads: number
  views: number
  featured: boolean
  description: string
  createdAt: string
  updatedAt: string
  category: {
    id: string
    name: string
    slug: string
  } | null
  seller: Seller | null
  avgRating: number
  isFavorited: boolean
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const sessionUserId = session?.user?.id

    const { searchParams } = new URL(request.url)
    const slug = searchParams.get("slug")
    const category = searchParams.get("category")
    const search = searchParams.get("search") || searchParams.get("q")
    const featured = searchParams.get("featured")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const sortBy = searchParams.get("sortBy") || "newest" // newest, popular, price-low, price-high, rating
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = parseInt(searchParams.get("offset") || "0")

    // Single product by slug (or ID if slug fails)
    if (slug) {
      // Try to find by slug first
      let product = await prisma.product.findUnique({
        where: { slug },
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              image: true,
              email: true,
              createdAt: true,
              username: true,
              facebookUrl: true,
              twitterUrl: true,
              dribbbleUrl: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          reviews: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
          favorites: {
            select: {
              userId: true,
            },
          },
          orderItems: {
            select: {
              id: true,
            },
          },
        },
      })

      // If not found by slug, try to find by ID (in case the route uses ID instead of slug)
      if (!product) {
        try {
          product = await prisma.product.findUnique({
            where: { id: slug },
            include: {
              seller: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  email: true,
                  createdAt: true,
                  username: true,
                  facebookUrl: true,
                  twitterUrl: true,
                  dribbbleUrl: true,
                },
              },
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
              reviews: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      image: true,
                    },
                  },
                },
                orderBy: {
                  createdAt: "desc",
                },
              },
              favorites: {
                select: {
                  userId: true,
                },
              },
              orderItems: {
                select: {
                  id: true,
                },
              },
            },
          })
        } catch (error) {
          // ID lookup failed, product doesn't exist
        }
      }

      if (!product) {
        return NextResponse.json(
          { error: "Product not found", slug: slug },
          { status: 404 }
        )
      }

      // Check if product is published (allow viewing unpublished products for debugging)
      // In production, you might want to restrict this to only PUBLISHED products
      // or allow sellers to view their own DRAFT products
      if (product.status !== "PUBLISHED") {
        // For now, we'll allow viewing DRAFT products too
        // You can add session check here to allow sellers to view their own drafts
      }

      // Calculate average rating
      const avgRating =
        product.reviews.length > 0
          ? product.reviews.reduce((sum: number, r) => sum + r.rating, 0) / product.reviews.length
          : product.rating || 0

      const isFavorited = sessionUserId ? product.favorites.some((favorite) => favorite.userId === sessionUserId) : false
      const commentCount = await prisma.comment.count({ where: { productId: product.id } })

      return NextResponse.json({
        ...product,
        rating: avgRating,
        reviewCount: product.reviews.length,
        favoriteCount: product.favorites.length,
        commentCount,
        isFavorited,
        downloads: product.downloads || 0,
      })
    }

    // Build where clause for filtering
    // Using Record<string, unknown> to allow flexible Prisma where clause construction
    const where: Record<string, unknown> = {
      status: "PUBLISHED",
      moderationStatus: "APPROVED",
    }

    if (category) {
      where.category = {
        slug: category,
      }
    }

    if (featured === "true") {
      where.featured = true
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    if (minPrice || maxPrice) {
      const priceFilter: { gte?: number; lte?: number } = {}
      if (minPrice) {
        priceFilter.gte = parseFloat(minPrice)
      }
      if (maxPrice) {
        priceFilter.lte = parseFloat(maxPrice)
      }
      where.price = priceFilter
    }

    // Build orderBy clause
    let orderBy: Record<string, "asc" | "desc"> = {}
    switch (sortBy) {
      case "popular":
        orderBy = { downloads: "desc" }
        break
      case "price-low":
        orderBy = { price: "asc" }
        break
      case "price-high":
        orderBy = { price: "desc" }
        break
      case "rating":
        orderBy = { rating: "desc" }
        break
      case "newest":
      default:
        orderBy = { createdAt: "desc" }
        break
    }

    // Fetch products using select to avoid Prisma relation enforcement issues with broken foreign keys
    const [productsRaw, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          price: true,
          salePrice: true,
          images: true,
          livePreviewUrl: true,
          tags: true,
          downloads: true,
          views: true,
          featured: true,
          description: true,
          createdAt: true,
          updatedAt: true,
          sellerId: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          reviews: {
            select: {
              rating: true,
            },
          },
          favorites: true,
        },
        orderBy,
        take: limit,
        skip: offset,
      }),
      prisma.product.count({ where }),
    ])
    
    // Manually fetch sellers for valid sellerIds to handle broken foreign keys gracefully
    const sellerIds = [...new Set(productsRaw.map((p) => p.sellerId).filter(Boolean) as string[])]
    const sellers = sellerIds.length > 0 
      ? await prisma.user.findMany({
          where: { id: { in: sellerIds } },
          select: {
            id: true,
            name: true,
            image: true,
          },
        })
      : []
    const sellerMap = new Map<string, Seller>(sellers.map((s) => [s.id, s as Seller]))
    
    // Attach sellers to products (null for invalid sellerIds)
    // Type assertion needed because Prisma returns tags as string | null, not string[]
    const products: ProductWithSeller[] = productsRaw.map((p) => ({
      ...p,
      tags: Array.isArray(p.tags) ? p.tags : (p.tags ? [p.tags] : []),
      seller: p.sellerId ? sellerMap.get(p.sellerId) || null : null,
    })) as ProductWithSeller[]

    // Filter out products with invalid sellers and calculate average rating
    const validProducts = products.filter((product: ProductWithSeller) => product.seller !== null)
    const formattedProducts: FormattedProduct[] = validProducts.map((product: ProductWithSeller) => {
      const avgRating =
        product.reviews.length > 0
          ? product.reviews.reduce((sum: number, r) => sum + r.rating, 0) / product.reviews.length
          : 0
      const isFavorited = sessionUserId ? product.favorites.some((favorite) => favorite.userId === sessionUserId) : false

      return {
        id: product.id,
        title: product.title,
        slug: product.slug,
        price: product.price,
        salePrice: product.salePrice,
        images: product.images,
        livePreviewUrl: product.livePreviewUrl,
        seller: product.seller,
        category: product.category,
        avgRating,
        isFavorited,
        tags: product.tags || [],
        downloads: product.downloads,
        views: product.views,
        featured: product.featured,
        description: product.description,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      }
    })

    return NextResponse.json({
      products: formattedProducts,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

