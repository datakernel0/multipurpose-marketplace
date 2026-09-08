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
                  <h1 className="text--white">Sell Your Products</h1>
                  <p className="text--white">
                    Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam
                    aliquet diamcongue is laoreet elit metus.
                  </p>
                </div>
                <Link href="#" className="btn--round btn btn--lg btn--white">
                  Become an Author
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
                  <h1 className="text--white">Start Shopping Today</h1>
                  <p className="text--white">
                    Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam
                    aliquet diamcongue is laoreet elit metus.
                  </p>
                </div>
                <Link href="#" className="btn--round btn btn--lg btn--white">
                  Start Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

