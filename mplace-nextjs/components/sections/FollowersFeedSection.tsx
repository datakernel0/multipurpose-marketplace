"use client";

import { useRef } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Link from "next/link";
import { withBasePath } from "@/utils/paths";

export default function FollowersFeedSection() {
  const sliderRef = useRef<Slider>(null);

  const next = () => {
    sliderRef.current?.slickNext();
  };

  const prev = () => {
    sliderRef.current?.slickPrev();
  };

  const settings = {
    dots: false,
    arrows: false,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: false,
    responsive: [
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  const products = [
    {
      id: 1,
      image: withBasePath("/images/p4.jpg"),
      title: "Ajax Live Search",
      author: "BackTheme",
      authorImg: withBasePath("/images/auth.jpg"),
      category: "Plugin",
      description:
        "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet congue.",
      price: "$10 - $50",
      favorites: 90,
      sales: 16,
    },
    {
      id: 2,
      image: withBasePath("/images/p2.jpg"),
      title: "Mccarther Coffee Shop",
      author: "BackTheme",
      authorImg: withBasePath("/images/auth2.jpg"),
      category: "Plugin",
      description:
        "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet congue.",
      price: "$10",
      favorites: 48,
      sales: 50,
    },
    {
      id: 3,
      image: withBasePath("/images/p6.jpg"),
      title: "Visibility Manager Subscriptions",
      author: "BackTheme",
      authorImg: withBasePath("/images/auth3.jpg"),
      category: "WordPress",
      description:
        "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet congue.",
      price: "Free",
      favorites: 24,
      sales: 27,
    },
    {
      id: 4,
      image: withBasePath("/images/p4.jpg"),
      title: "Ajax Live Search",
      author: "BackTheme",
      authorImg: withBasePath("/images/auth.jpg"),
      category: "Plugin",
      description:
        "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet congue.",
      price: "$10 - $50",
      favorites: 90,
      sales: 16,
    },
    {
      id: 5,
      image: withBasePath("/images/p2.jpg"),
      title: "Mccarther Coffee Shop",
      author: "BackTheme",
      authorImg: withBasePath("/images/auth2.jpg"),
      category: "Plugin",
      description:
        "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet congue.",
      price: "$10",
      favorites: 48,
      sales: 50,
    },
    {
      id: 6,
      image: withBasePath("/images/p6.jpg"),
      title: "Visibility Manager Subscriptions",
      author: "BackTheme",
      authorImg: withBasePath("/images/auth3.jpg"),
      category: "WordPress",
      description:
        "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet congue.",
      price: "Free",
      favorites: 24,
      sales: 27,
    },
  ];

  return (
    <section className="followers-feed section--padding">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="product-title-area">
              <div className="product__title">
                <h2>Your Followers Feed</h2>
              </div>

              <div className="product__slider-nav follow_feed_nav rounded">
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

        <div className="row">
          <div className="col-md-12">
            <div className="product_slider">
              <Slider ref={sliderRef} {...settings}>
                {products.map((product) => (
                  <div key={product.id} className="product product--card">
                    <div className="product__thumbnail">
                      <img src={product.image} alt={product.title} />
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
                            alt={product.author}
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
                      <div className="sell">
                        <p>
                          <span className="lnr lnr-cart"></span>
                          <span>{product.sales}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </Slider>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
