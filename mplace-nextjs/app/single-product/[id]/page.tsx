"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Preloader from "@/components/Preloader";
import ScrollToTop from "@/components/ScrollToTop";
import MoreProductsSection from "@/components/product/MoreProductsSection";
import SingleProductBreadcrumb from "@/components/product/SingleProductBreadcrumb";
import SingleProductContent from "@/components/product/SingleProductContent";
import CallToActionSection from "@/components/sections/CallToActionSection";
import { getApiUrl } from "@/utils/paths";
import { useParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: string;
  priceMin: number;
  priceMax: number;
  livePreviewUrl?: string | null;
  category: {
    name: string;
    slug: string;
    parent?: {
      name: string;
      slug: string;
    };
  };
  seller: {
    id: string;
    name: string;
    username: string | null;
    avatar: string;
    signedUp: string;
    facebookUrl?: string | null;
    twitterUrl?: string | null;
    dribbbleUrl?: string | null;
  };
  images: Array<{
    id: number;
    url: string;
    thumbnail: string;
  }>;
  metadata: {
    totalSales: number;
    favorites: number;
    comments: number;
    reviews: number;
    rating: number;
  };
  productInfo: {
    released: string;
    updated: string;
    version: string;
    layout: string;
    retinaReady: string;
    filesIncluded: string;
    browser: string;
    bootstrap: string;
    tags: string[];
  };
  pricingOptions: Array<{
    id: string;
    label: string;
    price: number;
  }>;
  isFavorited?: boolean;
}

// Dummy product data for fallback
function getDummyProduct(slug: string): Product {
  return {
    id: "dummy-1",
    title: "Beborn - Multipurpose WordPress Landing Page",
    slug: slug || "beborn-multipurpose-wordpress-landing-page",
    description:
      "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet congue placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scel erisque the mattis, leo quam aliquet congue justo ut scelerisque. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet congue justo ut scelerisque.",
    livePreviewUrl: null,
    price: "$20 - $60",
    priceMin: 20,
    priceMax: 60,
    category: {
      name: "Corporate & Business",
      slug: "corporate-business",
      parent: {
        name: "Wordpress",
        slug: "wordpress",
      },
    },
    seller: {
      id: "dummy-seller",
      name: "BackTheme",
      username: "backtheme",
      avatar: "/images/author-avatar.jpg",
      signedUp: "08 April 2016",
      facebookUrl: null,
      twitterUrl: null,
      dribbbleUrl: null,
    },
    images: Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      url: "/images/itprv.jpg",
      thumbnail: `/images/thumb${(i % 5) + 1}.jpg`,
    })),
    metadata: {
      totalSales: 426,
      favorites: 240,
      comments: 35,
      reviews: 26,
      rating: 4.5,
    },
    productInfo: {
      released: "16 June 2015",
      updated: "28 July 2016",
      version: "1.2",
      layout: "Responsive",
      retinaReady: "No",
      filesIncluded: "Html, CSS, JavaScript",
      browser: "IE10, IE11, Firefox, Safari, Opera, Chrome5",
      bootstrap: "Bootstrap 4",
      tags: [
        "business",
        "template",
        "onepage",
        "creative",
        "responsive",
        "corporate",
        "Bootstrap3",
        "html5",
      ],
    },
    pricingOptions: [
      { id: "opt1", label: "Single Site License", price: 20 },
      { id: "opt2", label: "2 Sites License", price: 40 },
      { id: "opt3", label: "Multi Site License", price: 60 },
    ],
    isFavorited: false,
  };
}

