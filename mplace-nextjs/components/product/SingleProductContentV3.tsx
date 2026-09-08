"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { withBasePath } from "@/utils/paths";

interface ProductImage {
  id: number;
  url: string;
  thumbnail: string;
}

interface ProductSeller {
  id: string;
  name: string;
  avatar: string;
  signedUp: string;
}

interface ProductMetadata {
  totalSales: number;
  favorites: number;
  comments: number;
  reviews: number;
  rating: number;
}

interface ProductInfo {
  released: string;
  updated: string;
  version: string;
  layout: string;
  retinaReady: string;
  filesIncluded: string;
  browser: string;
  bootstrap: string;
  tags: string[];
}

interface Product {
  id: string;
  title: string;
  description: string;
  price: string;
  priceMin: number;
  priceMax: number;
  category: {
    name: string;
    slug: string;
  };
  seller: ProductSeller;
  images: ProductImage[];
  metadata: ProductMetadata;
  productInfo: ProductInfo;
}

interface SingleProductContentV3Props {
  product: Product;
}

export default function SingleProductContentV3({
  product,
}: SingleProductContentV3Props) {
  const [activeTab, setActiveTab] = useState("product-details");

  // Mock comments data
  const comments = [
    {
      id: 1,
      author: "Themexylum",
      avatar: "/images/m1.png",
      time: "9 Hours Ago",
      tag: "Purchased",
      text: "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceleris que the mattis, leo quam aliquet congue placerat mi id nisi interdum mollis.",
      replies: [
        {
          id: 1,
          author: "BackTheme",
          avatar: "/images/m2.png",
          time: "6 Hours Ago",
          tag: "Author",
          text: "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceleris que the mattis, leo quam aliquet congue placerat mi id nisi interdum mollis.",
        },
        {
          id: 2,
          author: "Themexylum",
          avatar: "/images/m1.png",
          time: "9 Hours Ago",
          tag: "Purchased",
          text: "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceleris que the mattis, leo quam aliquet congue placerat mi id nisi interdum mollis.",
        },
      ],
    },
    {
      id: 2,
      author: "Themexylum",
      avatar: "/images/m3.png",
      time: "9 Hours Ago",
      text: "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceleris que the mattis, leo quam aliquet congue placerat mi id nisi interdum mollis.",
    },
    {
      id: 3,
      author: "Themexylum",
      avatar: "/images/m4.png",
      time: "9 Hours Ago",
      text: "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceleris que the mattis, leo quam aliquet congue placerat mi id nisi interdum mollis.",
    },
    {
      id: 4,
      author: "Themexylum",
      avatar: "/images/m5.png",
      time: "9 Hours Ago",
      text: "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceleris que the mattis, leo quam aliquet congue placerat mi id nisi interdum mollis.",
    },
  ];

  return (
    <section className="single-product-desc single-product-desc2">
      <div className="container">
        <div className="row">
          <div className="col-lg-8">
            <div className="item-preview item-preview2">
              <div className="prev-slide">
                <Image
                  src={withBasePath("/images/itprv2.jpg")}
                  alt="Product preview"
                  width={750}
                  height={500}
                />
              </div>

              <div className="item__preview-thumb">
                <div className="item-action">
                  <div className="action-btns">
                    <Link href="#" className="btn btn--round btn--lg">
                      Live Preview
                    </Link>
                    <Link href="#" className="btn btn--round btn--lg btn--icon">
                      <span className="lnr lnr-heart"></span>Add To Favorites
                    </Link>
                  </div>
                </div>
              </div>

              <div className="tab tab2">
                <div className="item-navigation">
                  <ul className="nav nav-tabs nav--tabs2">
                    <li>
                      <a
                        href="#product-details"
                        className={
                          activeTab === "product-details" ? "active" : ""
                        }
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveTab("product-details");
                        }}
                      >
                        Item Details
                      </a>
                    </li>
                    <li>
                      <a
                        href="#product-comment"
                        className={
                          activeTab === "product-comment" ? "active" : ""
                        }
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveTab("product-comment");
                        }}
                      >
                        Comments
                      </a>
                    </li>
                  </ul>
                </div>

                <div className="tab-content">
                  <div
                    className={`tab-pane product-tab fade ${
                      activeTab === "product-details" ? "show active" : ""
                    }`}
                    id="product-details"
                  >
                    <h1>Landing Page Details</h1>
                    <p>{product.description}</p>

                    <div className="item_social_share">
                      <p>
                        <Image
                          src={withBasePath("/images/svg/share.svg")}
                          alt="Share"
                          width={20}
                          height={20}
                        />
                        <span>Share this item</span>
                      </p>

                      <div className="social social--color--filled">
                        <ul>
                          <li>
                            <Link href="#">
                              <span className="fa fa-facebook"></span>
                            </Link>
                          </li>
                          <li>
                            <Link href="#">
                              <span className="fa fa-twitter"></span>
                            </Link>
                          </li>
                          <li>
                            <Link href="#">
                              <span className="fa fa-google-plus"></span>
                            </Link>
                          </li>
                          <li>
                            <Link href="#">
                              <span className="fa fa-pinterest"></span>
                            </Link>
                          </li>
                          <li>
                            <Link href="#">
                              <span className="fa fa-linkedin"></span>
                            </Link>
                          </li>
                          <li>
                            <Link href="#">
                              <span className="fa fa-dribbble"></span>
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`tab-pane product-tab fade ${
                      activeTab === "product-comment" ? "show active" : ""
                    }`}
                    id="product-comment"
                  >
                    <div className="thread">
                      <ul className="media-list thread-list">
                        {comments.map((comment) => (
                          <li key={comment.id} className="single-thread">
                            <div className="media">
                              <div className="media-left">
                                <Link href="#">
                                  <Image
                                    src={withBasePath(comment.avatar)}
                                    alt="Commentator Avatar"
                                    width={60}
                                    height={60}
                                    className="media-object"
                                  />
                                </Link>
                              </div>
                              <div className="media-body">
                                <div>
                                  <div className="media-heading">
                                    <Link href="#">
                                      <h4>{comment.author}</h4>
                                    </Link>
                                    <span>{comment.time}</span>
                                  </div>
                                  {comment.tag && (
                                    <span
                                      className={`comment-tag ${
                                        comment.tag === "Author"
                                          ? "author"
                                          : "buyer"
                                      }`}
                                    >
                                      {comment.tag}
                                    </span>
                                  )}
                                  <Link href="#" className="reply-link">
                                    Reply
                                  </Link>
                                </div>
                                <p>{comment.text}</p>
                              </div>
                            </div>

                            {comment.replies && comment.replies.length > 0 && (
                              <ul className="children">
                                {comment.replies.map((reply) => (
                                  <li
                                    key={reply.id}
                                    className="single-thread depth-2"
                                  >
                                    <div className="media">
                                      <div className="media-left">
                                        <Link href="#">
                                          <Image
                                            src={withBasePath(reply.avatar)}
                                            alt="Commentator Avatar"
                                            width={60}
                                            height={60}
                                            className="media-object"
                                          />
                                        </Link>
                                      </div>
                                      <div className="media-body">
                                        <div className="media-heading">
                                          <h4>{reply.author}</h4>
                                          <span>{reply.time}</span>
                                        </div>
                                        {reply.tag && (
                                          <span
                                            className={`comment-tag ${
                                              reply.tag === "Author"
                                                ? "author"
                                                : "buyer"
                                            }`}
                                          >
                                            {reply.tag}
                                          </span>
                                        )}
                                        <p>{reply.text}</p>
                                      </div>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            )}

                            <div className="media depth-2 reply-comment">
                              <div className="media-left">
                                <Link href="#">
                                  <Image
                                    src={withBasePath("/images/m2.png")}
                                    alt="Commentator Avatar"
                                    width={60}
                                    height={60}
                                    className="media-object"
                                  />
                                </Link>
                              </div>
                              <div className="media-body">
                                <form action="#" className="comment-reply-form">
                                  <textarea
                                    className="bla"
                                    name="reply-comment"
                                    placeholder="Write your comment..."
                                  ></textarea>
                                  <button
                                    className="btn btn--md btn--round"
                                    type="submit"
                                  >
                                    Post Comment
                                  </button>
                                </form>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>

                      <div className="pagination-area pagination-area2 text-right">
                        <nav
                          className="navigation pagination"
                          role="navigation"
                        >
                          <div className="nav-links">
                            <Link className="page-numbers current" href="#">
                              1
                            </Link>
                            <Link className="page-numbers" href="#">
                              2
                            </Link>
                            <Link className="page-numbers" href="#">
                              3
                            </Link>
                            <Link className="next page-numbers" href="#">
                              <span className="lnr lnr-arrow-right"></span>
                            </Link>
                          </div>
                        </nav>
                      </div>

                      <div className="comment-form-area">
                        <h4>Leave a comment</h4>
                        <div className="media comment-form">
                          <div className="media-left">
                            <Link href="#">
                              <Image
                                src={withBasePath("/images/m7.png")}
                                alt="Commentator Avatar"
                                width={60}
                                height={60}
                                className="media-object"
                              />
                            </Link>
                          </div>
                          <div className="media-body">
                            <form action="#" className="comment-reply-form">
                              <textarea
                                name="reply-comment"
                                placeholder="Write your comment..."
                              ></textarea>
                              <button
                                className="btn btn--sm btn--round"
                                type="submit"
                              >
                                Post Comment
                              </button>
                            </form>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <aside className="sidebar sidebar--single-product">
              <div className="sidebar-card card-pricing">
                <div className="price">
                  <h1>
                    <sup>$</sup>
                    <span>00.00</span>
                  </h1>
                </div>
                <div className="purchase-button">
                  <Link href="#" className="btn btn--lg btn--round">
                    Download Now
                  </Link>
                </div>
              </div>

              <div className="sidebar-card card--metadata">
                <ul className="data">
                  <li>
                    <p>
                      <span className="lnr lnr-download pcolor"></span>Total
                      Downloads
                    </p>
                    <span>{product.metadata.totalSales}</span>
                  </li>
                  <li>
                    <p>
                      <span className="lnr lnr-heart scolor"></span>Favorites
                    </p>
                    <span>{product.metadata.favorites}</span>
                  </li>
                  <li>
                    <p>
                      <span className="lnr lnr-bubble mcolor3"></span>Comments
                    </p>
                    <span>{product.metadata.comments}</span>
                  </li>
                  <li>
                    <p>
                      <span className="lnr lnr-eye mcolor4"></span>Views
                    </p>
                    <span>6,589</span>
                  </li>
                </ul>
              </div>

              <div className="sidebar-card card--product-infos">
                <div className="card-title">
                  <h4>Product Information</h4>
                </div>

                <ul className="infos">
                  <li>
                    <p className="data-label">Released</p>
                    <p className="info">{product.productInfo.released}</p>
                  </li>
                  <li>
                    <p className="data-label">Updated</p>
                    <p className="info">{product.productInfo.updated}</p>
                  </li>
                  <li>
                    <p className="data-label">File type</p>
                    <p className="info">PSD, AI, JPG</p>
                  </li>
                  <li>
                    <p className="data-label">Category</p>
                    <p className="info">Free PSD</p>
                  </li>
                  <li>
                    <p className="data-label">Files Size</p>
                    <p className="info">26mb</p>
                  </li>
                  <li>
                    <p className="data-label">License</p>
                    <p className="info">regular</p>
                  </li>
                  <li>
                    <p className="data-label">Tags</p>
                    <p className="info">
                      {product.productInfo.tags
                        .slice(0, 4)
                        .map((tag, index) => (
                          <span key={index}>
                            <Link href="#">{tag}</Link>
                            {index <
                              Math.min(4, product.productInfo.tags.length) -
                                1 && ", "}
                          </span>
                        ))}
                    </p>
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
