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
              <h1 className="text--white">Ready to Join Our Marketplace!</h1>
              <h4 className="text--white">Over 25,000 designers and developers trust the MartPlace.</h4>
              <Link href="#" className="btn btn--lg btn--round btn--white callto-action-btn">
                Join Us Today
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

