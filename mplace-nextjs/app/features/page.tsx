import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import CallToActionSection from "@/components/sections/CallToActionSection"
import Breadcrumb from "@/components/common/Breadcrumb"
import { withBasePath } from "@/utils/paths"
import Image from "next/image"

export default function FeaturesPage() {
  return (
    <div className="preload features-page">
      <Preloader />
      <Header />
      <Breadcrumb pageTitle="Features Block" paths={[{ name: "Features Block", link: "/features" }]} />
      <section className="section--padding3">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="feature_title">
                <h3>Features Block 1</h3>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-4">
              <div className="feature">
                <div className="feature__img">
                  <Image src={withBasePath("/images/feature1.png")} alt="feature" width={150} height={150} />
                </div>
                <div className="feature__title">
                  <h3>Best UX Research</h3>
                </div>
                <div className="feature__desc">
                  <p>
                    Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam
                    aliquet diam congue is laoreet elit metus.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="feature">
                <div className="feature__img">
                  <Image src={withBasePath("/images/feature2.png")} alt="feature" width={150} height={150} />
                </div>
                <div className="feature__title">
                  <h3>Fully Responsive</h3>
                </div>
                <div className="feature__desc">
                  <p>
                    Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam
                    aliquet diam congue is laoreet elit metus.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="feature">
                <div className="feature__img">
                  <Image src={withBasePath("/images/feature3.png")} alt="feature" width={150} height={150} />
                </div>
                <div className="feature__title">
                  <h3>Buy & Sell Easily</h3>
                </div>
                <div className="feature__desc">
                  <p>
                    Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam
                    aliquet diam congue is laoreet elit metus.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section--padding3">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="feature_title">
                <h3>Features Block 2</h3>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-4 col-md-6">
              <div className="feature2">
                <span className="feature2__count">01</span>
                <div className="feature2__content">
                  <span className="lnr lnr-license pcolor"></span>
                  <h3 className="feature2-title">One Time Payment</h3>
                  <p>
                    Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam
                    aliquet diam congue is laoreet elit metus.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="feature2">
                <span className="feature2__count">02</span>
                <div className="feature2__content">
                  <span className="lnr lnr-magic-wand scolor"></span>
                  <h3 className="feature2-title">Quality Products</h3>
                  <p>
                    Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam
                    aliquet diam congue is laoreet elit metus.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="feature2">
                <span className="feature2__count">03</span>
                <div className="feature2__content">
                  <span className="lnr lnr-lock mcolor1"></span>
                  <h3 className="feature2-title">100% Secure Paymentt</h3>
                  <p>
                    Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam
                    aliquet diam congue is laoreet elit metus.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="feature2">
                <span className="feature2__count">04</span>
                <div className="feature2__content">
                  <span className="lnr lnr-chart-bars mcolor2"></span>
                  <h3 className="feature2-title">Well Organized Code</h3>
                  <p>
                    Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam
                    aliquet diam congue is laoreet elit metus.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="feature2">
                <span className="feature2__count">05</span>
                <div className="feature2__content">
                  <span className="lnr lnr-leaf mcolor3"></span>
                  <h3 className="feature2-title">Life Time Free Update</h3>
                  <p>
                    Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam
                    aliquet diam congue is laoreet elit metus.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="feature2">
                <span className="feature2__count">06</span>
                <div className="feature2__content">
                  <span className="lnr lnr-phone mcolor4"></span>
                  <h3 className="feature2-title">Fast and Friendly Support</h3>
                  <p>
                    Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam
                    aliquet diam congue is laoreet elit metus.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section--padding2">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="feature_title">
                <h3>Features Block 3</h3>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-4 col-md-6">
              <div className="single_feature">
                <div className="feature__icon">
                  <span className="lnr lnr-home"></span>
                </div>

                <div className="feature__content">
                  <h3>Work From Anywhere</h3>
                  <p>
                    Laborum dolo rumes fugats untras. Etharums quidem rerum facilis lores nemis omnis fugats. Lid est laborum
                    dolo rumes fugats untras aborum dolo rumes.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="single_feature">
                <div className="feature__icon">
                  <span className="lnr lnr-magic-wand"></span>
                </div>

                <div className="feature__content">
                  <h3>Work From Anywhere</h3>
                  <p>
                    Laborum dolo rumes fugats untras. Etharums quidem rerum facilis lores nemis omnis fugats. Lid est laborum
                    dolo rumes fugats untras aborum dolo rumes.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="single_feature">
                <div className="feature__icon">
                  <span className="lnr lnr-bicycle"></span>
                </div>

                <div className="feature__content">
                  <h3>Work From Anywhere</h3>
                  <p>
                    Laborum dolo rumes fugats untras. Etharums quidem rerum facilis lores nemis omnis fugats. Lid est laborum
                    dolo rumes fugats untras aborum dolo rumes.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="single_feature">
                <div className="feature__icon">
                  <span className="lnr lnr-heart-pulse"></span>
                </div>

                <div className="feature__content">
                  <h3>Work From Anywhere</h3>
                  <p>
                    Laborum dolo rumes fugats untras. Etharums quidem rerum facilis lores nemis omnis fugats. Lid est laborum
                    dolo rumes fugats untras aborum dolo rumes.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="single_feature">
                <div className="feature__icon">
                  <span className="lnr lnr-leaf"></span>
                </div>

                <div className="feature__content">
                  <h3>Work From Anywhere</h3>
                  <p>
                    Laborum dolo rumes fugats untras. Etharums quidem rerum facilis lores nemis omnis fugats. Lid est laborum
                    dolo rumes fugats untras aborum dolo rumes.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="single_feature">
                <div className="feature__icon">
                  <span className="lnr lnr-rocket"></span>
                </div>

                <div className="feature__content">
                  <h3>Work From Anywhere</h3>
                  <p>
                    Laborum dolo rumes fugats untras. Etharums quidem rerum facilis lores nemis omnis fugats. Lid est laborum
                    dolo rumes fugats untras aborum dolo rumes.
                  </p>
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
  )
}

