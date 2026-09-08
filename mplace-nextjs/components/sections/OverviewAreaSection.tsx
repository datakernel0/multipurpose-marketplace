"use client"

import { withBasePath } from "@/utils/paths"

export default function OverviewAreaSection() {
  return (
    <section className="overview-area section--padding">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="section-title">
              <h1>
                Save Time and Make Your Projects Looks Like
                <span className="highlighted">Eye Catching</span>
              </h1>
              <p>
                Laborum dolo rumes fugats untras. Etharums ser quidem rerum facilis dolores nemis omnis fugats. Lid
                est laborum dolo rumes fugats untras.
              </p>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-4 offset-lg-1 col-md-6 v_middle overview_cont">
            <div className="overview-icon">
              <img src={withBasePath("/images/fac1.png")} alt="overview icon" />
            </div>
          </div>

          <div className="col-lg-5 offset-lg-1 col-md-6 v_middle overview_cont">
            <div className="step_num">01</div>
            <h2 className="overview-title">Best Quality Products</h2>
            <p>
              Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam
              aliquet congue placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis,
              leo quam aliquet.
            </p>
          </div>

          <div className="col-lg-5 offset-lg-1 col-md-6 v_middle overview_cont">
            <div className="step_num">02</div>
            <h2 className="overview-title">Easy to Install & Use</h2>
            <p>
              Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam
              aliquet congue placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis,
              leo quam aliquet.
            </p>
          </div>

          <div className="col-lg-4 offset-lg-1 col-md-6 v_middle overview_cont">
            <div className="overview-icon">
              <img src={withBasePath("/images/fac2.png")} alt="overview icon" />
            </div>
          </div>

          <div className="col-lg-4 offset-lg-1 col-md-6 v_middle overview_cont">
            <div className="overview-icon">
              <img src={withBasePath("/images/fac3.png")} alt="overview icon" />
            </div>
          </div>

          <div className="col-lg-5 offset-lg-1 col-md-6 v_middle overview_cont">
            <div className="step_num">03</div>
            <h2 className="overview-title">Fully Editable Content & Elements</h2>
            <p>
              Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam
              aliquet congue placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis,
              leo quam aliquet.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

