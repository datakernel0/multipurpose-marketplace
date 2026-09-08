import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import Breadcrumb from "@/components/common/Breadcrumb"

export default function ButtonsPage() {
  return (
    <div className="preload accordion-page">
      <Preloader />
      <Header />
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Buttons", active: true }]} title="Buttons" />
      <section className="section--padding2 bgcolor">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="shortcode_modules">
                <div className="modules__title">
                  <h3>Basic Buttons</h3>
                </div>
                <div className="modules__content">
                  <button className="btn btn-lg btn--round">Primary</button>
                  <button className="btn btn-lg btn--round btn-secondary">Secondary</button>
                  <button className="btn btn-lg btn--round btn-success">Success</button>
                  <button className="btn btn-lg btn--round btn-info">Info</button>
                  <button className="btn btn-lg btn--round btn-warning">Warning</button>
                  <button className="btn btn-lg btn--round btn-danger">Danger</button>
                  <button className="btn btn-lg btn--round btn-light">Light</button>
                  <button className="btn btn-lg btn--round btn-dark">Dark</button>
                </div>
              </div>

              <div className="shortcode_modules">
                <div className="modules__title">
                  <h3>Buttons with Icons</h3>
                </div>
                <div className="modules__content">
                  <button className="btn btn-lg btn--icon btn--round">
                    <span className="lnr lnr-home"></span>Large
                  </button>
                  <button className="btn btn--icon btn-default btn--round btn-secondary">
                    <span className="lnr lnr-cog"></span>Default
                  </button>
                  <button className="btn btn--icon btn-md btn--round btn-success">
                    <span className="lnr lnr-bullhorn"></span>Medium
                  </button>
                  <button className="btn btn--icon btn-sm btn--round btn-info">
                    <span className="lnr lnr-thumbs-up"></span>Small
                  </button>
                  <button className="btn btn--icon btn-sm btn-warning">
                    <span className="lnr lnr-alarm"></span>Small
                  </button>
                </div>
              </div>

              <div className="shortcode_modules">
                <div className="modules__title">
                  <h3>Square Buttons</h3>
                </div>
                <div className="modules__content">
                  <button className="btn btn-lg">Primary</button>
                  <button className="btn btn-lg btn-secondary">Secondary</button>
                  <button className="btn btn-lg btn-success">Success</button>
                  <button className="btn btn-lg btn-info">Info</button>
                  <button className="btn btn-lg btn-warning">Warning</button>
                  <button className="btn btn-lg btn-danger">Danger</button>
                  <button className="btn btn-lg btn-light">Light</button>
                  <button className="btn btn-lg btn-dark">Dark</button>
                </div>
              </div>

              <div className="shortcode_modules">
                <div className="modules__title">
                  <h3>Border Buttons</h3>
                </div>
                <div className="modules__content">
                  <button className="btn btn--round btn--bordered btn-lg">Primary</button>
                  <button className="btn btn--round btn--bordered btn-lg btn-secondary">Secondary</button>
                  <button className="btn btn--round btn--bordered btn-lg btn-success">Success</button>
                  <button className="btn btn--round btn--bordered btn-lg btn-info">Info</button>
                  <button className="btn btn--round btn--bordered btn-lg btn-warning">Warning</button>
                  <button className="btn btn--round btn--bordered btn-lg btn-danger">Danger</button>
                  <button className="btn btn--round btn--bordered btn-lg btn-dark">Dark</button>
                </div>
              </div>

              <div className="shortcode_modules">
                <div className="modules__title">
                  <h3>Buttons Size</h3>
                </div>
                <div className="modules__content">
                  <div>
                    <button className="btn btn--round btn-lg">Button Large</button>
                    <button className="btn btn--round btn--bordered btn-lg btn-secondary">Button Large</button>
                    <button className="btn btn-lg btn-success">Button Large</button>
                    <button className="btn btn--icon btn-lg btn--round btn-secondary">
                      <span className="lnr lnr-cog"></span>Button Large
                    </button>
                  </div>

                  <div>
                    <button className="btn btn--round btn-default">Button Default</button>
                    <button className="btn btn--round btn--bordered btn-default btn-secondary">Button Default</button>
                    <button className="btn btn-default btn-success">Button Default</button>
                    <button className="btn btn--icon btn-default btn--round btn-secondary">
                      <span className="lnr lnr-cog"></span>Button Default
                    </button>
                  </div>

                  <div>
                    <button className="btn btn--round btn-md">Button Medium</button>
                    <button className="btn btn--round btn--bordered btn-md btn-secondary">Button Medium</button>
                    <button className="btn btn-md btn-success">Button Medium</button>
                    <button className="btn btn--icon btn-md btn--round btn-secondary">
                      <span className="lnr lnr-cog"></span>Button Medium
                    </button>
                  </div>

                  <div>
                    <button className="btn btn--round btn-sm">Button Small</button>
                    <button className="btn btn--round btn--bordered btn-sm btn-secondary">Button Small</button>
                    <button className="btn btn-sm btn-success">Button Small</button>
                    <button className="btn btn--icon btn-sm btn--round btn-secondary">
                      <span className="lnr lnr-cog"></span>Button Small
                    </button>
                  </div>
                </div>
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

