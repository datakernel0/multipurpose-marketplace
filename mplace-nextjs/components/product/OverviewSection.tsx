import Image from "next/image"
import { withBasePath } from "@/utils/paths"

export default function OverviewSection() {
  return (
    <section className="overview">
      <div className="single-feature">
        <div className="container">
          <div className="col-md-6 v_middle">
            <h2 className="overview-title">Template Features</h2>
            <p>
              Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceler isque the mattis, leo quam aliquet congue placerat mi id
              nisi interdum the mollis. Praesent pharetra, justo ut scel erisque the mattis, leo quam aliquet congue justo ut scelerisque. Praesent
              pharetra, justo ut scelerisque mattis leo quam aliquet congue justo ut scelerisque.
            </p>
          </div>

          <div className="col-md-6 v_middle">
            <Image src={withBasePath("/images/ov3.jpg")} alt="Overview image" width={600} height={400} />
          </div>
        </div>
      </div>

      <div className="single-feature bgcolor">
        <div className="container">
          <div className="col-md-6 v_middle">
            <Image src={withBasePath("/images/ov1.jpg")} alt="Overview image" width={600} height={400} />
          </div>

          <div className="col-md-6 v_middle">
            <h2 className="overview-title">Template Features</h2>
            <p>
              Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceler isque the mattis, leo quam aliquet congue placerat mi id
              nisi interdum the mollis. Praesent pharetra, justo ut scel erisque the mattis, leo quam.
            </p>
            <ul>
              <li>All the contents are easily customizable</li>
              <li>Responsive – supports all kinds of popular browsers and devices</li>
              <li>Clean code and Well-Optimized</li>
              <li>Individual Projects and services area</li>
              <li>Amazing blog including home page integration</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="single-feature">
        <div className="container">
          <div className="col-md-6 v_middle">
            <h2 className="overview-title">Template Features</h2>
            <p>
              Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceler isque the mattis, leo quam aliquet congue placerat mi id
              nisi interdum the mollis. Praesent pharetra, justo ut scel erisque the mattis, leo quam aliquet congue justo ut scelerisque. Praesent
              pharetra, justo ut scelerisque mattis leo quam aliquet congue justo ut scelerisque.
            </p>
          </div>

          <div className="col-md-6 v_middle">
            <Image src={withBasePath("/images/ov2.jpg")} alt="Overview image" width={600} height={400} />
          </div>
        </div>
      </div>
    </section>
  )
}