function SingleProductPageContent() {
  const params = useParams();
  const slug = (params?.id as string) || "";
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          getApiUrl(`/api/products?slug=${encodeURIComponent(slug)}`),
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ error: "Product not found" }));

          // Use dummy data on error instead of throwing
          setProduct(getDummyProduct(slug));
          setError(errorData.error || "Product not found");
          setLoading(false);
          return;
        }

        const data = await response.json();

        // Transform API response to match component interface
        // data.images should contain: [thumbnail, screenshot1, screenshot2, ...]
        // Filter out any ZIP files that might have been saved before ZIP extraction was implemented
        const validImages = (data.images || []).filter((img: string) => {
          if (!img || typeof img !== "string") return false;
          // Filter out ZIP files and non-image files
          const lowerImg = img.toLowerCase();
          const isZip = lowerImg.endsWith(".zip");
          const isImage = lowerImg.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i);
          return !isZip && (isImage || img.startsWith("/uploads/products/"));
        });

        const images =
          validImages.length > 0
            ? validImages.map((img: string, index: number) => ({
                id: index + 1,
                url: img, // Full image URL for preview slider
                thumbnail: img, // Same image for thumbnail (can be optimized later to use smaller versions)
              }))
            : [
                {
                  id: 1,
                  url: "/images/itprv.jpg",
                  thumbnail: "/images/itprv.jpg",
                },
              ];

        // Calculate sales from orderItems (if available)
        const totalSales = data.orderItems?.length || data.downloads || 0;

        // Format product info
        const productInfo = {
          released: new Date(data.createdAt).toLocaleDateString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
          updated: new Date(data.updatedAt).toLocaleDateString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
          version: "1.0",
          layout: "Responsive",
          retinaReady:
            data.retinaReady !== undefined
              ? data.retinaReady
                ? "Yes"
                : "No"
              : "Unknown",
          filesIncluded:
            Array.isArray(data.filesIncluded) && data.filesIncluded.length > 0
              ? data.filesIncluded.join(", ")
              : "Html, CSS, JavaScript",
          browser:
            Array.isArray(data.compatibleBrowsers) &&
            data.compatibleBrowsers.length > 0
              ? data.compatibleBrowsers.join(", ")
              : "All Modern Browsers",
          bootstrap: "Bootstrap 5",
          tags: data.tags
            ? typeof data.tags === "string"
              ? data.tags
                  .split(",")
                  .map((tag: string) => tag.trim())
                  .filter((tag: string) => tag.length > 0)
              : Array.isArray(data.tags)
              ? data.tags
              : []
            : [],
        };

        // Pricing options (single price or range)
        const pricingOptions = data.salePrice
          ? [
              { id: "opt1", label: "Regular License", price: data.price },
              { id: "opt2", label: "Sale Price", price: data.salePrice },
            ]
          : [{ id: "opt1", label: "Regular License", price: data.price }];

        const formattedProduct: Product = {
          id: data.id,
          title: data.title,
          slug: data.slug,
          description: data.description || "",
          livePreviewUrl: data.livePreviewUrl || null,
          price: data.salePrice
            ? `$${data.price} - $${data.salePrice}`
            : `$${data.price}`,
          priceMin: data.salePrice
            ? parseFloat(data.salePrice)
            : parseFloat(data.price),
          priceMax: parseFloat(data.price),
          category: {
            name: data.category?.name || "Uncategorized",
            slug: data.category?.slug || "uncategorized",
          },
          seller: {
            id: data.seller?.id || "unknown",
            name: data.seller?.name || "Unknown",
            username: data.seller?.username || null,
            avatar: data.seller?.image || "/images/author-avatar.jpg",
            signedUp: data.seller?.createdAt
              ? new Date(data.seller.createdAt).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "Unknown",
            facebookUrl: data.seller?.facebookUrl || null,
            twitterUrl: data.seller?.twitterUrl || null,
            dribbbleUrl: data.seller?.dribbbleUrl || null,
          },
          images,
          metadata: {
            totalSales,
            favorites: data.favoriteCount || 0,
            comments: data.commentCount || 0,
            reviews: data.reviewCount || 0,
            rating: data.rating || 0,
          },
          productInfo,
          pricingOptions,
          isFavorited: Boolean(data.isFavorited),
        };

        setProduct(formattedProduct);
        setError(""); // Clear any previous errors
      } catch (error: any) {
        setError(error.message || "Failed to load product");
        // Use dummy data on error
        setProduct(getDummyProduct(slug));
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    } else {
      setProduct(getDummyProduct(""));
      setLoading(false);
    }
  }, [slug]);

  if (loading || !product) {
    return (
      <div className="preload home3">
        <Preloader />
        <Header />
        <div className="text-center" style={{ padding: "100px 0" }}>
          <p>Loading product...</p>
        </div>
        <Footer />
        <ScrollToTop />
      </div>
    );
  }

  return (
    <div className="preload home3">
      <Preloader />
      <Header />
      {error && (
        <div
          className="container"
          style={{ marginTop: "20px", marginBottom: "20px" }}
        >
          <div
            className="alert alert-warning"
            style={{
              padding: "15px",
              backgroundColor: "#fff3cd",
              color: "#856404",
              borderRadius: "4px",
            }}
          >
            <strong>Note:</strong> Product not found in database. Showing sample
            data.
          </div>
        </div>
      )}
      <SingleProductBreadcrumb product={product} />
      <SingleProductContent product={product} />
      <MoreProductsSection sellerId={product.seller.id} />
      <CallToActionSection />
      <Footer />
      <ScrollToTop />
    </div>
  );
}

export default function SingleProductPage() {
  return (
    <Suspense
      fallback={
        <div className="preload home3">
          <Preloader />
          <Header />
          <div className="text-center" style={{ padding: "100px 0" }}>
            <p>Loading...</p>
          </div>
          <Footer />
          <ScrollToTop />
        </div>
      }
    >
      <SingleProductPageContent />
    </Suspense>
  );
}
