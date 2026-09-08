import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import CallToActionSection from "@/components/sections/CallToActionSection"
import Breadcrumb from "@/components/common/Breadcrumb"

export default function TimelinePage() {
  return (
    <div className="preload timeline-page">
      <Preloader />
      <Header />
      <Breadcrumb pageTitle="Timeline" paths={[{ name: "Timeline", link: "/timeline" }]} />
      <section className="section--padding">
        <div className="">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <ul className="timeline">
                  <li className="happening">
                    <div className="happening--period">
                      <p>February 2009</p>
                    </div>
                    <div className="happening--detail">
                      <h4 className="title">MartPlace was Launched</h4>
                      <p>
                        Nunc placerat mi id nisi interdum mollis. Praesent pharetra justo ut scelerisque the mattis, leo
                        quam aliquet diam congue is laoreet.
                      </p>
                    </div>
                  </li>

                  <li className="happening">
                    <div className="happening--period">
                      <p>February 2010</p>
                    </div>
                    <div className="happening--detail">
                      <h4 className="title">Launched Premium Version</h4>
                      <p>
                        Nunc placerat mi id nisi interdum mollis. Praesent pharetra justo ut scelerisque the mattis, leo
                        quam aliquet diam congue is laoreet.
                      </p>
                    </div>
                  </li>

                  <li className="happening">
                    <div className="happening--period">
                      <p>July 2012</p>
                    </div>
                    <div className="happening--detail">
                      <h4 className="title">3 Million Downloads Reached</h4>
                      <p>
                        Nunc placerat mi id nisi interdum mollis. Praesent pharetra justo ut scelerisque the mattis, leo
                        quam aliquet diam congue is laoreet.
                      </p>
                    </div>
                  </li>

                  <li className="happening">
                    <div className="happening--period">
                      <p>November 2015</p>
                    </div>
                    <div className="happening--detail">
                      <h4 className="title">50,000+ Community Members</h4>
                      <p>
                        Nunc placerat mi id nisi interdum mollis. Praesent pharetra justo ut scelerisque the mattis, leo
                        quam aliquet diam congue is laoreet.
                      </p>
                    </div>
                  </li>

                  <li className="happening">
                    <div className="happening--period">
                      <p>August 2016</p>
                    </div>
                    <div className="happening--detail">
                      <h4 className="title">Added Payoneer as a Payment Method</h4>
                      <p>
                        Nunc placerat mi id nisi interdum mollis. Praesent pharetra justo ut scelerisque the mattis, leo
                        quam aliquet diam congue is laoreet.
                      </p>
                    </div>
                  </li>
                </ul>
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

