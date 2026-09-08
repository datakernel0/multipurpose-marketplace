import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import Breadcrumb from "@/components/common/Breadcrumb"

export default function PaginationPage() {
  return (
    <div className="preload accordion-page">
      <Preloader />
      <Header />
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Pagination", active: true }]} title="Pagination" />
      <section className="section--padding2 bgcolor">
        <div className="container">
          <div className="row">
            <div className="col-md-8 offset-md-2">
              <div className="shortcode_module_title">
                <div className="dashboard__title">
                  <h3>Pagination 1</h3>
                </div>
              </div>

              <div className="shortcode_modules">
                <div className="modules__content">
                  <div className="pagination-area pagination-area2">
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
            </div>
          </div>
        </div>

        <div className="container">
          <div className="row">
            <div className="col-md-8 offset-md-2">
              <div className="shortcode_module_title">
                <div className="dashboard__title">
                  <h3>Pagination 2</h3>
                </div>
              </div>

              <div className="pagination-area">
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
        </div>
      </section>
      <Footer />
      <ScrollToTop />
    </div>
  )
}

