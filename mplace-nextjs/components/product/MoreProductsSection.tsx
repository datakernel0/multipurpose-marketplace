"use client";

import Link from "next/link";
import { withBasePath } from "@/utils/paths";

interface MoreProductsSectionProps {
  sellerId?: string;
}

export default function MoreProductsSection({
  sellerId,
}: MoreProductsSectionProps) {
  const products = [
    {
      id: 1,
      image: withBasePath("/images/p4.jpg"),
      title: "Mccarther Coffee Shop",
      author: "BackTheme",
      authorImg: withBasePath("/images/auth3.jpg"),
      category: "Plugin",
      categoryIcon: withBasePath("/images/cathtm.png"),
      price: "$10",
      favorites: 48,
      sales: 50,
      rating: 4.5,
      description:
        "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet congue.",
    },
    {
      id: 2,
      image: withBasePath("/images/p2.jpg"),
      title: "Mccarther Coffee Shop",
      author: "BackTheme",
      authorImg: withBasePath("/images/auth2.jpg"),
      category: "wordpress",
      categoryIcon: withBasePath("/images/catword.png"),
      price: "$10",
      favorites: 48,
      sales: 50,
      rating: 4.5,
      description:
        "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet congue.",
    },
    {
      id: 3,
      image: withBasePath("/images/p6.jpg"),
      title: "The of the century",
      author: "BackTheme",
      authorImg: withBasePath("/images/auth.jpg"),
      category: "PSD",
      categoryIcon: withBasePath("/images/catph.png"),
      price: "$10",
      favorites: 48,
      sales: 50,
      rating: 4.5,
      description:
        "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet congue.",
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
    <section className="more_product_area section--padding">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="section-title">
              <h1>
                More Items <span className="highlighted">by Aazztech</span>
              </h1>
            </div>
          </div>
        </div>

        <div className="row">
          {products.map((product) => (
            <div key={product.id} className="col-lg-4 col-md-6">
              <div className="product product--card">
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

                <div className="product-desc">
                  <Link
                    href={`/single-product/${product.id}`}
                    className="product_title"
                  >
                    <h4>{product.title}</h4>
                  </Link>
                  <ul className="titlebtm">
                    <li>
                      <img
                        className="auth-img"
                        src={product.authorImg}
                        alt="author image"
                      />
                      <p>
                        <Link href="/author">{product.author}</Link>
                      </p>
                    </li>
                    <li className="product_cat">
                      <Link href="#">
                        <img src={product.categoryIcon} alt="category image" />
                        {product.category}
                      </Link>
                    </li>
                  </ul>

                  <p>{product.description}</p>
                </div>

                <div className="product-purchase">
                  <div className="price_love">
                    <span>{product.price}</span>
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
          ))}
        </div>
      </div>
    </section>
  );
}
