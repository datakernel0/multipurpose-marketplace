import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    const sortBy = searchParams.get("sortBy") || "newest" // newest, oldest, price-low, price-high
    const status = searchParams.get("status") || "all" // all, draft, published, archived
    const skip = (page - 1) * limit

    // Build where clause
    const whereClause: any = {
      sellerId: session.user.id,
    }

    // Filter by status if not "all"
    if (status !== "all") {
      whereClause.status = status.toUpperCase()
    }

    // Build orderBy clause
    let orderBy: any = {}
    if (sortBy === "newest") {
      orderBy = { createdAt: "desc" }
    } else if (sortBy === "oldest") {
      orderBy = { createdAt: "asc" }
    } else if (sortBy === "price-low") {
      orderBy = { price: "asc" }
    } else if (sortBy === "price-high") {
      orderBy = { price: "desc" }
    } else {
      orderBy = { createdAt: "desc" }
    }

    // Get total count for pagination
    const totalCount = await prisma.product.count({
      where: whereClause,
    })

    type ProductWithRelations = Prisma.ProductGetPayload<{
      include: {
        category: { select: { id: true; name: true; slug: true; image: true } }
        reviews: { select: { rating: true } }
        favorites: { select: { id: true } }
        orderItems: { select: { id: true } }
      }
    }>

    const products: ProductWithRelations[] = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            image: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
        favorites: {
          select: {
            id: true,
          },
        },
        orderItems: {
          select: {
            id: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    })

    // Format products
    const formattedProducts = products.map((product) => {
      const productRating =
        product.reviews.length > 0
          ? product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / product.reviews.length
          : 0

      const downloadUrl = (product as { downloadUrl?: string | null }).downloadUrl ?? null

      // Filter out ZIP files and get valid images
      const validImages = (product.images || []).filter((img: string) => {
        if (!img || typeof img !== 'string') return false
        // Filter out ZIP files and non-image files
        const lowerImg = img.toLowerCase()
        const isZip = lowerImg.endsWith('.zip')
        const isImage = lowerImg.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i)
        return !isZip && (isImage || img.startsWith('/uploads/products/'))
      })

      // Use first valid image as preview image
      // For product cards, we typically show the thumbnail (first image)
      // which is the main product image uploaded during product creation
      const previewImage = validImages.length > 0 
        ? validImages[0] 
        : "/images/p1.jpg"
      
      // Note: The first image should be the thumbnail uploaded during product creation
      // Subsequent images (index 1+) are screenshots extracted from ZIP

      return {
        id: product.id,
        slug: product.slug,
        title: product.title,
        description: product.description,
        image: previewImage,
        downloadUrl,
        price: product.price,
        salePrice: product.salePrice,
        status: product.status,
        moderationStatus: product.moderationStatus,
        category: {
          name: product.category.name,
          icon: product.category.image || "/images/cathtm.png",
        },
        rating: productRating,
        favorites: product.favorites.length,
        sales: product.orderItems.length,
        views: product.views || 0,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      }
    })

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      products: formattedProducts,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 })
  }
}
