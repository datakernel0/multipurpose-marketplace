"use client";

import { useRef, useState, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
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
  tags?: string | string[] | null;
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
  description?: string | null;
  favoriteCount?: number;
  downloads?: number;
  rating?: number | null;
}

interface FeaturedCard {
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
  tags: string[];
  livePreviewUrl?: string | null;
}

const FALLBACK_FEATURED: FeaturedCard[] = [];

function resolveImage(path: string | undefined | null, fallback: string) {
  if (!path) {
    return withBasePath(fallback);
  }
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return withBasePath(path);
}

export default function FeaturedProductsSection() {
  const sliderRef = useRef<Slider>(null);
  const [featured, setFeatured] = useState<FeaturedCard[]>(FALLBACK_FEATURED);

  const next = () => {
    sliderRef.current?.slickNext();
  };

  const prev = () => {
    sliderRef.current?.slickPrev();
  };

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const fetchProducts = async (query: string) => {
          const response = await fetch(getApiUrl(query), {
            cache: "no-store",
          });
          if (!response.ok) {
            throw new Error("Failed to load featured products");
          }
          const data = await response.json();
          return (data.products || []) as ApiProduct[];
        };

        let items = await fetchProducts(
          "/api/products?limit=6&sortBy=popular&featured=true"
        );

        if (items.length === 0) {
          items = await fetchProducts("/api/products?limit=6&sortBy=popular");
        }

        if (items.length === 0) {
          setFeatured([]);
          return;
        }

        const formatted = items.map((product) => {
          const firstImage = (product.images || []).find(
            (img) => typeof img === "string" && img.trim().length > 0
          );
          const previewImage = resolveImage(firstImage, "/images/featprod.jpg");
          const authorImage = resolveImage(
            product.seller?.image || null,
            "/images/auth.jpg"
          );
          const priceLabel =
            product.salePrice != null && product.salePrice !== product.price
              ? `$${product.salePrice.toFixed(2)}`
              : `$${product.price.toFixed(2)}`;
          const rawTags = Array.isArray(product.tags)
            ? product.tags
            : typeof product.tags === "string"
            ? product.tags
                .split(",")
                .map((tag) => tag.trim())
                .filter((tag) => tag.length > 0)
            : [];
          const tags = rawTags.slice(0, 6);
          const rating =
            typeof product.rating === "number" && !Number.isNaN(product.rating)
              ? product.rating
              : 0;

          return {
            id: product.id,
            slug: product.slug,
            title: product.title,
            description: product.description || "",
            image: previewImage,
            author: product.seller?.name || "Unknown Seller",
            authorImg: authorImage,
            category: product.category?.name || "Marketplace Item",
            priceLabel,
            favorites: product.favoriteCount ?? 0,
            sales: product.downloads ?? 0,
            rating,
            tags,
            livePreviewUrl: product.livePreviewUrl,
          };
        });

        setFeatured(formatted);
      } catch (error) {
        setFeatured([]);
      }
    };

    loadFeatured();
  }, []);

  const settings = {
    dots: false,
    infinite: featured.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: false,
  };

  return (
    <section className="featured-products bgcolor section--padding">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="product-title-area">
              <div className="product__title">
                <h2>Featured Digital Products</h2>
              </div>
              <div className="product__slider-nav rounded">
                <span
                  className="lnr lnr-chevron-left nav_left"
                  onClick={prev}
                ></span>
                <span
                  className="lnr lnr-chevron-right nav_right"
                  onClick={next}
                ></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="row">
          <div className="col-md-12 no0-padding">
              {featured.length === 0 ? (
                <div className="marketnest-empty-state">
                  <h3>No featured products yet.</h3>
                  <p>Featured digital products will appear here as creators publish their work.</p>
                </div>
              ) : (
              <div className="featured-product-slider prod-slider1">
              <Slider ref={sliderRef} {...settings}>
                {featured.map((product) => (
                  <div key={product.id} className="featured__single-slider">
                    <div className="featured__preview-img">
                      <Image
                        src={product.image}
                        alt={product.title}
                        width={630}
                        height={420}
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

                    <div className="featured__product-description">
                      <div className="product-desc desc--featured">
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
                              width={50}
                              height={50}
                            />
                            <p>
                              <Link href="#">{product.author}</Link>
                            </p>
                          </li>
                          <li className="product_cat">
                            <Link href="#">
                              <span className="lnr lnr-book"></span>{" "}
                              {product.category}
                            </Link>
                          </li>
                        </ul>

                        <p>{product.description}</p>
                      </div>

                      <div className="product_data">
                        <div className="tags tags--round">
                          <ul>
                            {product.tags.length === 0 ? (
                              <li>
                                <span>No tags</span>
                              </li>
                            ) : (
                              product.tags.slice(0, 3).map((tag) => (
                                <li key={`${product.id}-tag-${tag}`}>
                                  <Link
                                    href={`${withBasePath(
                                      "/search-product"
                                    )}?q=${encodeURIComponent(tag)}`}
                                  >
                                    {tag}
                                  </Link>
                                </li>
                              ))
                            )}
                          </ul>
                        </div>
                        <div className="product-purchase featured--product-purchase">
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
                            <ul>
                              {[...Array(5)].map((_, i) => {
                                const starIndex = i + 1;
                                const filled = product.rating >= starIndex;
                                const half =
                                  !filled && product.rating >= starIndex - 0.5;
                                return (
                                  <li key={starIndex}>
                                    <span
                                      className={`fa ${
                                        filled
                                          ? "fa-star"
                                          : half
                                          ? "fa-star-half-o"
                                          : "fa-star-o"
                                      }`}
                                    ></span>
                                  </li>
                                );
                              })}
                              <li className="rating__value">
                                {product.rating > 0
                                  ? product.rating.toFixed(1)
                                  : "0.0"}
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </Slider>
            </div>
              )}
          </div>
        </div>
      </div>
    </section>
  );
}
