import Link from "next/link"
import { withBasePath } from "@/utils/paths"

export default function CallToActionSection() {
  const bgImage = withBasePath("/images/calltobg.jpg")
  return (
    <section className="call-to-action bgimage">
      <div
        className="bg_image_holder"
        style={{
          backgroundImage: `url(${bgImage})`,
          opacity: 1,
        }}
      >
        <img src={bgImage} alt="" />
      </div>
      <div className="container content_above">
        <div className="row">
          <div className="col-md-12">
            <div className="call-to-wrap">
              <h1 className="text--white">Build your next project with MarketNest</h1>
              <h4 className="text--white">Discover. Sell. Grow.</h4>
              <Link href="/all-products" className="btn btn--lg btn--round btn--white callto-action-btn">
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

