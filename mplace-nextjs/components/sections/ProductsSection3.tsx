import { withBasePath, getApiUrl } from "@/utils/paths";
import ProductsSection3Client from "./ProductsSection3Client";

interface ApiProduct {
  id: string;
  title: string;
  slug: string;
  price: number;
  salePrice: number | null;
  images: string[] | null;
  livePreviewUrl?: string | null;
  seller?: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
  category?: {
    id: string;
    name: string | null;
    slug: string | null;
  } | null;
  rating?: number;
  favoriteCount?: number;
  downloads?: number;
  description?: string | null;
}

interface ProductCard {
  id: string;
  slug: string;
  title: string;
  image: string;
  author: string;
  authorImg: string;
  category: string;
  priceLabel: string;
  favorites: number;
  sales: number;
  livePreviewUrl?: string | null;
}

const FALLBACK_PRODUCTS: ProductCard[] = [
  {
    id: "fallback-1",
    slug: "martplace-extension-bundle",
    title: "MartPlace Extension Bundle",
    image: withBasePath("/images/p1.jpg"),
    author: "BackTheme",
    authorImg: withBasePath("/images/auth.jpg"),
    category: "Plugin",
    priceLabel: "$10 - $50",
    favorites: 90,
    sales: 16,
    livePreviewUrl: "#",
  },
  {
    id: "fallback-2",
    slug: "mccarther-coffee-shop",
    title: "Mccarther Coffee Shop",
    image: withBasePath("/images/p2.jpg"),
    author: "BackTheme",
    authorImg: withBasePath("/images/auth2.jpg"),
    category: "Plugin",
    priceLabel: "$10",
    favorites: 48,
    sales: 50,
    livePreviewUrl: "#",
  },
  {
    id: "fallback-3",
    slug: "visibility-manager-subscriptions",
    title: "Visibility Manager Subscriptions",
    image: withBasePath("/images/p3.jpg"),
    author: "BackTheme",
    authorImg: withBasePath("/images/auth3.jpg"),
    category: "Plugin",
    priceLabel: "Free",
    favorites: 24,
    sales: 27,
    livePreviewUrl: "#",
  },
];

function resolveImage(path: string | undefined | null, fallback: string) {
  if (!path) {
    return withBasePath(fallback);
  }
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return withBasePath(path);
}

type SortOption =
  | "newest"
  | "popular"
  | "best_seller"
  | "best_rating"
  | "price_low"
  | "price_high";

const sortOptionMap: Record<SortOption, { label: string; sortBy: string }> = {
  newest: { label: "Newest Release", sortBy: "newest" },
  popular: { label: "Trending Items", sortBy: "popular" },
  best_seller: { label: "Best Seller", sortBy: "popular" },
  best_rating: { label: "Best Rating", sortBy: "rating" },
  price_low: { label: "Low Price", sortBy: "price-low" },
  price_high: { label: "High Price", sortBy: "price-high" },
};

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXTAUTH_URL?.replace(/\/api\/auth$/, "") ||
    "http://localhost:3000"
  );
}

async function fetchProducts(
  sort: SortOption
): Promise<{ products: ProductCard[]; error?: string }> {
  const sortBy = sortOptionMap[sort]?.sortBy ?? "newest";

  // Construct the API URL properly with basePath
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXTAUTH_URL?.replace(/\/api\/auth$/, "") ||
    "http://localhost:3000";

  // Remove basePath from baseUrl if it's already included
  let cleanBaseUrl = baseUrl;
  if (basePath && baseUrl.includes(basePath)) {
    cleanBaseUrl = baseUrl.replace(basePath, "");
  }
  cleanBaseUrl = cleanBaseUrl.replace(/\/$/, "");

  // Construct API path with basePath
  const cleanBasePath = basePath.replace(/\/$/, "");
  const apiPath = cleanBasePath
    ? `${cleanBasePath}/api/products`
    : "/api/products";
  const url = `${cleanBaseUrl}${apiPath}?limit=6&sortBy=${encodeURIComponent(
    sortBy
  )}`;

  try {
    const response = await fetch(url, { cache: "no-store" });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data?.error || "Failed to load products");
    }

    const items: ApiProduct[] = Array.isArray(data.products)
      ? data.products
      : [];

    if (items.length === 0) {
      return { products: FALLBACK_PRODUCTS };
    }

    const formatted: ProductCard[] = items.map((product) => {
      const firstImage = (product.images || []).find(
        (img) => typeof img === "string" && img.trim().length > 0
      );
      const previewImage = resolveImage(firstImage, "/images/p1.jpg");
      const authorImage = resolveImage(
        product.seller?.image || null,
        "/images/auth.jpg"
      );
      const priceLabel =
        product.salePrice != null && product.salePrice !== product.price
          ? `$${product.salePrice.toFixed(2)} - $${product.price.toFixed(2)}`
          : `$${product.price.toFixed(2)}`;

      return {
        id: product.id,
        slug: product.slug,
        title: product.title,
        image: previewImage,
        author: product.seller?.name || "Unknown Seller",
        authorImg: authorImage,
        category: product.category?.name || "Marketplace Item",
        priceLabel,
        favorites: product.favoriteCount ?? 0,
        sales: product.downloads ?? 0,
        livePreviewUrl: product.livePreviewUrl,
      };
    });

    return { products: formatted };
  } catch (error) {
    return { products: FALLBACK_PRODUCTS, error: "Unable to load products" };
  }
}

export default async function ProductsSection3({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const sortParam = resolvedParams?.sort;
  const activeSort = (Array.isArray(sortParam) ? sortParam[0] : sortParam) as
    | SortOption
    | undefined;
  const sortOption: SortOption = sortOptionMap[activeSort || "newest"]
    ? (activeSort as SortOption)
    : "newest";

  const { products, error } = await fetchProducts(sortOption);

  return (
    <ProductsSection3Client
      products={products}
      error={error}
      activeSort={sortOption}
    />
  );
}
