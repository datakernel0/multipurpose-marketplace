import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Preloader from "@/components/Preloader";
import ScrollToTop from "@/components/ScrollToTop";
import CallToActionSection from "@/components/sections/CallToActionSection";
import Breadcrumb from "@/components/common/Breadcrumb";
import { withBasePath } from "@/utils/paths";
import Image from "next/image";
import Link from "next/link";

export default function ProductsPage() {
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
    <div className="preload products-page">
      <Preloader />
      <Header />
      <Breadcrumb
        pageTitle="Products"
        paths={[{ name: "Products", link: "/products" }]}
      />
      <section className="section--padding2 bgcolor">
        <div className="shortcode_wrapper">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="shortcode_module_title">
                  <div className="dashboard__title">
                    <h3>Product View 1</h3>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-4 col-md-6">
                <div className="product product--card">
                  <div className="product__thumbnail">
                    <Image
                      src={withBasePath("/images/p1.jpg")}
                      alt="Product Image"
                      width={400}
                      height={300}
                    />
                    <div className="prod_btn">
                      <Link
                        href="/single-product/1"
                        className="transparent btn--sm btn--round"
                      >
                        More Info
                      </Link>
                      <Link
                        href="/single-product/1"
                        className="transparent btn--sm btn--round"
                      >
                        Live Demo
                      </Link>
                    </div>
                  </div>

                  <div className="product-desc">
                    <Link href="/single-product/1" className="product_title">
                      <h4>MartPlace Extension Bundle</h4>
                    </Link>
                    <ul className="titlebtm">
                      <li>
                        <Image
                          className="auth-img"
                          src={withBasePath("/images/auth.jpg")}
                          alt="author image"
                          width={40}
                          height={40}
                        />
                        <p>
                          <Link href="#">BackTheme</Link>
                        </p>
                      </li>
                      <li className="product_cat">
                        <Link href="#">
                          <span className="lnr lnr-book"></span>Plugin
                        </Link>
                      </li>
                    </ul>

                    <p>
                      Nunc placerat mi id nisi interdum mollis. Praesent
                      pharetra, justo ut scelerisque the mattis, leo quam
                      aliquet congue.
                    </p>
                  </div>

                  <div className="product-purchase">
                    <div className="price_love">
                      <span>$10 - $50</span>
                      <p>
                        <span className="lnr lnr-heart"></span> 90
                      </p>
                    </div>
                    <div className="sell">
                      <p>
                        <span className="lnr lnr-cart"></span>
                        <span>16</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-4 col-md-6">
                <div className="product product--card">
                  <div className="product__thumbnail">
                    <Image
                      src={withBasePath("/images/p2.jpg")}
                      alt="Product Image"
                      width={400}
                      height={300}
                    />
                    <div className="prod_btn">
                      <Link
                        href="/single-product/2"
                        className="transparent btn--sm btn--round"
                      >
                        More Info
                      </Link>
                      <Link
                        href="/single-product/2"
                        className="transparent btn--sm btn--round"
                      >
                        Live Demo
                      </Link>
                    </div>
                  </div>

                  <div className="product-desc">
                    <Link href="/single-product/2" className="product_title">
                      <h4>Mccarther Coffee Shop</h4>
                    </Link>
                    <ul className="titlebtm">
                      <li>
                        <Image
                          className="auth-img"
                          src={withBasePath("/images/auth2.jpg")}
                          alt="author image"
                          width={40}
                          height={40}
                        />
                        <p>
                          <Link href="#">BackTheme</Link>
                        </p>
                      </li>
                      <li className="product_cat">
                        <Link href="#">
                          <span className="lnr lnr-book"></span>Plugin
                        </Link>
                      </li>
                    </ul>

                    <p>
                      Nunc placerat mi id nisi interdum mollis. Praesent
                      pharetra, justo ut scelerisque the mattis, leo quam
                      aliquet congue.
                    </p>
                  </div>

                  <div className="product-purchase">
                    <div className="price_love">
                      <span>$10</span>
                      <p>
                        <span className="lnr lnr-heart"></span> 48
                      </p>
                    </div>
                    <div className="sell">
                      <p>
                        <span className="lnr lnr-cart"></span>
                        <span>50</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-4 col-md-6">
                <div className="product product--card">
                  <div className="product__thumbnail">
                    <Image
                      src={withBasePath("/images/p3.jpg")}
                      alt="Product Image"
                      width={400}
                      height={300}
                    />
                    <div className="prod_btn">
                      <Link
                        href="/single-product/3"
                        className="transparent btn--sm btn--round"
                      >
                        More Info
                      </Link>
                      <Link
                        href="/single-product/3"
                        className="transparent btn--sm btn--round"
                      >
                        Live Demo
                      </Link>
                    </div>
                  </div>

                  <div className="product-desc">
                    <Link href="/single-product/3" className="product_title">
                      <h4>Visibility Manager Subscriptions</h4>
                    </Link>
                    <ul className="titlebtm">
                      <li>
                        <Image
                          className="auth-img"
                          src={withBasePath("/images/auth3.jpg")}
                          alt="author image"
                          width={40}
                          height={40}
                        />
                        <p>
                          <Link href="#">BackTheme</Link>
                        </p>
                      </li>
                      <li className="product_cat">
                        <Link href="#">
                          <span className="lnr lnr-book"></span>Plugin
                        </Link>
                      </li>
                    </ul>

                    <p>
                      Nunc placerat mi id nisi interdum mollis. Praesent
                      pharetra, justo ut scelerisque the mattis, leo quam
                      aliquet congue.
                    </p>
                  </div>

                  <div className="product-purchase">
                    <div className="price_love">
                      <span>Free</span>
                      <p>
                        <span className="lnr lnr-heart"></span> 24
                      </p>
                    </div>
                    <div className="rating product--rating">
                      <ul>{renderStars(5)}</ul>
                    </div>
                    <div className="sell">
                      <p>
                        <span className="lnr lnr-cart"></span>
                        <span>27</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="shortcode_wrapper">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="shortcode_module_title">
                  <div className="dashboard__title">
                    <h3>Product View 2</h3>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-4 col-md-6">
                <div className="product product--card product--card2">
                  <div className="product__thumbnail">
                    <Image
                      src={withBasePath("/images/p1.jpg")}
                      alt="Product Image"
                      width={400}
                      height={300}
                    />
                    <div className="prod_btn">
                      <Link
                        href="/single-product/1"
                        className="transparent btn--sm btn--round"
                      >
                        More Info
                      </Link>
                      <Link
                        href="/single-product/1"
                        className="transparent btn--sm btn--round"
                      >
                        Live Demo
                      </Link>
                    </div>
                  </div>

                  <div className="product-desc">
                    <Link href="/single-product/1" className="product_title">
                      <h4>MartPlace Extension Bundle</h4>
                    </Link>

                    <p>
                      Nunc placerat mi id nisi interdum mollis. Praesent
                      pharetra, justo ut scelerisque the mattis, leo quam
                      aliquet congue.
                    </p>
                  </div>

                  <ul className="titlebtm">
                    <li className="product_cat">
                      <Link href="#">
                        <span className="lnr lnr-book"></span>Plugin
                      </Link>
                    </li>
                    <li className="rating product--rating">
                      <ul>{renderStars(5)}</ul>
                    </li>
                  </ul>

                  <div className="product-purchase">
                    <div className="price_love">
                      <span>$10 - $50</span>
                      <p>
                        <span className="lnr lnr-heart"></span> 90
                      </p>
                    </div>
                    <div className="sell">
                      <p>
                        <span className="lnr lnr-cart"></span>
                        <span>16</span>sales
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-4 col-md-6">
                <div className="product product--card product--card2">
                  <div className="product__thumbnail">
                    <Image
                      src={withBasePath("/images/p2.jpg")}
                      alt="Product Image"
                      width={400}
                      height={300}
                    />
                    <div className="prod_btn">
                      <Link
                        href="/single-product/2"
                        className="transparent btn--sm btn--round"
                      >
                        More Info
                      </Link>
                      <Link
                        href="/single-product/2"
                        className="transparent btn--sm btn--round"
                      >
                        Live Demo
                      </Link>
                    </div>
                  </div>

                  <div className="product-desc">
                    <Link href="/single-product/2" className="product_title">
                      <h4>Marketify Coffee Shop</h4>
                    </Link>

                    <p>
                      Nunc placerat mi id nisi interdum mollis. Praesent
                      pharetra, justo ut scelerisque the mattis, leo quam
                      aliquet congue.
                    </p>
                  </div>

                  <ul className="titlebtm">
                    <li className="product_cat">
                      <Link href="#">
                        <span className="lnr lnr-book"></span>WordPress
                      </Link>
                    </li>
                    <li className="rating product--rating">
                      <ul>{renderStars(5)}</ul>
                    </li>
                  </ul>

                  <div className="product-purchase">
                    <div className="price_love">
                      <span>40$</span>
                      <p>
                        <span className="lnr lnr-heart"></span> 90
                      </p>
                    </div>
                    <div className="sell">
                      <p>
                        <span className="lnr lnr-cart"></span>
                        <span>16</span>sales
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-4 col-md-6">
                <div className="product product--card product--card2">
                  <div className="product__thumbnail">
                    <Image
                      src={withBasePath("/images/p3.jpg")}
                      alt="Product Image"
                      width={400}
                      height={300}
                    />
                    <div className="prod_btn">
                      <Link
                        href="/single-product/3"
                        className="transparent btn--sm btn--round"
                      >
                        More Info
                      </Link>
                      <Link
                        href="/single-product/3"
                        className="transparent btn--sm btn--round"
                      >
                        Live Demo
                      </Link>
                    </div>
                  </div>

                  <div className="product-desc">
                    <Link href="/single-product/3" className="product_title">
                      <h4>Pocket WordPress Theme</h4>
                    </Link>

                    <p>
                      Nunc placerat mi id nisi interdum mollis. Praesent
                      pharetra, justo ut scelerisque the mattis, leo quam
                      aliquet congue.
                    </p>
                  </div>

                  <ul className="titlebtm">
                    <li className="product_cat">
                      <Link href="#">
                        <span className="lnr lnr-book"></span>PSD
                      </Link>
                    </li>
                    <li className="rating product--rating">
                      <ul>{renderStars(5)}</ul>
                    </li>
                  </ul>

                  <div className="product-purchase">
                    <div className="price_love">
                      <span>Free</span>
                      <p>
                        <span className="lnr lnr-heart"></span> 90
                      </p>
                    </div>
                    <div className="sell">
                      <p>
                        <span className="lnr lnr-cart"></span>
                        <span>16</span>sales
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="shortcode_wrapper">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="shortcode_module_title">
                  <div className="dashboard__title">
                    <h3>Product View 3</h3>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-4 col-md-6">
                <div className="product product--card product--card3">
                  <div className="product__thumbnail">
                    <Image
                      src={withBasePath("/images/p1.jpg")}
                      alt="Product Image"
                      width={400}
                      height={300}
                    />
                    <div className="prod_btn">
                      <Link
                        href="/single-product/1"
                        className="transparent btn--sm btn--round"
                      >
                        More Info
                      </Link>
                      <Link
                        href="/single-product/1"
                        className="transparent btn--sm btn--round"
                      >
                        Live Demo
                      </Link>
                    </div>
                  </div>

                  <div className="product-desc">
                    <Link href="/single-product/1" className="product_title">
                      <h4>MartPlace Extension Bundle</h4>
                    </Link>
                    <ul className="titlebtm">
                      <li>
                        <Image
                          className="auth-img"
                          src={withBasePath("/images/auth.jpg")}
                          alt="author image"
                          width={40}
                          height={40}
                        />
                        <p>
                          <Link href="#">BackTheme</Link>
                        </p>
                      </li>
                      <li className="product_cat">
                        <Link href="#">
                          <span className="lnr lnr-book"></span>Plugin
                        </Link>
                      </li>
                    </ul>
                  </div>

                  <div className="product-purchase">
                    <div className="price_love">
                      <span>$10 - $50</span>
                      <p>
                        <span className="lnr lnr-heart"></span> 90
                      </p>
                    </div>
                    <div className="sell">
                      <p>
                        <span className="lnr lnr-cart"></span>
                        <span>16</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-4 col-md-6">
                <div className="product product--card product--card3">
                  <div className="product__thumbnail">
                    <Image
                      src={withBasePath("/images/p2.jpg")}
                      alt="Product Image"
                      width={400}
                      height={300}
                    />
                    <div className="prod_btn">
                      <Link
                        href="/single-product/2"
                        className="transparent btn--sm btn--round"
                      >
                        More Info
                      </Link>
                      <Link
                        href="/single-product/2"
                        className="transparent btn--sm btn--round"
                      >
                        Live Demo
                      </Link>
                    </div>
                  </div>

                  <div className="product-desc">
                    <Link href="/single-product/2" className="product_title">
                      <h4>Mccarther Coffee Shop</h4>
                    </Link>
                    <ul className="titlebtm">
                      <li>
                        <Image
                          className="auth-img"
                          src={withBasePath("/images/auth2.jpg")}
                          alt="author image"
                          width={40}
                          height={40}
                        />
                        <p>
                          <Link href="#">BackTheme</Link>
                        </p>
                      </li>
                      <li className="product_cat">
                        <Link href="#">
                          <span className="lnr lnr-book"></span>Plugin
                        </Link>
                      </li>
                    </ul>
                  </div>

                  <div className="product-purchase">
                    <div className="price_love">
                      <span>$10</span>
                      <p>
                        <span className="lnr lnr-heart"></span> 48
                      </p>
                    </div>
                    <div className="sell">
                      <p>
                        <span className="lnr lnr-cart"></span>
                        <span>50</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-4 col-md-6">
                <div className="product product--card product--card3">
                  <div className="product__thumbnail">
                    <Image
                      src={withBasePath("/images/p3.jpg")}
                      alt="Product Image"
                      width={400}
                      height={300}
                    />
                    <div className="prod_btn">
                      <Link
                        href="/single-product/3"
                        className="transparent btn--sm btn--round"
                      >
                        More Info
                      </Link>
                      <Link
                        href="/single-product/3"
                        className="transparent btn--sm btn--round"
                      >
                        Live Demo
                      </Link>
                    </div>
                  </div>

                  <div className="product-desc">
                    <Link href="/single-product/3" className="product_title">
                      <h4>Visibility Manager Subscriptions</h4>
                    </Link>
                    <ul className="titlebtm">
                      <li>
                        <Image
                          className="auth-img"
                          src={withBasePath("/images/auth3.jpg")}
                          alt="author image"
                          width={40}
                          height={40}
                        />
                        <p>
                          <Link href="#">BackTheme</Link>
                        </p>
                      </li>
                      <li className="product_cat">
                        <Link href="#">
                          <span className="lnr lnr-book"></span>Plugin
                        </Link>
                      </li>
                    </ul>
                  </div>

                  <div className="product-purchase">
                    <div className="price_love">
                      <span>Free</span>
                      <p>
                        <span className="lnr lnr-heart"></span> 24
                      </p>
                    </div>
                    <div className="sell">
                      <p>
                        <span className="lnr lnr-cart"></span>
                        <span>27</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="shortcode_wrapper">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="shortcode_module_title">
                  <div className="dashboard__title">
                    <h3>Product View 4</h3>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-3 col-md-6">
                <div className="product product--card product--card-small">
                  <div className="product__thumbnail">
                    <Image
                      src={withBasePath("/images/p1.jpg")}
                      alt="Product Image"
                      width={400}
                      height={300}
                    />
                    <div className="prod_btn">
                      <Link
                        href="/single-product/1"
                        className="transparent btn--sm btn--round"
                      >
                        More Info
                      </Link>
                      <Link
                        href="/single-product/1"
                        className="transparent btn--sm btn--round"
                      >
                        Live Demo
                      </Link>
                    </div>
                  </div>

                  <div className="product-desc">
                    <Link href="/single-product/1" className="product_title">
                      <h4>Finance and Consulting Business Theme</h4>
                    </Link>
                    <ul className="titlebtm">
                      <li>
                        <Image
                          className="auth-img"
                          src={withBasePath("/images/auth3.jpg")}
                          alt="author image"
                          width={40}
                          height={40}
                        />
                        <p>
                          <Link href="#">BackTheme</Link>
                        </p>
                      </li>
                      <li className="out_of_class_name">
                        <div className="sell">
                          <p>
                            <span className="lnr lnr-cart"></span>
                            <span>27</span>
                          </p>
                        </div>
                        <div className="rating product--rating">
                          <ul>{renderStars(4.5)}</ul>
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div className="product-purchase">
                    <div className="price_love">
                      <span>15$</span>
                    </div>
                    <Link href="#">
                      <span className="lnr lnr-book"></span>Plugin
                    </Link>
                  </div>
                </div>
              </div>

              <div className="col-lg-3 col-md-6">
                <div className="product product--card product--card-small">
                  <div className="product__thumbnail">
                    <Image
                      src={withBasePath("/images/p2.jpg")}
                      alt="Product Image"
                      width={400}
                      height={300}
                    />
                    <div className="prod_btn">
                      <Link
                        href="/single-product/2"
                        className="transparent btn--sm btn--round"
                      >
                        More Info
                      </Link>
                      <Link
                        href="/single-product/2"
                        className="transparent btn--sm btn--round"
                      >
                        Live Demo
                      </Link>
                    </div>
                  </div>

                  <div className="product-desc">
                    <Link href="/single-product/2" className="product_title">
                      <h4>Best Free Responsive ReactJS Admin Themes</h4>
                    </Link>
                    <ul className="titlebtm">
                      <li>
                        <Image
                          className="auth-img"
                          src={withBasePath("/images/auth2.jpg")}
                          alt="author image"
                          width={40}
                          height={40}
                        />
                        <p>
                          <Link href="#">BackTheme</Link>
                        </p>
                      </li>
                      <li className="out_of_class_name">
                        <div className="sell">
                          <p>
                            <span className="lnr lnr-cart"></span>
                            <span>27</span>
                          </p>
                        </div>
                        <div className="rating product--rating">
                          <ul>{renderStars(4.5)}</ul>
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div className="product-purchase">
                    <div className="price_love">
                      <span>15$</span>
                    </div>
                    <Link href="#">
                      <span className="lnr lnr-book"></span>Plugin
                    </Link>
                  </div>
                </div>
              </div>

              <div className="col-lg-3 col-md-6">
                <div className="product product--card product--card-small">
                  <div className="product__thumbnail">
                    <Image
                      src={withBasePath("/images/p4.jpg")}
                      alt="Product Image"
                      width={400}
                      height={300}
                    />
                    <div className="prod_btn">
                      <Link
                        href="/single-product/4"
                        className="transparent btn--sm btn--round"
                      >
                        More Info
                      </Link>
                      <Link
                        href="/single-product/4"
                        className="transparent btn--sm btn--round"
                      >
                        Live Demo
                      </Link>
                    </div>
                  </div>

                  <div className="product-desc">
                    <Link href="/single-product/4" className="product_title">
                      <h4>Finance and Consulting Business Theme</h4>
                    </Link>
                    <ul className="titlebtm">
                      <li>
                        <Image
                          className="auth-img"
                          src={withBasePath("/images/auth.jpg")}
                          alt="author image"
                          width={40}
                          height={40}
                        />
                        <p>
                          <Link href="#">BackTheme</Link>
                        </p>
                      </li>
                      <li className="out_of_class_name">
                        <div className="sell">
                          <p>
                            <span className="lnr lnr-cart"></span>
                            <span>27</span>
                          </p>
                        </div>
                        <div className="rating product--rating">
                          <ul>{renderStars(4.5)}</ul>
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div className="product-purchase">
                    <div className="price_love">
                      <span>15$</span>
                    </div>
                    <Link href="#">
                      <span className="lnr lnr-book"></span>Plugin
                    </Link>
                  </div>
                </div>
              </div>

              <div className="col-lg-3 col-md-6">
                <div className="product product--card product--card-small">
                  <div className="product__thumbnail">
                    <Image
                      src={withBasePath("/images/p4.jpg")}
                      alt="Product Image"
                      width={400}
                      height={300}
                    />
                    <div className="prod_btn">
                      <Link
                        href="/single-product/5"
                        className="transparent btn--sm btn--round"
                      >
                        More Info
                      </Link>
                      <Link
                        href="/single-product/5"
                        className="transparent btn--sm btn--round"
                      >
                        Live Demo
                      </Link>
                    </div>
                  </div>

                  <div className="product-desc">
                    <Link href="/single-product/5" className="product_title">
                      <h4>AppsPress - HTML5 Applanding Template</h4>
                    </Link>
                    <ul className="titlebtm">
                      <li>
                        <Image
                          className="auth-img"
                          src={withBasePath("/images/auth2.jpg")}
                          alt="author image"
                          width={40}
                          height={40}
                        />
                        <p>
                          <Link href="#">BackTheme</Link>
                        </p>
                      </li>
                      <li className="out_of_class_name">
                        <div className="sell">
                          <p>
                            <span className="lnr lnr-cart"></span>
                            <span>27</span>
                          </p>
                        </div>
                        <div className="rating product--rating">
                          <ul>{renderStars(4.5)}</ul>
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div className="product-purchase">
                    <div className="price_love">
                      <span>15$</span>
                    </div>
                    <Link href="#">
                      <span className="lnr lnr-book"></span>Plugin
                    </Link>
                  </div>
                </div>
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
