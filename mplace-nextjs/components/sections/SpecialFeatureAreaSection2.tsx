import { withBasePath } from "@/utils/paths"

export default function SpecialFeatureAreaSection2() {
  return (
    <section className="special-feature-area bgcolor2 special-feature--2">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <div className="special-feature feature--1">
              <img src={withBasePath("/images/spf1.png")} alt="Special Feature image" />
              <h3 className="special__feature-title">
                30 Days Money Back <span className="highlight">Guarantee</span>
              </h3>
            </div>
          </div>

          <div className="col-md-6">
            <div className="special-feature feature--2">
              <img src={withBasePath("/images/spf2.png")} alt="Special Feature image" />
              <h3 className="special__feature-title">
                Fast and Friendly <span className="highlight">Support</span>
              </h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

