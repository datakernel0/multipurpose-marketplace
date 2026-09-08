"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Preloader from "@/components/Preloader";
import ScrollToTop from "@/components/ScrollToTop";
import {
  AuthorSidebar,
  type AuthorSidebarAuthor,
  type AuthorSidebarFollowButton,
} from "@/components/author/AuthorSidebar";
import Breadcrumb from "@/components/common/Breadcrumb";
import CallToActionSection from "@/components/sections/CallToActionSection";
import { getApiUrl, withBasePath } from "@/utils/paths";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";

interface AuthorBadge {
  icon: string;
  title: string;
}

interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  price: number;
  salePrice?: number | null;
  livePreviewUrl?: string | null;
  author: {
    name: string | null;
    avatar: string | null;
    username: string | null;
  };
  category: {
    name: string;
    icon: string | null;
  };
  rating: number;
  favorites: number;
  sales: number;
}

interface Author {
  id: string;
  name: string | null;
  username: string | null;
  avatar: string | null;
  signedUp: string;
  totalItems: number;
  totalSales: number;
  totalRatings: number;
  ratingCount: number;
  coverImage: string | null;
  about: string | null;
  badges: AuthorBadge[];
  followers: number;
  following: number;
  website?: string | null;
  facebookUrl?: string | null;
  twitterUrl?: string | null;
  dribbbleUrl?: string | null;
}

