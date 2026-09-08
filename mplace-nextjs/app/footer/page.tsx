import Breadcrumb from "@/components/common/Breadcrumb";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Preloader from "@/components/Preloader";
import ScrollToTop from "@/components/ScrollToTop";
import CallToActionSection from "@/components/sections/CallToActionSection";
import { withBasePath } from "@/utils/paths";
import Image from "next/image";
import Link from "next/link";

export default function FooterPage() {
  return (
    <div className="preload footer-page">
      <Preloader />
      <Header />
      <Breadcrumb
        pageTitle="Footer"
        paths={[{ name: "Footer", link: "/footer" }]}
      />
      <section className="section--padding">
        <div className="shortcode_wrapper">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="feature_title">
                  <h3>Footer Style 1</h3>
                </div>
              </div>
            </div>
          </div>
          <footer className="footer-area">
            <div className="footer-big section--padding">
              <div className="container">
                <div className="row">
                  <div className="col-lg-3 col-md-6">
                    <div className="info-footer">
                      <div className="info__logo">
                        <Image
                          src={withBasePath("/images/flogo.png")}
                          alt="footer logo"
                          width={150}
                          height={50}
                        />
                      </div>
                      <p className="info--text">
                        Nunc placerat mi id nisi interdum they mollis. Praesent
                        pharetra, justo ut scel erisque the mattis, leo quam.
                      </p>
                      <ul className="info-contact">
                        <li>
                          <span className="lnr lnr-phone info-icon"></span>
                          <span className="info">Phone: +6789-875-2235</span>
                        </li>
                        <li>
                          <span className="lnr lnr-envelope info-icon"></span>
                          <span className="info">support@backtheme.com</span>
                        </li>
                        <li>
                          <span className="lnr lnr-map-marker info-icon"></span>
                          <span className="info">
                            202 New Hampshire Avenue Northwest #100, New
                            York-2573
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="col-lg-5 col-md-6">
                    <div className="footer-menu">
                      <h4 className="footer-widget-title text--white">
                        Our Company
                      </h4>
                      <ul>
                        <li>
                          <Link href="#">How to Join Us</Link>
                        </li>
                        <li>
                          <Link href="#">How It Work</Link>
                        </li>
                        <li>
                          <Link href="#">Buying and Selling</Link>
                        </li>
                        <li>
                          <Link href="#">Testimonials</Link>
                        </li>
                        <li>
                          <Link href="#">Copyright Notice</Link>
                        </li>
                        <li>
                          <Link href="#">Refund Policy</Link>
                        </li>
                        <li>
                          <Link href="#">Affiliates</Link>
                        </li>
                      </ul>
                    </div>

                    <div className="footer-menu">
                      <h4 className="footer-widget-title text--white">
                        Help and FAQs
                      </h4>
                      <ul>
                        <li>
                          <Link href="#">How to Join Us</Link>
                        </li>
                        <li>
                          <Link href="#">How It Work</Link>
                        </li>
                        <li>
                          <Link href="#">Buying and Selling</Link>
                        </li>
                        <li>
                          <Link href="#">Testimonials</Link>
                        </li>
                        <li>
                          <Link href="#">Copyright Notice</Link>
                        </li>
                        <li>
                          <Link href="#">Refund Policy</Link>
                        </li>
                        <li>
                          <Link href="#">Affiliates</Link>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-12">
                    <div className="newsletter">
                      <h4 className="footer-widget-title text--white">
                        Newsletter
                      </h4>
                      <p>
                        Subscribe to get the latest news, update and offer
                        information. Don't worry, we won't send spam!
                      </p>
                      <div className="newsletter__form">
                        <form action="#">
                          <div className="field-wrapper">
                            <input
                              className="relative-field rounded"
                              type="text"
                              placeholder="Enter email"
                            />
                            <button className="btn btn--round" type="submit">
                              Submit
                            </button>
                          </div>
                        </form>
                      </div>

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
              </div>
            </div>

            <div className="mini-footer">
              <div className="container">
                <div className="row">
                  <div className="col-md-12">
                    <div className="copyright-text">
                      <p>
                        &copy; 2019 <Link href="#">MartPlace</Link>. All rights
                        reserved. Created by <Link href="#">BackTheme</Link>
                      </p>
                    </div>

                    <div className="go_top">
                      <span className="lnr lnr-chevron-up"></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>

        <div className="shortcode_wrapper">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="feature_title">
                  <h3>Footer Style 2</h3>
                </div>
              </div>
            </div>
          </div>
          <footer className="footer-area">
            <div className="footer-big section--padding">
              <div className="container">
                <div className="row">
                  <div className="col-lg-3 col-md-6">
                    <div className="footer-menu footer-menu--1">
                      <h4 className="footer-widget-title text--white">
                        Popular Category
                      </h4>
                      <ul>
                        <li>
                          <Link href="#">Wordpress</Link>
                        </li>
                        <li>
                          <Link href="#">Plugins</Link>
                        </li>
                        <li>
                          <Link href="#">Joomla Template</Link>
                        </li>
                        <li>
                          <Link href="#">Admin Template</Link>
                        </li>
                        <li>
                          <Link href="#">HTML Template</Link>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="col-lg-5 col-md-6">
                    <div className="footer-menu">
                      <h4 className="footer-widget-title text--white">
                        Our Company
                      </h4>
                      <ul>
                        <li>
                          <Link href="#">About Us</Link>
                        </li>
                        <li>
                          <Link href="#">How It Works</Link>
                        </li>
                        <li>
                          <Link href="#">Affiliates</Link>
                        </li>
                        <li>
                          <Link href="#">Testimonials</Link>
                        </li>
                        <li>
                          <Link href="#">Contact Us</Link>
                        </li>
                        <li>
                          <Link href="#">Plan & Pricing</Link>
                        </li>
                        <li>
                          <Link href="#">Blog</Link>
                        </li>
                      </ul>
                    </div>

                    <div className="footer-menu">
                      <h4 className="footer-widget-title text--white">
                        Help Support
                      </h4>
                      <ul>
                        <li>
                          <Link href="#">Support Forum</Link>
                        </li>
                        <li>
                          <Link href="#">Terms & Conditions</Link>
                        </li>
                        <li>
                          <Link href="#">Support Policy</Link>
                        </li>
                        <li>
                          <Link href="#">Refund Policy</Link>
                        </li>
                        <li>
                          <Link href="#">FAQs</Link>
                        </li>
                        <li>
                          <Link href="#">Buyers Faq</Link>
                        </li>
                        <li>
                          <Link href="#">Sellers Faq</Link>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-12">
                    <div className="newsletter">
                      <h4 className="footer-widget-title text--white">
                        Newsletter
                      </h4>
                      <p>
                        Subscribe to get the latest news, update and offer
                        information. Don't worry, we won't send spam!
                      </p>
                      <div className="newsletter__form">
                        <form action="#">
                          <div className="field-wrapper">
                            <input
                              className="relative-field rounded"
                              type="text"
                              placeholder="Enter email"
                            />
                            <button className="btn btn--round" type="submit">
                              Submit
                            </button>
                          </div>
                        </form>
                      </div>

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
              </div>
            </div>

            <div className="mini-footer">
              <div className="container">
                <div className="row">
                  <div className="col-md-12">
                    <div className="copyright-text">
                      <p>
                        &copy; 2019 <Link href="#">MartPlace</Link>. All rights
                        reserved. Created by <Link href="#">BackTheme</Link>
                      </p>
                    </div>

                    <div className="go_top">
                      <span className="lnr lnr-chevron-up"></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>

        <div className="shortcode_wrapper">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="feature_title">
                  <h3>Footer Style 3</h3>
                </div>
              </div>
            </div>
          </div>
          <footer className="footer-area footer--light">
            <div className="footer-big section--padding">
              <div className="container">
                <div className="row">
                  <div className="col-lg-3 col-md-6">
                    <div className="footer-menu footer-menu--1">
                      <h4 className="footer-widget-title">Popular Category</h4>
                      <ul>
                        <li>
                          <Link href="#">Wordpress</Link>
                        </li>
                        <li>
                          <Link href="#">Plugins</Link>
                        </li>
                        <li>
                          <Link href="#">Joomla Template</Link>
                        </li>
                        <li>
                          <Link href="#">Admin Template</Link>
                        </li>
                        <li>
                          <Link href="#">HTML Template</Link>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="col-lg-5 col-md-6">
                    <div className="footer-menu">
                      <h4 className="footer-widget-title">Our Company</h4>
                      <ul>
                        <li>
                          <Link href="#">About Us</Link>
                        </li>
                        <li>
                          <Link href="#">How It Works</Link>
                        </li>
                        <li>
                          <Link href="#">Affiliates</Link>
                        </li>
                        <li>
                          <Link href="#">Testimonials</Link>
                        </li>
                        <li>
                          <Link href="#">Contact Us</Link>
                        </li>
                        <li>
                          <Link href="#">Plan & Pricing</Link>
                        </li>
                        <li>
                          <Link href="#">Blog</Link>
                        </li>
                      </ul>
                    </div>

                    <div className="footer-menu">
                      <h4 className="footer-widget-title">Help Support</h4>
                      <ul>
                        <li>
                          <Link href="#">Support Forum</Link>
                        </li>
                        <li>
                          <Link href="#">Terms & Conditions</Link>
                        </li>
                        <li>
                          <Link href="#">Support Policy</Link>
                        </li>
                        <li>
                          <Link href="#">Refund Policy</Link>
                        </li>
                        <li>
                          <Link href="#">FAQs</Link>
                        </li>
                        <li>
                          <Link href="#">Buyers Faq</Link>
                        </li>
                        <li>
                          <Link href="#">Sellers Faq</Link>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-12">
                    <div className="newsletter">
                      <h4 className="footer-widget-title">Newsletter</h4>
                      <p>
                        Subscribe to get the latest news, update and offer
                        information. Don't worry, we won't send spam!
                      </p>
                      <div className="newsletter__form">
                        <form action="#">
                          <div className="field-wrapper">
                            <input
                              className="relative-field rounded"
                              type="text"
                              placeholder="Enter email"
                            />
                            <button className="btn btn--round" type="submit">
                              Submit
                            </button>
                          </div>
                        </form>
                      </div>

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
              </div>
            </div>

            <div className="mini-footer">
              <div className="container">
                <div className="row">
                  <div className="col-md-12">
                    <div className="copyright-text">
                      <p>
                        &copy; 2019 <Link href="#">MartPlace</Link>. All rights
                        reserved. Created by <Link href="#">BackTheme</Link>
                      </p>
                    </div>

                    <div className="go_top">
                      <span className="lnr lnr-chevron-up"></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </section>
      <CallToActionSection />
      <Footer />
      <ScrollToTop />
    </div>
  );
}
