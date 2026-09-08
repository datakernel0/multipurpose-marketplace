import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import Breadcrumb from "@/components/common/Breadcrumb"
import Link from "next/link"
import { withBasePath } from "@/utils/paths"

export default function CardsPage() {
  return (
    <div className="preload cards-page">
      <Preloader />
      <Header />
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Cards", active: true }]} title="Cards" />
      <section className="bgcolor">
        <div className="section--padding3">
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
              <div className="col-lg-4 col-md-6">
                <div className="card_style1">
                  <figure className="card_style1__info">
                    <img src={withBasePath("/images/ev2.jpg")} alt="Event card thumbnail" />
                    <figcaption>
                      <Link href="/event-detail">
                        <h3>Web Design Conference in California</h3>
                      </Link>
                      <ul className="date_place">
                        <li>
                          <span className="lnr lnr-calendar-full"></span>
                          <p>May 17-19, 2019</p>
                        </li>
                        <li>
                          <span className="lnr lnr-map-marker"></span>
                          <p>California</p>
                        </li>
                      </ul>
                    </figcaption>
                  </figure>
                </div>
              </div>

              <div className="col-lg-4 col-md-6">
                <div className="card_style1">
                  <figure className="card_style1__info">
                    <img src={withBasePath("/images/ev3.jpg")} alt="Event card thumbnail" />
                    <figcaption>
                      <Link href="/event-detail">
                        <h3>The Tech Convention in Melbourne</h3>
                      </Link>
                      <ul className="date_place">
                        <li>
                          <span className="lnr lnr-calendar-full"></span>
                          <p>May 17-19, 2019</p>
                        </li>
                        <li>
                          <span className="lnr lnr-map-marker"></span>
                          <p>Melbourne</p>
                        </li>
                      </ul>
                    </figcaption>
                  </figure>
                </div>
              </div>

              <div className="col-lg-4 col-md-6">
                <div className="card_style1">
                  <figure className="card_style1__info">
                    <img src={withBasePath("/images/ev4.jpg")} alt="Event card thumbnail" />
                    <figcaption>
                      <Link href="/event-detail">
                        <h3>Web Seminar Company Presentation</h3>
                      </Link>
                      <ul className="date_place">
                        <li>
                          <span className="lnr lnr-calendar-full"></span>
                          <p>May 17-19, 2019</p>
                        </li>
                        <li>
                          <span className="lnr lnr-map-marker"></span>
                          <p>New York</p>
                        </li>
                      </ul>
                    </figcaption>
                  </figure>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="section--padding3">
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
              <div className="col-lg-6 col-md-6">
                <div className="card_style2">
                  <h4 className="card_style2__title">Senior Wordpress Developer Required</h4>
                  <div className="card_style2__location_type">
                    <p>
                      <span className="lnr lnr-map-marker"></span>New York City
                    </p>
                    <span className="type pcolorbg">Full Time</span>
                  </div>
                  <Link href="/job-detail">Learn More and Apply</Link>
                </div>
              </div>

              <div className="col-lg-6 col-md-6">
                <div className="card_style2">
                  <h4 className="card_style2__title">Front End Developer Required</h4>
                  <div className="card_style2__location_type">
                    <p>
                      <span className="lnr lnr-map-marker"></span>New York City
                    </p>
                    <span className="type mcolorbg1">Part Time</span>
                  </div>
                  <Link href="/job-detail">Learn More and Apply</Link>
                </div>
              </div>

              <div className="col-lg-6 col-md-6">
                <div className="card_style2">
                  <h4 className="card_style2__title">Ruby Developer, Platform Group</h4>
                  <div className="card_style2__location_type">
                    <p>
                      <span className="lnr lnr-map-marker"></span>New York City
                    </p>
                    <span className="type scolorbg">Remotely</span>
                  </div>
                  <Link href="/job-detail">Learn More and Apply</Link>
                </div>
              </div>

              <div className="col-lg-6 col-md-6">
                <div className="card_style2">
                  <h4 className="card_style2__title">Talent Acquisition Manager</h4>
                  <div className="card_style2__location_type">
                    <p>
                      <span className="lnr lnr-map-marker"></span>New York City
                    </p>
                    <span className="type pcolorbg">Full Time</span>
                  </div>
                  <Link href="/job-detail">Learn More and Apply</Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="section--padding2">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="shortcode_module_title">
                  <div className="dashboard__title">
                    <h3>Cards 3</h3>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-lg-4 col-md-6">
                <div className="news">
                  <div className="news__thumbnail">
                    <img src={withBasePath("/images/news1.png")} alt="News Thumbnail" />
                  </div>
                  <div className="news__content">
                    <Link href="#" className="news-title">
                      <h4>Web Design Trends in 2019</h4>
                    </Link>
                    <p>Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet congue.</p>
                  </div>
                  <div className="news__meta">
                    <div className="date">
                      <span className="lnr lnr-clock"></span>
                      <p>24 Feb 2019</p>
                    </div>
                    <div className="other">
                      <ul>
                        <li>
                          <span className="lnr lnr-bubble"></span>
                          <span>45</span>
                        </li>
                        <li>
                          <span className="lnr lnr-eye"></span>
                          <span>345</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-4 col-md-6">
                <div className="news">
                  <div className="news__thumbnail">
                    <img src={withBasePath("/images/news2.png")} alt="News Thumbnail" />
                  </div>
                  <div className="news__content">
                    <Link href="#" className="news-title">
                      <h4>The best advices to start your own project</h4>
                    </Link>
                    <p>Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet congue.</p>
                  </div>
                  <div className="news__meta">
                    <div className="date">
                      <span className="lnr lnr-clock"></span>
                      <p>15 Mar 2019</p>
                    </div>
                    <div className="other">
                      <ul>
                        <li>
                          <span className="lnr lnr-bubble"></span>
                          <span>45</span>
                        </li>
                        <li>
                          <span className="lnr lnr-eye"></span>
                          <span>345</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-4 col-md-6">
                <div className="news">
                  <div className="news__thumbnail">
                    <img src={withBasePath("/images/news1.png")} alt="News Thumbnail" />
                  </div>
                  <div className="news__content">
                    <Link href="#" className="news-title">
                      <h4>Best Tomato Sauce in town</h4>
                    </Link>
                    <p>Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet congue.</p>
                  </div>
                  <div className="news__meta">
                    <div className="date">
                      <span className="lnr lnr-clock"></span>
                      <p>20 Dec 2016</p>
                    </div>
                    <div className="other">
                      <ul>
                        <li>
                          <span className="lnr lnr-bubble"></span>
                          <span>45</span>
                        </li>
                        <li>
                          <span className="lnr lnr-eye"></span>
                          <span>345</span>
                        </li>
                      </ul>
                    </div>
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