function AuthorPageInner() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const username = searchParams?.get("username") || "default";

  const [loading, setLoading] = useState(true);
  const [author, setAuthor] = useState<Author | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isAvailableForFreelance, setIsAvailableForFreelance] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [checkingFollow, setCheckingFollow] = useState(true);
  const [message, setMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const sidebarAuthor = useMemo<AuthorSidebarAuthor | null>(
    () =>
      author
        ? {
            id: author.id,
            name: author.name || "Author",
            username: author.username,
            avatar: withBasePath(author.avatar || "/images/author-avatar.jpg"),
            signedUp: author.signedUp,
            followers: author.followers,
            following: author.following,
            badges: author.badges,
            facebookUrl: author.facebookUrl,
            twitterUrl: author.twitterUrl,
            dribbbleUrl: author.dribbbleUrl,
            viewerIsAuthor: session?.user?.id === author.id,
            viewerFollowsAuthor: isFollowing,
          }
        : null,
    [author, isFollowing, session?.user?.id]
  );

  useEffect(() => {
    const fetchAuthorData = async () => {
      try {
        if (!username || username === "default") {
          setError("Choose a creator profile to view.");
          setAuthor(null);
          setProducts([]);
          setLoading(false);
          return;
        }

        const response = await fetch(
          getApiUrl(`/api/authors/${encodeURIComponent(username)}`)
        );

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || "Creator profile not found.");
        }

        const data = await response.json();
        setAuthor(data.author);
        setProducts(data.products);
      } catch (error: any) {
        setError(error.message || "Creator profile is unavailable right now.");
        setAuthor(null);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthorData();
  }, [username]);

  // Check follow status
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!session?.user || !username || username === "default") {
        setCheckingFollow(false);
        return;
      }

      try {
        const response = await fetch(
          getApiUrl(`/api/authors/${encodeURIComponent(username)}/follow`)
        );
        if (response.ok) {
          const data = await response.json();
          setIsFollowing(data.isFollowing || false);
        }
      } catch (error) {
      } finally {
        setCheckingFollow(false);
      }
    };

    if (!loading && author) {
      checkFollowStatus();
    }
  }, [session, username, loading, author]);

  const handleFollow = useCallback(async () => {
    if (!session?.user) {
      alert("Please sign in to follow authors");
      return;
    }

    if (!author) return;

    try {
      if (isFollowing) {
        // Unfollow
        const response = await fetch(
          getApiUrl(`/api/authors/${encodeURIComponent(username)}/follow`),
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          setIsFollowing(false);
          setAuthor((prev) =>
            prev
              ? { ...prev, followers: Math.max(0, prev.followers - 1) }
              : null
          );
        } else {
          const data = await response.json();
          alert(data.error || "Failed to unfollow");
        }
      } else {
        // Follow
        const response = await fetch(
          getApiUrl(`/api/authors/${encodeURIComponent(username)}/follow`),
          {
            method: "POST",
          }
        );

        if (response.ok) {
          setIsFollowing(true);
          setAuthor((prev) =>
            prev ? { ...prev, followers: (prev.followers || 0) + 1 } : null
          );
        } else {
          const data = await response.json();
          alert(data.error || "Failed to follow");
        }
      }
    } catch (error: any) {
      alert("Failed to update follow status");
    }
  }, [session?.user, author, isFollowing, username]);

  const followButtonConfig = useMemo<
    AuthorSidebarFollowButton | undefined
  >(() => {
    if (!sidebarAuthor) return undefined;
    if (sidebarAuthor.viewerIsAuthor) {
      return {
        label: "It's you",
        disabled: true,
      };
    }

    return {
      label: checkingFollow
        ? "Loading..."
        : isFollowing
        ? "Following"
        : "Follow",
      onClick: () => {
        void handleFollow();
      },
      loading: checkingFollow,
      disabled: checkingFollow,
    };
  }, [sidebarAuthor, checkingFollow, isFollowing, handleFollow]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      alert("Please sign in to send a message");
      return;
    }

    if (!author) {
      alert("Author information not available");
      return;
    }

    if (!message.trim()) {
      alert("Please enter a message");
      return;
    }

    setSendingMessage(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch(getApiUrl("/api/messages/send"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiverId: author.id,
          content: message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      setSuccessMessage("Message sent successfully!");
      setMessage("");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error: any) {
      setError(error.message || "Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const renderStars = (rating: number) => {
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
  };

  if (loading) {
    return (
      <div className="preload author-page">
        <Preloader />
        <Header />
        <div className="text-center" style={{ padding: "100px 0" }}>
          <p>Loading author profile...</p>
        </div>
        <Footer />
        <ScrollToTop />
      </div>
    );
  }

  if (!author) {
    return (
      <div className="preload author-page">
        <Preloader />
        <Header />
        <div className="marketnest-empty-state container" style={{ margin: "70px auto" }}>
          <h3>Creator profile unavailable.</h3>
          <p>{error || "This creator profile could not be found."}</p>
          <Link href="/all-products" className="marketnest-button marketnest-button--primary">
            Browse Products
          </Link>
        </div>
        <Footer />
        <ScrollToTop />
      </div>
    );
  }

  return (
    <div className="preload author-page">
      <Preloader />
      <Header />
      <Breadcrumb
        pageTitle="Author's Profile"
        paths={[
          { name: "Author Profile", link: `/author?username=${username}` },
        ]}
      />

      <section className="author-profile-area">
        <div className="container">
          <div className="row">
            <div className="col-lg-4">
              <AuthorSidebar
                author={sidebarAuthor}
                activeTab="profile"
                followButton={followButtonConfig}
              >
                <div className="sidebar-card freelance-status">
                  <div className="custom-radio">
                    <input
                      type="radio"
                      id="freelance_opt"
                      name="filter_opt"
                      checked={isAvailableForFreelance}
                      onChange={() =>
                        setIsAvailableForFreelance(!isAvailableForFreelance)
                      }
                    />
                    <label htmlFor="freelance_opt">
                      <span className="circle"></span>Available for Freelance
                      work
                    </label>
                  </div>
                </div>

                <div className="sidebar-card message-card">
                  <div className="card-title">
                    <h4>Send Message</h4>
                  </div>

                  <div className="message-form">
                    <form onSubmit={handleSendMessage}>
                      <div className="form-group">
                        <textarea
                          name="message"
                          className="text_field"
                          id="author-message"
                          placeholder="Your message..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          rows={5}
                          required
                        ></textarea>
                      </div>

                      <div className="msg_submit">
                        <button
                          type="submit"
                          className="btn btn--md btn--round"
                          disabled={sendingMessage}
                        >
                          {sendingMessage ? "Sending..." : "Send Message"}
                        </button>
                      </div>
                    </form>
                    {error && <p className="text-danger mt-2">{error}</p>}
                    {successMessage && (
                      <p className="text-success mt-2">{successMessage}</p>
                    )}
                  </div>
                </div>
              </AuthorSidebar>
            </div>

            <div className="col-lg-8 col-md-12">
              <div className="row">
                <div className="col-md-4 col-sm-4">
                  <div className="author-info mcolorbg4">
                    <p>Total Items</p>
                    <h3>{author.totalItems.toLocaleString()}</h3>
                  </div>
                </div>

                <div className="col-md-4 col-sm-4">
                  <div className="author-info pcolorbg">
                    <p>Total sales</p>
                    <h3>{author.totalSales.toLocaleString()}</h3>
                  </div>
                </div>

                <div className="col-md-4 col-sm-4">
                  <div className="author-info scolorbg">
                    <p>Total Ratings</p>
                    <div className="rating product--rating">
                      <ul>{renderStars(author.totalRatings)}</ul>
                      <span className="rating__count">
                        ({author.ratingCount})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="col-md-12 col-sm-12">
                  {author.coverImage && (
                    <div className="author_module">
                      <Image
                        src={withBasePath(author.coverImage)}
                        alt="author cover"
                        width={800}
                        height={300}
                      />
                    </div>
                  )}

                  {author.about && (
                    <div className="author_module about_author">
                      <h2>
                        About <span>{author.name || "Author"}</span>
                      </h2>
                      <p>{author.about}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="row">
                <div className="col-md-12">
                  <div className="product-title-area">
                    <div className="product__title">
                      <h2>Newest Products</h2>
                    </div>

                    <Link
                      href={`/author/items?username=${username}`}
                      className="btn btn--sm"
                    >
                      See all Items
                    </Link>
                  </div>
                </div>

                {products.length > 0 ? (
                  products.map((product) => (
                    <div key={product.id} className="col-lg-6 col-md-6">
                      <div className="product product--card">
                        <div className="product__thumbnail">
                          <Image
                            src={withBasePath(
                              product.image || "/images/p4.jpg"
                            )}
                            alt="Product Image"
                            width={370}
                            height={0}
                            style={{ width: "100%", height: "auto" }}
                          />
                          <div className="prod_btn">
                            <Link
                              href={`/single-product/${
                                product.slug || product.id
                              }`}
                              className="transparent btn--sm btn--round"
                            >
                              More Info
                            </Link>
                            {product.livePreviewUrl ? (
                              <a
                                href={product.livePreviewUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="transparent btn--sm btn--round"
                              >
                                Live Demo
                              </a>
                            ) : (
                              <Link
                                href={`/single-product/${
                                  product.slug || product.id
                                }`}
                                className="transparent btn--sm btn--round"
                                style={{
                                  opacity: 0.5,
                                  cursor: "not-allowed",
                                  pointerEvents: "none",
                                }}
                              >
                                Live Demo
                              </Link>
                            )}
                          </div>
                        </div>

                        <div className="product-desc">
                          <Link
                            href={`/single-product/${
                              product.slug || product.id
                            }`}
                            className="product_title"
                          >
                            <h4>{product.title}</h4>
                          </Link>
                          <ul className="titlebtm">
                            <li>
                              <Image
                                className="auth-img"
                                src={withBasePath(
                                  product.author.avatar || "/images/auth3.jpg"
                                )}
                                alt="author image"
                                width={25}
                                height={25}
                              />
                              <p>
                                <Link
                                  href={`/author?username=${
                                    product.author.username || author.id
                                  }`}
                                >
                                  {product.author.name || "Unknown"}
                                </Link>
                              </p>
                            </li>
                            <li className="product_cat">
                              <Link href="#">
                                <Image
                                  src={withBasePath(
                                    product.category.icon ||
                                      "/images/cathtm.png"
                                  )}
                                  alt="category image"
                                  width={20}
                                  height={20}
                                />
                                {product.category.name}
                              </Link>
                            </li>
                          </ul>

                          <p>{product.description.substring(0, 100)}...</p>
                        </div>

                        <div className="product-purchase">
                          <div className="price_love">
                            <span>
                              $
                              {product.salePrice ? (
                                <>
                                  <span
                                    style={{
                                      textDecoration: "line-through",
                                      color: "#999",
                                      marginRight: "5px",
                                    }}
                                  >
                                    ${product.price}
                                  </span>
                                  ${product.salePrice}
                                </>
                              ) : (
                                product.price
                              )}
                            </span>
                            <p>
                              <span className="lnr lnr-heart"></span>{" "}
                              {product.favorites}
                            </p>
                          </div>

                          <div className="rating product--rating">
                            <ul>{renderStars(product.rating)}</ul>
                          </div>

                          <div className="sell">
                            <p>
                              <span className="lnr lnr-cart"></span>
                              <span>{product.sales}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-md-12">
                    <p style={{ textAlign: "center", padding: "40px" }}>
                      No products found
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <CallToActionSection />
      <Footer />
      <ScrollToTop />
    </div>
  );
}

export default function AuthorPage() {
  return (
    <Suspense
      fallback={
        <div className="preload author-single-page">
          <Preloader />
          <Header />
          <ScrollToTop />
        </div>
      }
    >
      <AuthorPageInner />
    </Suspense>
  );
}
