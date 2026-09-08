import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import CallToActionSection from "@/components/sections/CallToActionSection"
import Breadcrumb from "@/components/common/Breadcrumb"

export default function InfoBoxPage() {
  return (
    <div className="preload info-box-page">
      <Preloader />
      <Header />
      <Breadcrumb pageTitle="Info Box" paths={[{ name: "Info Box", link: "/info-box" }]} />
      <section className="bgcolor section--padding">
        <div className="">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="shortcode_module_title">
                  <div className="dashboard__title">
                    <h3>Cards 1</h3>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-3 col-md-6">
                <div className="author-info author-info--dashboard mcolorbg4">
                  <p>Total Items</p>
                  <h3>4,369</h3>
                </div>
              </div>

              <div className="col-lg-3 col-md-6">
                <div className="author-info author-info--dashboard mcolorbg2">
                  <p>Monthly Sales</p>
                  <h3>$273.00</h3>
                </div>
              </div>

              <div className="col-lg-3 col-md-6">
                <div className="author-info author-info--dashboard mcolorbg3">
                  <p>Yearly Sales</p>
                  <h3>$2,249.00</h3>
                </div>
              </div>

              <div className="col-lg-3 col-md-6">
                <div className="author-info author-info--dashboard mcolorbg1">
                  <p>Lifetime Sales</p>
                  <h3>$5,583.00</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="shortcode_module_title">
                  <div className="dashboard__title">
                    <h3>Cards 2</h3>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-3 col-md-3">
                <div className="statement_info_card">
                  <div className="info_wrap">
                    <span className="lnr lnr-tag icon mcolorbg1"></span>
                    <div className="info">
                      <p>$4,563</p>
                      <span>Total Sales</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-3 col-md-3">
                <div className="statement_info_card">
                  <div className="info_wrap">
                    <span className="lnr lnr-cart icon mcolorbg2"></span>
                    <div className="info">
                      <p>$340</p>
                      <span>Total Purchases</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-3 col-md-3">
                <div className="statement_info_card">
                  <div className="info_wrap">
                    <span className="lnr lnr-dice icon mcolorbg3"></span>
                    <div className="info">
                      <p>$4,563</p>
                      <span>Total Sales</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-3 col-md-3">
                <div className="statement_info_card">
                  <div className="info_wrap">
                    <span className="lnr lnr-briefcase icon mcolorbg4"></span>
                    <div className="info">
                      <p>$3,690</p>
                      <span>Total Withdraw</span>
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

