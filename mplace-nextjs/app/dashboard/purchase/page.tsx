"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Preloader from "@/components/Preloader";
import ScrollToTop from "@/components/ScrollToTop";
import Breadcrumb from "@/components/common/Breadcrumb";
import DashboardMenu from "@/components/dashboard/DashboardMenu";
import Image from "next/image";
import Link from "next/link";
import { withBasePath, getApiUrl } from "@/utils/paths";

interface PurchaseItem {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  license: string;
  author: string;
  authorId?: string;
  authorUsername?: string | null;
  category: {
    name: string;
    icon: string;
  };
  price: string;
  rating: number | null;
  isRated: boolean;
  productId?: string;
  productSlug?: string;
}

export default function DashboardPurchasePage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
  const [totalPurchases, setTotalPurchases] = useState(0);
  const [error, setError] = useState<string>("");

  // Pagination and filtering state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [sortBy, setSortBy] = useState("date-desc");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // Dummy data for fallback
  const getDummyData = (): PurchaseItem[] => [
    {
      id: "1",
      title: "Finance and Consulting Business Theme",
      description:
        "Nunc placerat mi id nisi inter dum mollis. Praesent phare...",
      image: "/images/pur1.jpg",
      date: "26 Jun 2016",
      license: "Regular",
      author: "BackTheme",
      category: { name: "Wordpress", icon: "/images/catword.png" },
      price: "$59",
      rating: null,
      isRated: false,
    },
    {
      id: "2",
      title: "Visibility Manager Subscriptions",
      description:
        "Nunc placerat mi id nisi inter dum mollis. Praesent phare...",
      image: "/images/pur2.jpg",
      date: "26 Jun 2016",
      license: "Regular",
      author: "Taklatheme",
      category: { name: "HTML5", icon: "/images/cathtm.png" },
      price: "$39",
      rating: 5,
      isRated: true,
    },
    {
      id: "3",
      title: "Product Enquiry Extension",
      description:
        "Nunc placerat mi id nisi inter dum mollis. Praesent phare...",
      image: "/images/pur3.jpg",
      date: "23 oct 2016",
      license: "Regular",
      author: "Themexylum",
      category: { name: "Wordpress", icon: "/images/catword.png" },
      price: "$59",
      rating: null,
      isRated: false,
    },
    {
      id: "4",
      title: "Appspress Multipurpose Applanding page",
      description:
        "Nunc placerat mi id nisi inter dum mollis. Praesent phare...",
      image: "/images/pur4.jpg",
      date: "14 Feb 2016",
      license: "Extended",
      author: "liontech",
      category: { name: "Wordpress", icon: "/images/catword.png" },
      price: "$59",
      rating: null,
      isRated: false,
    },
    {
      id: "5",
      title: "Rida - Portfolio / Resume wordpress theme",
      description:
        "Nunc placerat mi id nisi inter dum mollis. Praesent phare...",
      image: "/images/pur5.jpg",
      date: "30 Jul 2016",
      license: "Regular",
      author: "Foxilac",
      category: { name: "Wordpress", icon: "/images/catword.png" },
      price: "$59",
      rating: 5,
      isRated: true,
    },
  ];

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        // If user is logged in, fetch real purchases
        if (session?.user) {
          const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            sortBy: sortBy,
          });

          const response = await fetch(
            getApiUrl(`/api/purchases?${params.toString()}`)
          );

          if (response.ok) {
            const data = await response.json();
            setPurchases(data.purchases || []);
            setTotalPurchases(data.pagination?.total || 0);
            setPagination(
              data.pagination || {
                page: 1,
                limit: 12,
                total: 0,
                totalPages: 1,
                hasNextPage: false,
                hasPreviousPage: false,
              }
            );
          } else {
            // If API fails, use dummy data
            const dummyData = getDummyData();
            setPurchases(dummyData);
            setTotalPurchases(dummyData.length);
          }
        } else {
          // If not logged in, use dummy data
          const dummyData = getDummyData();
          setPurchases(dummyData);
          setTotalPurchases(dummyData.length);
        }
      } catch (error: any) {
        setError(error?.message || "Failed to load purchases.");
        setPurchases([]);
      } finally {
        setLoading(false);
      }
    };

    // Wait for session to load
    if (status === "loading") {
      return;
    }

    fetchPurchases();
  }, [session, status, page, limit, sortBy]);

  const renderStars = (rating: number | null) => {
    if (!rating) {
      return Array.from({ length: 5 }, (_, i) => (
        <li key={i}>
          <span className="fa fa-star-o"></span>
        </li>
      ));
    }

    return Array.from({ length: 5 }, (_, i) => {
      if (i < rating) {
        return (
          <li key={i}>
            <span className="fa fa-star"></span>
          </li>
        );
      }
      return (
        <li key={i}>
          <span className="fa fa-star-o"></span>
        </li>
      );
    });
  };

  return (
    <div className="preload dashboard-page dashboard_purchase">
      <Preloader />
      <Header />
      <Breadcrumb
        pageTitle="Author's Purchase"
        paths={[
          { name: "Dashboard", link: "/dashboard" },
          { name: "Purchase", link: "/dashboard/purchase" },
        ]}
      />

      <section className="dashboard-area dashboard_purchase">
        <DashboardMenu />

        <div className="dashboard_contents">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="filter-bar clearfix filter-bar2">
                  <div className="dashboard__title pull-left">
                    <h3>Your Purchases</h3>
                  </div>

                  <div className="pull-right">
                    <div className="filter__option filter--text">
                      <p>
                        <span>{totalPurchases}</span> Products Purchased
                      </p>
                    </div>

                    <div className="filter__option filter--select">
                      <div className="select-wrap">
                        <select
                          name="sortBy"
                          value={sortBy}
                          onChange={(e) => {
                            setSortBy(e.target.value);
                            setPage(1); // Reset to first page when sorting changes
                          }}
                        >
                          <option value="date-desc">Date: Newest First</option>
                          <option value="date-asc">Date: Oldest First</option>
                          <option value="price-low">Price: Low to High</option>
                          <option value="price-high">Price: High to Low</option>
                        </select>
                        <span className="lnr lnr-chevron-down"></span>
                      </div>
                    </div>
                    <div className="filter__option filter--select">
                      <div className="select-wrap">
                        <select
                          name="limit"
                          value={limit}
                          onChange={(e) => {
                            setLimit(Number(e.target.value));
                            setPage(1); // Reset to first page when limit changes
                          }}
                        >
                          <option value="12">12 Items per page</option>
                          <option value="15">15 Items per page</option>
                          <option value="25">25 Items per page</option>
                          <option value="50">50 Items per page</option>
                        </select>
                        <span className="lnr lnr-chevron-down"></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="product_archive">
              <div className="title_area">
                <div className="row">
                  <div className="col-md-5">
                    <h4>Product Details</h4>
                  </div>
                  <div className="col-md-3">
                    <h4 className="add_info">Additional Info</h4>
                  </div>
                  <div className="col-md-2">
                    <h4>Price</h4>
                  </div>
                  <div className="col-md-2">
                    <h4>Download</h4>
                  </div>
                </div>
              </div>

              <div className="row">
                {loading ? (
                  <div className="col-md-12">
                    <div className="text-center" style={{ padding: "60px 0" }}>
                      <p>Loading purchases...</p>
                    </div>
                  </div>
                ) : purchases.length === 0 ? (
                  <div className="col-md-12">
                    <div className="text-center" style={{ padding: "60px 0" }}>
                      <p>No purchases found</p>
                    </div>
                  </div>
                ) : (
                  purchases.map((purchase) => (
                    <div key={purchase.id} className="col-md-12">
                      <div className="single_product clearfix">
                        <div className="row">
                          <div className="col-lg-5 col-md-5">
                            <div className="product__description">
                              <Image
                                src={withBasePath(purchase.image)}
                                alt="Purchase image"
                                width={100}
                                height={80}
                              />
                              <div className="short_desc">
                                <h4>
                                  {purchase.productSlug ? (
                                    <Link
                                      href={`/single-product/${purchase.productSlug}`}
                                    >
                                      {purchase.title}
                                    </Link>
                                  ) : (
                                    purchase.title
                                  )}
                                </h4>
                                <p>{purchase.description}</p>
                              </div>
                            </div>
                          </div>

                          <div className="col-lg-3 col-md-3 col-6 xs-fullwidth">
                            <div className="product__additional_info">
                              <ul>
                                <li>
                                  <p>
                                    <span>Date: </span> {purchase.date}
                                  </p>
                                </li>
                                <li className="license">
                                  <p>
                                    <span>Licence:</span> {purchase.license}
                                  </p>
                                </li>
                                <li>
                                  <p>
                                    <span>Author:</span>{" "}
                                    {purchase.authorUsername ? (
                                      <Link
                                        href={`/author?username=${purchase.authorUsername}`}
                                      >
                                        {purchase.author}
                                      </Link>
                                    ) : (
                                      purchase.author
                                    )}
                                  </p>
                                </li>
                                <li>
                                  <Link href="#">
                                    <Image
                                      src={withBasePath(purchase.category.icon)}
                                      alt=""
                                      width={20}
                                      height={20}
                                    />
                                    {purchase.category.name}
                                  </Link>
                                </li>
                              </ul>
                            </div>
                          </div>

                          <div className="col-lg-4 col-md-4 col-6 xs-fullwidth">
                            <div className="product__price_download">
                              <div className="item_price v_middle">
                                <span>{purchase.price}</span>
                              </div>
                              <div className="item_action v_middle">
                                <a href="#" className="btn btn--md btn--round">
                                  Download Item
                                </a>
                                {purchase.isRated ? (
                                  <a
                                    href="#"
                                    className="btn btn--md btn--round btn--white rating--btn"
                                  >
                                    <div className="rating product--rating">
                                      <ul>{renderStars(purchase.rating)}</ul>
                                    </div>
                                  </a>
                                ) : (
                                  <a
                                    href="#"
                                    className="btn btn--md btn--round btn--white rating--btn not--rated"
                                  >
                                    <p className="rate_it">Rate Now</p>
                                    <div className="rating product--rating">
                                      <ul>{renderStars(null)}</ul>
                                    </div>
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {pagination.totalPages > 1 && (
                <div className="row">
                  <div className="col-md-12">
                    <div className="pagination-area pagination-area2">
                      <nav className="navigation pagination" role="navigation">
                        <div className="nav-links">
                          <button
                            className={`prev page-numbers ${
                              !pagination.hasPreviousPage ? "disabled" : ""
                            }`}
                            onClick={() => {
                              if (pagination.hasPreviousPage) {
                                setPage(page - 1);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }
                            }}
                            disabled={!pagination.hasPreviousPage}
                            style={{
                              cursor: pagination.hasPreviousPage
                                ? "pointer"
                                : "not-allowed",
                              opacity: pagination.hasPreviousPage ? 1 : 0.5,
                            }}
                          >
                            <span className="lnr lnr-arrow-left"></span>
                          </button>

                          {Array.from(
                            { length: pagination.totalPages },
                            (_, i) => i + 1
                          )
                            .filter((pageNum) => {
                              // Show first page, last page, current page, and pages around current
                              if (
                                pageNum === 1 ||
                                pageNum === pagination.totalPages
                              )
                                return true;
                              if (Math.abs(pageNum - page) <= 1) return true;
                              return false;
                            })
                            .map((pageNum, index, array) => {
                              // Add ellipsis if there's a gap
                              const showEllipsisBefore =
                                index > 0 && pageNum - array[index - 1] > 1;
                              return (
                                <span key={pageNum}>
                                  {showEllipsisBefore && (
                                    <span className="page-numbers dots">
                                      ...
                                    </span>
                                  )}
                                  <button
                                    className={`page-numbers ${
                                      pageNum === page ? "current" : ""
                                    }`}
                                    onClick={() => {
                                      setPage(pageNum);
                                      window.scrollTo({
                                        top: 0,
                                        behavior: "smooth",
                                      });
                                    }}
                                    style={{
                                      cursor: "pointer",
                                    }}
                                  >
                                    {pageNum}
                                  </button>
                                </span>
                              );
                            })}

                          <button
                            className={`next page-numbers ${
                              !pagination.hasNextPage ? "disabled" : ""
                            }`}
                            onClick={() => {
                              if (pagination.hasNextPage) {
                                setPage(page + 1);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }
                            }}
                            disabled={!pagination.hasNextPage}
                            style={{
                              cursor: pagination.hasNextPage
                                ? "pointer"
                                : "not-allowed",
                              opacity: pagination.hasNextPage ? 1 : 0.5,
                            }}
                          >
                            <span className="lnr lnr-arrow-right"></span>
                          </button>
                        </div>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <ScrollToTop />
    </div>
  );
}
