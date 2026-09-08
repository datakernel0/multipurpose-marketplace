import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import CallToActionSection from "@/components/sections/CallToActionSection"
import Breadcrumb from "@/components/common/Breadcrumb"
import { withBasePath } from "@/utils/paths"
import Image from "next/image"

export default function BrandsPage() {
  return (
    <div className="preload brands-page">
      <Preloader />
      <Header />
      <Breadcrumb pageTitle="Brands" paths={[{ name: "Brands", link: "/brands" }]} />
      <section className="bgcolor section--padding">
        <div className="shortcode_wrapper">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="shortcode_module_title">
                  <div className="dashboard__title">
                    <h3>Brands 1</h3>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="partners">
                  <div className="partner">
                    <Image src={withBasePath("/images/cl1.png")} alt="partner image" width={150} height={80} />
                  </div>
                  <div className="partner">
                    <Image src={withBasePath("/images/cl2.png")} alt="partner image" width={150} height={80} />
                  </div>
                  <div className="partner">
                    <Image src={withBasePath("/images/cl3.png")} alt="partner image" width={150} height={80} />
                  </div>
                  <div className="partner">
                    <Image src={withBasePath("/images/cl4.png")} alt="partner image" width={150} height={80} />
                  </div>
                  <div className="partner">
                    <Image src={withBasePath("/images/cl2.png")} alt="partner image" width={150} height={80} />
                  </div>
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
                    <h3>Brands 2</h3>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <ul className="sponsores">
                  <li>
                    <Image src={withBasePath("/images/spn1.jpg")} alt="Sponsors image" width={250} height={150} />
                  </li>
                  <li>
                    <Image src={withBasePath("/images/sp2.jpg")} alt="Sponsors image" width={250} height={150} />
                  </li>
                  <li>
                    <Image src={withBasePath("/images/sp3.jpg")} alt="Sponsors image" width={250} height={150} />
                  </li>
                  <li>
                    <Image src={withBasePath("/images/spn1.jpg")} alt="Sponsors image" width={250} height={150} />
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

