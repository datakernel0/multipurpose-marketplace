"use client"

import Link from "next/link"
import { withBasePath } from "@/utils/paths"

export default function PromotionAreaSection() {
  return (
    <section className="promotion-area">
      <div className="container">
        <div className="row">
          <div className="col-md-6 v_middle">
            <div className="promotion-img">
              <img src={withBasePath("/images/bubdle.jpg")} alt="Promotion image" />
            </div>
          </div>

          <div className="col-lg-5 offset-lg-1 col-md-6 v_middle">
            <div className="promotion-content">
              <h3 className="promotion__subtitle">Big Extension Bundle</h3>
              <h1 className="promotion__title">
                Get Them All For Only $289!
                <span>Save 35%</span>
              </h1>
              <p>
                Get all of our products in one bundle and save %35 of regular price. Over 50 plugins, 20 extensions
                and 30 components will be yours!
              </p>
              <Link href="#" className="btn btn--lg btn--round">
                View Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

