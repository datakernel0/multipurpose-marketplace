import Link from "next/link"
import { withBasePath } from "@/utils/paths"

export default function ProposalAreaSection() {
  const bbgImage = withBasePath("/images/bbg.png")
  const sbgImage = withBasePath("/images/sbg.png")
  return (
    <section className="proposal-area">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-6 no-padding">
            <div className="proposal proposal--left bgimage">
              <div
                className="bg_image_holder"
                style={{
                  backgroundImage: `url(${bbgImage})`,
                  opacity: 1,
                }}
              >
                <img src={bbgImage} alt="prop image" />
              </div>
              <div className="content_above">
                <div className="proposal__icon">
                  <img src={withBasePath("/images/buy.png")} alt="Buy icon" />
                </div>
                <div className="proposal__content">
                  <h1 className="text--white">Start Selling Digital Products</h1>
                  <p className="text--white">
                    Share your templates, code, graphics, and resources with people looking for their next digital tool.
                  </p>
                </div>
                <Link href="#" className="btn--round btn btn--lg btn--white">
                  Become a Seller
                </Link>
              </div>
            </div>
          </div>

          <div className="col-md-6 no-padding">
            <div className="proposal proposal--right">
              <div
                className="bg_image_holder"
                style={{
                  backgroundImage: `url(${sbgImage})`,
                  opacity: 1,
                }}
              >
                <img src={sbgImage} alt="this is magic" />
              </div>
              <div className="content_above">
                <div className="proposal__icon">
                  <img src={withBasePath("/images/sell.png")} alt="Sell icon" />
                </div>
                <div className="proposal__content">
                  <h1 className="text--white">Find Your Next Resource</h1>
                  <p className="text--white">
                    Browse a focused collection of digital products from independent creators.
                  </p>
                </div>
                <Link href="#" className="btn--round btn btn--lg btn--white">
                  Browse Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

