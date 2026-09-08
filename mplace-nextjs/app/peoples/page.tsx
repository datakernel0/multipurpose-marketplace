import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import CallToActionSection from "@/components/sections/CallToActionSection"
import Breadcrumb from "@/components/common/Breadcrumb"
import { withBasePath } from "@/utils/paths"
import Image from "next/image"
import Link from "next/link"

export default function PeoplesPage() {
  return (
    <div className="preload peoples-page">
      <Preloader />
      <Header />
      <Breadcrumb pageTitle="Peoples" paths={[{ name: "Peoples", link: "/peoples" }]} />
      <section className="bgcolor section--padding">
        <div className="shortcode_wrapper">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="shortcode_module_title">
                  <div className="dashboard__title">
                    <h3>Peoples 1</h3>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-3 col-md-4">
                <div className="single_team_member">
                  <figure>
                    <Image src={withBasePath("/images/team1.jpg")} alt="Team Member" width={300} height={300} />
                    <figcaption>
                      <div className="name_desig">
                        <h4>Douglus Khundu</h4>
                        <p>Software Engineer</p>
                      </div>

                      <div className="social">
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
                              <span className="fa fa-dribbble"></span>
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </figcaption>
                  </figure>
                </div>
              </div>

              <div className="col-lg-3 col-md-4">
                <div className="single_team_member">
                  <figure>
                    <Image src={withBasePath("/images/team2.jpg")} alt="Team Member" width={300} height={300} />
                    <figcaption>
                      <div className="name_desig">
                        <h4>Robert Jellybean</h4>
                        <p>Application Developer</p>
                      </div>

                      <div className="social">
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
                              <span className="fa fa-dribbble"></span>
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </figcaption>
                  </figure>
                </div>
              </div>

              <div className="col-lg-3 col-md-4">
                <div className="single_team_member">
                  <figure>
                    <Image src={withBasePath("/images/team3.jpg")} alt="Team Member" width={300} height={300} />
                    <figcaption>
                      <div className="name_desig">
                        <h4>Tomat Notfrut</h4>
                        <p>Js Developer</p>
                      </div>

                      <div className="social">
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
                              <span className="fa fa-dribbble"></span>
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </figcaption>
                  </figure>
                </div>
              </div>

              <div className="col-lg-3 col-md-4">
                <div className="single_team_member">
                  <figure>
                    <Image src={withBasePath("/images/team4.jpg")} alt="Team Member" width={300} height={300} />
                    <figcaption>
                      <div className="name_desig">
                        <h4>Naro Sundor</h4>
                        <p>CTO</p>
                      </div>

                      <div className="social">
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
                              <span className="fa fa-dribbble"></span>
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </figcaption>
                  </figure>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="shortcode_wrapper">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="shortcode_module_title">
                  <div className="dashboard__title">
                    <h3>Peoples 2</h3>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="single_speaker">
                  <div className="speaker__thumbnail">
                    <Image src={withBasePath("/images/speaker1.jpg")} alt="Speaker" width={200} height={200} />
                  </div>

                  <div className="speaker__detail">
                    <h4>Joshua Barajas</h4>
                    <span className="ocuup">Web Developer</span>
                    <p>
                      Nullam blandit hendrerit faucibus. Suspendisse hendrerit turpis dui Sed ac velit iaculis, condimentum.
                    </p>

                    <div className="speaker_social">
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
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="single_speaker">
                  <div className="speaker__thumbnail">
                    <Image src={withBasePath("/images/speaker2.jpg")} alt="Speaker" width={200} height={200} />
                  </div>

                  <div className="speaker__detail">
                    <h4>Thomas Rogers</h4>
                    <span className="ocuup">Digital Marketer</span>
                    <p>
                      Nullam blandit hendrerit faucibus. Suspendisse hendrerit turpis dui Sed ac velit iaculis, condimentum.
                    </p>

                    <div className="speaker_social">
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
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="single_speaker">
                  <div className="speaker__thumbnail">
                    <Image src={withBasePath("/images/speaker3.jpg")} alt="Speaker" width={200} height={200} />
                  </div>

                  <div className="speaker__detail">
                    <h4>Muri Kahn</h4>
                    <span className="ocuup">Software Enginner</span>
                    <p>
                      Nullam blandit hendrerit faucibus. Suspendisse hendrerit turpis dui Sed ac velit iaculis, condimentum.
                    </p>

                    <div className="speaker_social">
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
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="single_speaker">
                  <div className="speaker__thumbnail">
                    <Image src={withBasePath("/images/speaker4.jpg")} alt="Speaker" width={200} height={200} />
                  </div>

                  <div className="speaker__detail">
                    <h4>Robert Barrathleon</h4>
                    <span className="ocuup">Software Enginner</span>
                    <p>
                      Nullam blandit hendrerit faucibus. Suspendisse hendrerit turpis dui Sed ac velit iaculis, condimentum.
                    </p>

                    <div className="speaker_social">
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
                      </ul>
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

