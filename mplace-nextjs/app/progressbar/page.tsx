import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import CallToActionSection from "@/components/sections/CallToActionSection"
import Breadcrumb from "@/components/common/Breadcrumb"

export default function ProgressbarPage() {
  return (
    <div className="preload progressbar-page">
      <Preloader />
      <Header />
      <Breadcrumb pageTitle="Progressbar" paths={[{ name: "Progressbar", link: "/progressbar" }]} />
      <section className="section--padding2 bgcolor">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="shortcode_modules">
                <div className="modules__title">
                  <h3>Progress Bar 1</h3>
                </div>
                <div className="modules__content">
                  <div className="row">
                    <div className="col-lg-6 offset-lg-2">
                      <div className="progress_wrapper">
                        <div className="with_close">
                          <div className="labels clearfix">
                            <p>Thumbnail.jpg</p>
                            <span data-width="89">89%</span>
                          </div>
                          <div className="progress">
                            <div
                              className="progress-bar"
                              role="progressbar"
                              aria-valuenow={89}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              style={{ width: "89%" }}
                            >
                              <span className="sr-only">89% Complete</span>
                            </div>
                          </div>
                        </div>
                        <span className="p_cross lnr lnr-cross"></span>
                      </div>

                      <div className="progress_wrapper">
                        <div className="with_close">
                          <div className="labels clearfix">
                            <p>WordPress Blog Theme.zip</p>
                            <span data-width="82">82%</span>
                          </div>
                          <div className="progress">
                            <div
                              className="progress-bar"
                              role="progressbar"
                              aria-valuenow={82}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              style={{ width: "82%" }}
                            >
                              <span className="sr-only">82% Complete</span>
                            </div>
                          </div>
                        </div>
                        <span className="p_cross lnr lnr-cross"></span>
                      </div>

                      <div className="progress_wrapper">
                        <div className="with_close">
                          <div className="labels clearfix">
                            <p>Screenshots.zip</p>
                            <span data-width="70">70%</span>
                          </div>
                          <div className="progress">
                            <div
                              className="progress-bar"
                              role="progressbar"
                              aria-valuenow={70}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              style={{ width: "70%" }}
                            >
                              <span className="sr-only">70% Complete</span>
                            </div>
                          </div>
                        </div>
                        <span className="p_cross lnr lnr-cross"></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="shortcode_modules">
                <div className="modules__title">
                  <h3>Progress Bar 2</h3>
                </div>
                <div className="modules__content">
                  <div className="row">
                    <div className="col-lg-6 offset-lg-2">
                      <div className="progress_wrapper">
                        <div className="labels clearfix">
                          <p>Thumbnail.jpg</p>
                          <span data-width="89">89%</span>
                        </div>
                        <div className="progress">
                          <div
                            className="progress-bar"
                            role="progressbar"
                            aria-valuenow={89}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            style={{ width: "89%" }}
                          >
                            <span className="sr-only">89% Complete</span>
                          </div>
                        </div>
                      </div>

                      <div className="progress_wrapper">
                        <div className="labels clearfix">
                          <p>WordPress Blog Theme.zip</p>
                          <span data-width="82">82%</span>
                        </div>
                        <div className="progress">
                          <div
                            className="progress-bar"
                            role="progressbar"
                            aria-valuenow={82}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            style={{ width: "82%" }}
                          >
                            <span className="sr-only">82% Complete</span>
                          </div>
                        </div>
                      </div>

                      <div className="progress_wrapper">
                        <div className="labels clearfix">
                          <p>Screenshots.zip</p>
                          <span data-width="70">70%</span>
                        </div>
                        <div className="progress">
                          <div
                            className="progress-bar"
                            role="progressbar"
                            aria-valuenow={70}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            style={{ width: "70%" }}
                          >
                            <span className="sr-only">70% Complete</span>
                          </div>
                        </div>
                      </div>
                    </div>
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
  )
}

