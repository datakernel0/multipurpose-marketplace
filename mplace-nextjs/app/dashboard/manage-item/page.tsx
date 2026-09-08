"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import Breadcrumb from "@/components/common/Breadcrumb"
import DashboardMenu from "@/components/dashboard/DashboardMenu"
import Image from "next/image"
import Link from "next/link"
import { withBasePath, getApiUrl } from "@/utils/paths"

interface Product {
  id: string
  slug: string
  title: string
  description: string
  image: string
  downloadUrl: string | null
  category: {
    name: string
    icon: string
  }
  price: number
  salePrice: number | null
  status: string
  rating: number
  favorites: number
  sales: number
  views: number
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export default function DashboardManageItemPage() {
  const { data: session, status: sessionStatus } = useSession()
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [totalProducts, setTotalProducts] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(12)
  const [sortBy, setSortBy] = useState("newest")
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  })
  const [deleteModal, setDeleteModal] = useState<{
    show: boolean
    productId: string | null
    productTitle: string | null
  }>({
    show: false,
    productId: null,
    productTitle: null,
  })
  const [deleting, setDeleting] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (session?.user) {
          const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            sortBy: sortBy,
            status: "all", // Show all products including drafts
          })

          const response = await fetch(getApiUrl(`/api/products/my-products?${params.toString()}`))

          if (response.ok) {
            const data = await response.json()
            setProducts(data.products || [])
            setTotalProducts(data.pagination?.total || 0)
            setPagination(data.pagination || {
              page: 1,
              limit: 12,
              total: 0,
              totalPages: 1,
              hasNextPage: false,
              hasPreviousPage: false,
            })
          } else {
            throw new Error("Your products are unavailable right now.")
          }
        } else {
          setProducts([])
          setTotalProducts(0)
        }
      } catch (error: any) {
        setError(error?.message || "Failed to load products.")
        setProducts([])
        setTotalProducts(0)
      } finally {
        setLoading(false)
      }
    }

    if (sessionStatus !== "loading") {
      fetchProducts()
    }
  }, [session, sessionStatus, page, limit, sortBy])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest(".prod_option")) {
        setOpenDropdown(null)
      }
    }

    if (openDropdown) {
      document.addEventListener("click", handleClickOutside)
      return () => {
        document.removeEventListener("click", handleClickOutside)
      }
    }
  }, [openDropdown])

  const handleDeleteClick = (productId: string, productTitle: string) => {
    setDeleteModal({
      show: true,
      productId,
      productTitle,
    })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteModal.productId) return

    try {
      setDeleting(true)
      const response = await fetch(getApiUrl(`/api/products/${deleteModal.productId}`), {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete product")
      }

      // Close modal
      setDeleteModal({ show: false, productId: null, productTitle: null })

      // Refresh products list
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy: sortBy,
        status: "all",
      })

      const refreshResponse = await fetch(getApiUrl(`/api/products/my-products?${params.toString()}`))
      if (refreshResponse.ok) {
        const data = await refreshResponse.json()
        setProducts(data.products || [])
        setTotalProducts(data.pagination?.total || 0)
        setPagination(data.pagination || pagination)
      }
    } catch (error: any) {
      setDeleteModal((prev) => (prev ? { ...prev, error: error?.message || "Failed to delete product." } : prev))
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteModal({ show: false, productId: null, productTitle: null })
  }

  const renderStars = (rating: number | null) => {
    if (!rating) return null

    const stars = []
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push(
          <li key={i}>
            <span className="fa fa-star"></span>
          </li>
        )
      } else if (rating >= i - 0.5) {
        stars.push(
          <li key={i}>
            <span className="fa fa-star-half-o"></span>
          </li>
        )
      } else {
        stars.push(
          <li key={i}>
            <span className="fa fa-star-o"></span>
          </li>
        )
      }
    }
    return stars
  }

  return (
    <div className="preload dashboard-page">
      <Preloader />
      <Header />
      <Breadcrumb
        pageTitle="Manage Item"
        paths={[
          { name: "Dashboard", link: "/dashboard" },
          { name: "Manage Item", link: "/dashboard/manage-item" },
        ]}
      />

      <section className="dashboard-area">
        <DashboardMenu />

        <div className="dashboard_contents">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="filter-bar dashboard_title_area clearfix filter-bar2">
                  <div className="dashboard__title dashboard__title pull-left">
                    <h3>Manage Items</h3>
                  </div>

                  <div className="pull-right">
                    <div className="filter__option filter--text">
                      <p>
                        <span>{loading ? "..." : totalProducts}</span> Products
                      </p>
                    </div>

                    <div className="filter__option filter--select">
                      <div className="select-wrap">
                        <select
                          name="sortBy"
                          value={sortBy}
                          onChange={(e) => {
                            setSortBy(e.target.value)
                            setPage(1)
                          }}
                        >
                          <option value="newest">Newest First</option>
                          <option value="oldest">Oldest First</option>
                          <option value="price-low">Price : Low to High</option>
                          <option value="price-high">Price : High to Low</option>
                        </select>
                        <span className="lnr lnr-chevron-down"></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              {loading ? (
                <div className="col-md-12">
                  <div className="text-center" style={{ padding: "60px 0" }}>
                    <p>Loading products...</p>
                  </div>
                </div>
              ) : products.length === 0 ? (
                <div className="col-md-12">
                  <div className="text-center" style={{ padding: "60px 0" }}>
                    <p>No products found. <Link href="/dashboard/upload">Upload your first product</Link></p>
                  </div>
                </div>
              ) : (
                products.map((product) => (
                  <div key={product.id} className="col-lg-4 col-md-6">
                    <div className="product product--card">
                      <div className="product__thumbnail" style={{ position: "relative" }}>
                        <Image src={withBasePath(product.image)} alt="Product Image" width={370} height={0} style={{ width: "100%", height: "auto" }} />

                        <div className={`prod_option ${openDropdown === product.id ? "show" : ""}`}>
                          <a
                            href="#"
                            id={`drop-${product.id}`}
                            className="dropdown-trigger"
                            onClick={(e) => {
                              e.preventDefault()
                              setOpenDropdown(openDropdown === product.id ? null : product.id)
                            }}
                          >
                            <span className="lnr lnr-cog setting-icon"></span>
                          </a>

                          <div
                            className="options dropdown-menu"
                            aria-labelledby={`drop-${product.id}`}
                          >
                            <ul>
                              <li>
                                <Link href={`/dashboard/edit-item?id=${product.id}`}>
                                  <span className="lnr lnr-pencil"></span>Edit
                                </Link>
                              </li>
                              <li>
                                {product.downloadUrl ? (
                                  <a
                                    href={product.downloadUrl.startsWith("http://") || product.downloadUrl.startsWith("https://")
                                      ? product.downloadUrl
                                      : withBasePath(product.downloadUrl)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setOpenDropdown(null)}
                                  >
                                    <span className="lnr lnr-cloud-download"></span>Download
                                  </a>
                                ) : (
                                  <Link href={`/dashboard/edit-item?id=${product.id}`} onClick={() => setOpenDropdown(null)}>
                                    <span className="lnr lnr-warning"></span>Add Download File
                                  </Link>
                                )}
                              </li>
                              <li>
                                <a href="#">
                                  <span className="lnr lnr-eye"></span>
                                  {product.status === "PUBLISHED" ? "Hide" : "Show"}
                                </a>
                              </li>
                              <li>
                                <a
                                  href="#"
                                  className="delete"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    setOpenDropdown(null)
                                    handleDeleteClick(product.id, product.title)
                                  }}
                                >
                                  <span className="lnr lnr-trash"></span>Delete
                                </a>
                              </li>
                            </ul>
                          </div>
                        </div>

                        {product.status === "DRAFT" && (
                          <div
                            style={{
                              position: "absolute",
                              top: "10px",
                              left: "10px",
                              backgroundColor: "#ff9800",
                              color: "#fff",
                              padding: "5px 10px",
                              borderRadius: "4px",
                              fontSize: "12px",
                              fontWeight: "bold",
                            }}
                          >
                            DRAFT
                          </div>
                        )}
                      </div>

                      <div className="product-desc">
                        <Link href={`/single-product/${product.slug}`} className="product_title">
                          <h4>{product.title}</h4>
                        </Link>
                        <ul className="titlebtm">
                          <li className="product_cat">
                            <Link href="#">
                              <Image
                                src={withBasePath(product.category.icon)}
                                alt="category"
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
                            ${product.salePrice ? (
                              <>
                                <span style={{ textDecoration: "line-through", color: "#999", marginRight: "5px" }}>
                                  ${product.price}
                                </span>
                                ${product.salePrice}
                              </>
                            ) : (
                              product.price
                            )}
                          </span>
                          <p>
                            <span className="lnr lnr-heart"></span> {product.favorites}
                          </p>
                        </div>
                        {product.rating > 0 && (
                          <div className="rating product--rating">
                            <ul>{renderStars(product.rating)}</ul>
                          </div>
                        )}
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
              )}
            </div>

            {pagination.totalPages > 1 && (
              <div className="row">
                <div className="col-md-12">
                  <div className="pagination-area">
                    <nav className="navigation pagination" role="navigation">
                      <div className="nav-links">
                        <button
                          className={`prev page-numbers ${!pagination.hasPreviousPage ? "disabled" : ""}`}
                          onClick={() => {
                            if (pagination.hasPreviousPage) {
                              setPage(page - 1)
                              window.scrollTo({ top: 0, behavior: "smooth" })
                            }
                          }}
                          disabled={!pagination.hasPreviousPage}
                          style={{
                            cursor: pagination.hasPreviousPage ? "pointer" : "not-allowed",
                            opacity: pagination.hasPreviousPage ? 1 : 0.5,
                          }}
                        >
                          <span className="lnr lnr-arrow-left"></span>
                        </button>

                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                          .filter((pageNum) => {
                            if (pageNum === 1 || pageNum === pagination.totalPages) return true
                            if (Math.abs(pageNum - page) <= 1) return true
                            return false
                          })
                          .map((pageNum, index, array) => {
                            const showEllipsisBefore = index > 0 && pageNum - array[index - 1] > 1
                            return (
                              <span key={pageNum}>
                                {showEllipsisBefore && (
                                  <span className="page-numbers dots">...</span>
                                )}
                                <button
                                  className={`page-numbers ${pageNum === page ? "current" : ""}`}
                                  onClick={() => {
                                    setPage(pageNum)
                                    window.scrollTo({ top: 0, behavior: "smooth" })
                                  }}
                                  style={{
                                    cursor: "pointer",
                                  }}
                                >
                                  {pageNum}
                                </button>
                              </span>
                            )
                          })}

                        <button
                          className={`next page-numbers ${!pagination.hasNextPage ? "disabled" : ""}`}
                          onClick={() => {
                            if (pagination.hasNextPage) {
                              setPage(page + 1)
                              window.scrollTo({ top: 0, behavior: "smooth" })
                            }
                          }}
                          disabled={!pagination.hasNextPage}
                          style={{
                            cursor: pagination.hasNextPage ? "pointer" : "not-allowed",
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
        </section>

        {/* Delete Confirmation Modal */}
        {deleteModal.show && (
          <div
            className="modal fade rating_modal item_remove_modal show"
            style={{
              display: "block",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1050,
            }}
            onClick={handleDeleteCancel}
          >
            <div
              className="modal-dialog modal-lg modal-dialog-centered"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content">
                <div className="modal-header">
                  <h3 className="modal-title">Are you sure to delete this item?</h3>
                  <p>You will not be able to recover this file!</p>
                  <button
                    type="button"
                    className="close"
                    onClick={handleDeleteCancel}
                    aria-label="Close"
                  >
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  <button
                    type="button"
                    className="btn btn--round btn-danger btn--default"
                    onClick={handleDeleteConfirm}
                    disabled={deleting}
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                  <button
                    type="button"
                    className="btn btn--round modal_close"
                    onClick={handleDeleteCancel}
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <Footer />
        <ScrollToTop />
      </div>
    )
  }

