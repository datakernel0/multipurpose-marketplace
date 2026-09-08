import Link from "next/link";
import Image from "next/image";
import { withBasePath, getApiUrl } from "@/utils/paths";

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
  avgRating?: number;
  favoriteCount?: number;
  downloads?: number;
  description?: string | null;
}

interface ProductCard {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  author: string;
  authorImg: string;
  category: string;
  priceLabel: string;
  favorites: number;
  sales: number;
  rating: number;
  livePreviewUrl?: string | null;
}

const FALLBACK_PRODUCTS: ProductCard[] = [];

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

function renderStars(rating: number) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(
        <li key={i}>
          <span className="fa fa-star"></span>
        </li>
      );
    } else if (rating >= i - 0.5) {
      stars.push(
        <li key={i}>
          <span className="fa fa-star-half-o"></span>
        </li>
      );
    } else {
      stars.push(
        <li key={i}>
          <span className="fa fa-star-o"></span>
        </li>
      );
    }
  }
  return stars;
}

interface ProductsSectionProps {
  products: ProductCard[];
  error?: string;
  loading?: boolean;
  activeSort: SortOption;
}

function ProductsSectionClient({
  products,
  error,
  loading,
  activeSort,
}: ProductsSectionProps) {
  const sortOptions: SortOption[] = [
    "newest",
    "popular",
    "best_rating",
    "price_low",
    "price_high",
  ];

  return (
    <section className="products section--padding">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="product-title-area">
              <div className="product__title">
                <h2>New Digital Products</h2>
              </div>

              <div className="filter__menu">
                <p>Filter by:</p>
                <div className="filter__menu_icon">
                  <img
                    className="svg"
                    src={withBasePath("/images/svg/menu.svg")}
                    alt="menu icon"
                  />
                  <ul
                    className="filter_dropdown dropdown-menu"
                    aria-labelledby="drop1"
                  >
                    {sortOptions.map((option) => (
                      <li
                        key={`dropdown-${option}`}
                        className={activeSort === option ? "active" : undefined}
                      >
                        <Link href={`/?sort=${option}#newest-products`}>
                          {sortOptionMap[option].label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="row">
            <div className="col-md-12">
              <div className="alert alert-warning">{error}</div>
            </div>
          </div>
        )}

        <div className="row">
          <div className="col-md-12">
            <div className="sorting">
              <ul>
                {sortOptions.map((option) => (
                  <li
                    className={activeSort === option ? "active" : undefined}
                    key={option}
                  >
                    <Link href={`/?sort=${option}#newest-products`}>
                      {sortOptionMap[option].label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="row">
          {products.length === 0 ? (
            <div className="col-md-12">
              <div className="marketnest-empty-state">
                <h3>No products yet.</h3>
                <p>New digital products will appear here as creators publish their work.</p>
              </div>
            </div>
          ) : products.map((product) => (
            <div key={product.id} className="col-lg-4 col-md-6">
              <div className="product product--card">
                <div className="product__thumbnail">
                  <Image
                    src={product.image}
                    alt={product.title}
                    width={400}
                    height={300}
                    className="img-fluid"
                  />
                  <div className="prod_btn">
                    <Link
                      href={`/single-product/${product.slug}`}
                      className="transparent btn--sm btn--round"
                    >
                      More Info
                    </Link>
                    {product.livePreviewUrl ? (
                      <Link
                        href={product.livePreviewUrl}
                        className="transparent btn--sm btn--round"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Live Demo
                      </Link>
                    ) : null}
                  </div>
                </div>

                <div className="product-desc">
                  <Link
                    href={`/single-product/${product.slug}`}
                    className="product_title"
                  >
                    <h4>{product.title}</h4>
                  </Link>
                  <ul className="titlebtm">
                    <li>
                      <Image
                        className="auth-img"
                        src={product.authorImg}
                        alt={product.author}
                        width={40}
                        height={40}
                      />
                      <p>
                        <Link href="#">{product.author}</Link>
                      </p>
                    </li>
                    <li className="product_cat">
                      <Link href="#">
                        <span className="lnr lnr-book"></span>
                        {product.category}
                      </Link>
                    </li>
                  </ul>

                  <p>{product.description || ""}</p>
                </div>

                <div className="product-purchase">
                  <div className="price_love">
                    <span>{product.priceLabel}</span>
                    <p>
                      <span className="lnr lnr-heart"></span>{" "}
                      {product.favorites}
                    </p>
                  </div>
                  <div className="sell">
                    <p>
                      <span className="lnr lnr-cart"></span>
                      <span>{product.sales}</span>
                    </p>
                  </div>
                  <div className="rating product--rating">
                    <ul>{renderStars(product.rating)}</ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {loading && (
          <div className="row">
            <div className="col-md-12 text-center">
              <p>Loading latest products...</p>
            </div>
          </div>
        )}
      </div>
    </section>
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
  const url = `${cleanBaseUrl}${apiPath}?limit=9&sortBy=${encodeURIComponent(
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
      return { products: [] };
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
          ? `$${product.salePrice.toFixed(2)}`
          : `$${product.price.toFixed(2)}`;

      return {
        id: product.id,
        slug: product.slug,
        title: product.title,
        description: product.description || "",
        image: previewImage,
        author: product.seller?.name || "Seller details unavailable",
        authorImg: authorImage,
        category: product.category?.name || "Marketplace Item",
        priceLabel,
        favorites: product.favoriteCount ?? 0,
        sales: product.downloads ?? 0,
        rating: product.avgRating ?? product.rating ?? 0,
        livePreviewUrl: product.livePreviewUrl,
      };
    });

    return { products: formatted };
  } catch (error) {
    return { products: [], error: "Products are unavailable right now." };
  }
}

export default async function ProductsSection({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
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
    <div id="newest-products">
      <ProductsSectionClient
        products={products}
        error={error}
        loading={false}
        activeSort={sortOption}
      />
    </div>
  );
}
