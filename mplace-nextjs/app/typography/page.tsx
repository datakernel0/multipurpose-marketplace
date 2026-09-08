import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import Breadcrumb from "@/components/common/Breadcrumb"

export default function TypographyPage() {
  return (
    <div className="preload accordion-page">
      <Preloader />
      <Header />
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Typography", active: true }]} title="Typography" />
      <section className="section--padding2 bgcolor">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 offset-lg-2">
              <div className="shortcode_modules">
                <div className="modules__title">
                  <h3>Heading</h3>
                </div>
                <div className="modules__content typog">
                  <h1>h1. Default Heading</h1>
                  <h2>h2. Default Heading</h2>
                  <h3>h3. Default Heading</h3>
                  <h4>h4. Default Heading</h4>
                  <h5>h5. Default Heading</h5>
                  <h6>h6. Default Heading</h6>
                </div>
              </div>

              <div className="shortcode_modules">
                <div className="modules__title">
                  <h3>Heading Color</h3>
                </div>
                <div className="modules__content typog">
                  <h1 className="pcolor">h1. Default Heading</h1>
                  <h2 className="scolor">h2. Default Heading</h2>
                  <h3 className="mcolor1">h3. Default Heading</h3>
                  <h4 className="mcolor2">h4. Default Heading</h4>
                  <h5 className="mcolor3">h5. Default Heading</h5>
                  <h6 className="mcolor4">h6. Default Heading</h6>
                </div>
              </div>

              <div className="shortcode_modules">
                <div className="modules__title">
                  <h3>Standard Paragraph</h3>
                </div>
                <div className="modules__content typog">
                  <p>
                    Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattisleo quam aliquet congue. Nunc
                    placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattisleo quam aliquet congue. Nunc placerat
                    mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattisleo quam aliquet congue.
                  </p>
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

