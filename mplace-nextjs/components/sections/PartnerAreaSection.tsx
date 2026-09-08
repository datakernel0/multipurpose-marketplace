"use client"

import { withBasePath } from "@/utils/paths"

export default function PartnerAreaSection() {
  const partners = [
    { id: 1, image: withBasePath("/images/cl1.png") },
    { id: 2, image: withBasePath("/images/cl2.png") },
    { id: 3, image: withBasePath("/images/cl3.png") },
    { id: 4, image: withBasePath("/images/cl4.png") },
    { id: 5, image: withBasePath("/images/cl2.png") },
  ]

  return (
    <section className="partner-area section--padding bgimage">
      <div className="bg_image_holder">
        <img src={withBasePath("/images/ptbg.png")} alt="" />
      </div>
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="section-title">
              <h1>
                Websites That Use
                <span className="highlighted">MarketNest</span>
              </h1>
              <p>
                Laborum dolo rumes fugats untras. Etharums ser quidem rerum facilis dolores nemis omnis fugats. Lid
                est laborum dolo rumes fugats untras.
              </p>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="partners">
              {partners.map((partner) => (
                <div key={partner.id} className="partner">
                  <img src={partner.image} alt="partner image" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

