"use client";

import Link from "next/link";
import { withBasePath } from "@/utils/paths";

export default function CategoryListProducts() {
  const products = [
    {
      id: 1,
      image: withBasePath("/images/pl1.jpg"),
      title: "MartPlace Extension Bundle",
      description:
        "Nunc placerat mi id nisi inter dum mollis. Praesent phare...",
      category: "Plugin",
      author: "BackTheme",
      authorImg: withBasePath("/images/auth3.jpg"),
      price: "$10 - $50",
      loves: 90,
      comments: 90,
      sales: 16,
      rating: 4.5,
      ratingCount: 34,
    },
    {
      id: 2,
      image: withBasePath("/images/pl2.jpg"),
      title: "Product Enquiry Extension",
      description:
        "Nunc placerat mi id nisi inter dum mollis. Praesent phare...",
      category: "Plugin",
      author: "BackTheme",
      authorImg: withBasePath("/images/auth.jpg"),
      price: "$10 - $50",
      loves: 90,
      comments: 90,
      sales: 16,
      rating: 4.5,
      ratingCount: 34,
    },
    {
      id: 3,
      image: withBasePath("/images/pl3.jpg"),
      title: "Visibility Manager Subscription",
      description:
        "Nunc placerat mi id nisi inter dum mollis. Praesent phare...",
      category: "Plugin",
      author: "BackTheme",
      authorImg: withBasePath("/images/auth2.jpg"),
      price: "$10 - $50",
      loves: 90,
      comments: 90,
      sales: 16,
      rating: 4.5,
      ratingCount: 34,
    },
    {
      id: 4,
      image: withBasePath("/images/pl4.jpg"),
      title: "Sundori toma amar tumi",
      description:
        "Nunc placerat mi id nisi inter dum mollis. Praesent phare...",
      category: "Plugin",
      author: "BackTheme",
      authorImg: withBasePath("/images/auth.jpg"),
      price: "$10 - $50",
      loves: 90,
      comments: 90,
      sales: 16,
      rating: 4.5,
      ratingCount: 34,
    },
    {
      id: 5,
      image: withBasePath("/images/pl5.jpg"),
      title: "WHMCS wordpress theme",
      description:
        "Nunc placerat mi id nisi inter dum mollis. Praesent phare...",
      category: "Plugin",
      author: "BackTheme",
      authorImg: withBasePath("/images/auth3.jpg"),
      price: "$10 - $50",
      loves: 90,
      comments: 90,
      sales: 16,
      rating: 4.5,
      ratingCount: 34,
    },
    {
      id: 6,
      image: withBasePath("/images/pl6.jpg"),
      title: "Dribble shot illustration",
      description:
        "Nunc placerat mi id nisi inter dum mollis. Praesent phare...",
      category: "Plugin",
      author: "BackTheme",
      authorImg: withBasePath("/images/auth2.jpg"),
      price: "$10 - $50",
      loves: 90,
      comments: 90,
      sales: 16,
      rating: 4.5,
      ratingCount: 34,
    },
  ];

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

  return (
    <>
      {products.map((product) => (
        <div
          key={product.id}
          className="product product--list product--list-small"
        >
          <div className="product__thumbnail">
            <img src={product.image} alt="Product Image" />
            <div className="prod_btn">
              <Link
                href={`/single-product/${product.id}`}
                className="transparent btn--sm btn--round"
              >
                More Info
              </Link>
              <Link
                href={`/single-product/${product.id}`}
                className="transparent btn--sm btn--round"
              >
                Live Demo
              </Link>
            </div>
          </div>

          <div className="product__details">
            <div className="product-desc">
              <Link
                href={`/single-product/${product.id}`}
                className="product_title"
              >
                <h4>{product.title}</h4>
              </Link>
              <p>{product.description}</p>

              <ul className="titlebtm">
                <li className="product_cat">
                  <Link
                    href={`/category-list?category=${product.category.toLowerCase()}`}
                  >
                    <span className="lnr lnr-book"></span>
                    {product.category}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="product-meta">
              <div className="author">
                <img
                  className="auth-img"
                  src={product.authorImg}
                  alt="author image"
                />
                <p>
                  <Link href="/author">{product.author}</Link>
                </p>
              </div>

              <div className="love-comments">
                <p>
                  <span className="lnr lnr-heart"></span> {product.loves} loves
                </p>
                <p>
                  <span className="lnr lnr-bubble"></span> {product.comments}{" "}
                  Comments
                </p>
              </div>

              <div className="rating product--rating">
                <ul>{renderStars(product.rating)}</ul>
                <span className="rating__count">({product.ratingCount})</span>
              </div>
            </div>

            <div className="product-purchase">
              <div className="price_love">
                <span>{product.price}</span>
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
      ))}

      <div className="row">
        <div className="col-md-12">
          <div className="pagination-area pull-right">
            <nav className="navigation pagination" role="navigation">
              <div className="nav-links">
                <a className="prev page-numbers" href="#">
                  <span className="lnr lnr-arrow-left"></span>
                </a>
                <a className="page-numbers current" href="#">
                  1
                </a>
                <a className="page-numbers" href="#">
                  2
                </a>
                <a className="page-numbers" href="#">
                  3
                </a>
                <a className="next page-numbers" href="#">
                  <span className="lnr lnr-arrow-right"></span>
                </a>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}
