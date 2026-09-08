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

interface PricingOption {
  id: string;
  label: string;
  price: number;
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
  pricingOptions: PricingOption[];
}

interface SingleProductContentV2Props {
  product: Product;
}

export default function SingleProductContentV2({
  product,
}: SingleProductContentV2Props) {
  const [activeTab, setActiveTab] = useState("product-details");
  const [openFaqs, setOpenFaqs] = useState<number[]>([]);

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

  // Mock reviews data
  const reviews = [
    {
      id: 1,
      author: "Themexylum",
      avatar: "/images/m1.png",
      time: "9 Hours Ago",
      rating: 4.5,
      tag: "support",
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
      ],
    },
    {
      id: 2,
      author: "Codepoet_Biplob",
      avatar: "/images/m4.png",
      time: "9 Hours Ago",
      rating: 4.5,
      tag: "code quality",
      text: "Awesome theme. All in one Business Website Solutions.",
    },
    {
      id: 3,
      author: "PaglaGhora",
      avatar: "/images/m5.png",
      time: "9 Hours Ago",
      rating: 4.5,
      tag: "design quality",
      text: "Best theme ever....",
    },
  ];

  // Mock FAQs
  const faqs = [
    {
      id: 1,
      question: "How to write the changelog for theme updates?",
      answer:
        "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceleris que the mattis, leo quam aliquet congue placerat mi id nisi interdum mollis. Aliquip placeat salvia cillum iphone. Seitan aliquip quis cardigan american apparel, butcher.",
    },
    {
      id: 2,
      question: "Why do I need to login to purchase an item on DigiPro?",
      answer:
        "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceleris que the mattis, leo quam aliquet congue placerat mi id nisi interdum mollis.",
    },
    {
      id: 3,
      question: "How to create an account on DigiPro?",
      answer:
        "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceleris que the mattis, leo quam aliquet congue placerat mi id nisi interdum mollis.",
    },
    {
      id: 4,
      question: "How to write the changelog for theme updates?",
      answer:
        "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceleris que the mattis, leo quam aliquet congue placerat mi id nisi interdum mollis.",
    },
  ];

  return (
    <section className="single-product-desc">
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
            </div>

            <div className="item-info">
              <div className="item-navigation">
                <ul className="nav nav-tabs">
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
                  <li>
                    <a
                      href="#product-review"
                      className={activeTab === "product-review" ? "active" : ""}
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveTab("product-review");
                      }}
                    >
                      Reviews <span>(35)</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="#product-support"
                      className={
                        activeTab === "product-support" ? "active" : ""
                      }
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveTab("product-support");
                      }}
                    >
                      Support
                    </a>
                  </li>
                  <li>
                    <a
                      href="#product-faq"
                      className={activeTab === "product-faq" ? "active" : ""}
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveTab("product-faq");
                      }}
                    >
                      item FAQ
                    </a>
                  </li>
                </ul>
              </div>

              <div className="tab-content">
                <div
                  className={`tab-pane fade ${
                    activeTab === "product-details" ? "show active" : ""
                  } product-tab`}
                  id="product-details"
                >
                  <div className="tab-content-wrapper">
                    <h1>Landing Page Details</h1>
                    <p>{product.description}</p>

                    <h2>Features With HTML List Unordered:</h2>
                    <ul>
                      <li>Six different themes for product slider</li>
                      <li>
                        Featured products slider form selected categories.
                      </li>
                      <li>
                        Product slider form specific categories of products.
                        Include or exclude categories.
                      </li>
                      <li>
                        Product slider form specific tags of products. Include
                        or exclude tags. New
                      </li>
                    </ul>

                    <h2>Features With HTML List Ordered:</h2>
                    <ol>
                      <li>Six different themes for product slider</li>
                      <li>
                        Featured products slider form selected categories.
                      </li>
                      <li>
                        Product slider form specific categories of products.
                        Include or exclude categories.
                      </li>
                      <li>
                        Product slider form specific tags of products. Include
                        or exclude tags. New
                      </li>
                    </ol>

                    <h2>Features With Image:</h2>
                    <Image
                      src={withBasePath("/images/apspr.jpg")}
                      alt="Product description thumbnail"
                      width={750}
                      height={400}
                    />
                  </div>
                </div>

                <div
                  className={`tab-pane fade ${
                    activeTab === "product-comment" ? "show active" : ""
                  } product-tab`}
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

                    <div className="pagination-area pagination-area2">
                      <nav className="navigation pagination" role="navigation">
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

                <div
                  className={`tab-pane fade ${
                    activeTab === "product-review" ? "show active" : ""
                  } product-tab`}
                  id="product-review"
                >
                  <div className="thread thread_review">
                    <ul className="media-list thread-list">
                      {reviews.map((review) => (
                        <li key={review.id} className="single-thread">
                          <div className="media">
                            <div className="media-left">
                              <Link href="#">
                                <Image
                                  src={withBasePath(review.avatar)}
                                  alt="Commentator Avatar"
                                  width={60}
                                  height={60}
                                  className="media-object"
                                />
                              </Link>
                            </div>
                            <div className="media-body">
                              <div className="clearfix">
                                <div className="pull-left">
                                  <div className="media-heading">
                                    <Link href="#">
                                      <h4>{review.author}</h4>
                                    </Link>
                                    <span>{review.time}</span>
                                  </div>
                                  <div className="rating product--rating">
                                    <ul>{renderStars(review.rating)}</ul>
                                  </div>
                                  <span className="review_tag">
                                    {review.tag}
                                  </span>
                                </div>
                                <Link href="#" className="reply-link">
                                  Reply
                                </Link>
                              </div>
                              <p>{review.text}</p>
                            </div>
                          </div>

                          {review.replies && review.replies.length > 0 && (
                            <ul className="children">
                              {review.replies.map((reply) => (
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

                    <div className="pagination-area pagination-area2">
                      <nav className="navigation pagination" role="navigation">
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
                  </div>
                </div>

                <div
                  className={`tab-pane fade ${
                    activeTab === "product-support" ? "show active" : ""
                  } product-tab`}
                  id="product-support"
                >
                  <div className="support">
                    <div className="support__title">
                      <h3>Contact the Author</h3>
                    </div>
                    <div className="support__form">
                      <div className="usr-msg">
                        <p>
                          Please <Link href="/login">sign in</Link> to contact
                          this author.
                        </p>

                        <form action="#" className="support_form">
                          <div className="form-group">
                            <label htmlFor="subj">Support Subject:</label>
                            <input
                              type="text"
                              id="subj"
                              className="text_field"
                              placeholder="Enter your subject"
                            />
                          </div>

                          <div className="form-group">
                            <label htmlFor="supmsg">Support Query:</label>
                            <textarea
                              className="text_field"
                              id="supmsg"
                              name="supmsg"
                              placeholder="Enter your text..."
                            ></textarea>
                          </div>
                          <button
                            type="submit"
                            className="btn btn--lg btn--round"
                          >
                            Submit Now
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={`tab-pane fade ${
                    activeTab === "product-faq" ? "show active" : ""
                  } product-tab`}
                  id="product-faq"
                >
                  <div className="tab-content-wrapper">
                    <div
                      className="panel-group accordion"
                      role="tablist"
                      id="accordion"
                    >
                      {faqs.map((faq, index) => {
                        const isOpen = openFaqs.includes(index);
                        return (
                          <div
                            key={faq.id}
                            className="panel accordion__single"
                            id={`panel-${index + 1}`}
                          >
                            <div className="single_acco_title">
                              <h4>
                                <a
                                  href={`#collapse${index + 1}`}
                                  className={isOpen ? "" : "collapsed"}
                                  aria-expanded={isOpen}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setOpenFaqs((prev) =>
                                      prev.includes(index)
                                        ? prev.filter((i) => i !== index)
                                        : [...prev, index]
                                    );
                                  }}
                                >
                                  <span>{faq.question}</span>
                                  <i
                                    className={`lnr lnr-chevron-${
                                      isOpen ? "up" : "down"
                                    } indicator`}
                                  ></i>
                                </a>
                              </h4>
                            </div>

                            <div
                              id={`collapse${index + 1}`}
                              className={`panel-collapse collapse ${
                                isOpen ? "show" : ""
                              }`}
                              aria-labelledby={`panel-${index + 1}`}
                              data-parent="#accordion"
                            >
                              <div className="panel-body">
                                <p>{faq.answer}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
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
                    <span>
                      {product.priceMin === product.priceMax
                        ? product.priceMin.toFixed(2)
                        : `${product.priceMin} - ${product.priceMax}`}
                    </span>
                  </h1>
                </div>
                <div className="purchase-button">
                  <Link href="#" className="btn btn--lg btn--round">
                    Purchase Now
                  </Link>
                </div>
              </div>

              <div className="sidebar-card card--metadata">
                <ul className="data">
                  <li>
                    <p>
                      <span className="lnr lnr-cart pcolor"></span>Total Sales
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
                      <span className="lnr lnr-star mcolor4"></span>Ratings
                    </p>
                    <div className="rating product--rating">
                      <ul>{renderStars(product.metadata.rating)}</ul>
                    </div>
                    <span className="rating__count">
                      ({product.metadata.reviews})
                    </span>
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
                    <p className="data-label">Version</p>
                    <p className="info">{product.productInfo.version}</p>
                  </li>
                  <li>
                    <p className="data-label">Layout</p>
                    <p className="info">{product.productInfo.layout}</p>
                  </li>
                  <li>
                    <p className="data-label">Retina Ready</p>
                    <p className="info">{product.productInfo.retinaReady}</p>
                  </li>
                  <li>
                    <p className="data-label">Files Included</p>
                    <p className="info">{product.productInfo.filesIncluded}</p>
                  </li>
                  <li>
                    <p className="data-label">Browser</p>
                    <p className="info">{product.productInfo.browser}</p>
                  </li>
                  <li>
                    <p className="data-label">Bootstrap</p>
                    <p className="info">{product.productInfo.bootstrap}</p>
                  </li>
                  <li>
                    <p className="data-label">Tags</p>
                    <p className="info">
                      {product.productInfo.tags.map((tag, index) => (
                        <span key={index}>
                          <Link href="#">{tag}</Link>
                          {index < product.productInfo.tags.length - 1 && ", "}
                        </span>
                      ))}
                    </p>
                  </li>
                </ul>
              </div>

              <div className="sidebar-card card--author">
                <div className="card-title">
                  <h4>About the Author</h4>
                </div>
                <div className="card-content">
                  <div className="author">
                    <Image
                      src={withBasePath(product.seller.avatar)}
                      alt={product.seller.name}
                      width={80}
                      height={80}
                      className="author-avatar"
                    />
                    <div className="author-info">
                      <h4>{product.seller.name}</h4>
                      <p>Joined {product.seller.signedUp}</p>
                    </div>
                  </div>
                  <Link href="#" className="btn btn--round btn--md">
                    View Profile
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
