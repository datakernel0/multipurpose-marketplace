import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import CallToActionSection from "@/components/sections/CallToActionSection"
import Breadcrumb from "@/components/common/Breadcrumb"

export default function SocialPage() {
  return (
    <div className="preload social-page">
      <Preloader />
      <Header />
      <Breadcrumb pageTitle="Social" paths={[{ name: "Social", link: "/social" }]} />
      <section className="section--padding2 bgcolor">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="shortcode_modules">
                <div className="modules__title">
                  <h3>Social Icons</h3>
                </div>
                <div className="modules__content text-center">
                  <div className="social social--color--filled">
                    <ul>
                      <li>
                        <a href="#">
                          <span className="fa fa-facebook"></span>
                        </a>
                      </li>
                      <li>
                        <a href="#">
                          <span className="fa fa-twitter"></span>
                        </a>
                      </li>
                      <li>
                        <a href="#">
                          <span className="fa fa-google-plus"></span>
                        </a>
                      </li>
                      <li>
                        <a href="#">
                          <span className="fa fa-pinterest"></span>
                        </a>
                      </li>
                      <li>
                        <a href="#">
                          <span className="fa fa-linkedin"></span>
                        </a>
                      </li>
                      <li>
                        <a href="#">
                          <span className="fa fa-dribbble"></span>
                        </a>
                      </li>
                      <li>
                        <a href="#">
                          <span className="fa fa-instagram"></span>
                        </a>
                      </li>
                      <li>
                        <a href="#">
                          <span className="fa fa-vine"></span>
                        </a>
                      </li>
                      <li>
                        <a href="#">
                          <span className="fa fa-flickr"></span>
                        </a>
                      </li>
                      <li>
                        <a href="#">
                          <span className="fa fa-skype"></span>
                        </a>
                      </li>
                      <li>
                        <a href="#">
                          <span className="fa fa-tumblr"></span>
                        </a>
                      </li>
                      <li>
                        <a href="#">
                          <span className="fa fa-youtube"></span>
                        </a>
                      </li>
                    </ul>
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

