import { withBasePath } from "@/utils/paths"

export default function FeaturesSection() {
  const features = [
    {
      image: withBasePath("/images/feature1.png"),
      title: "Best UX Research",
      description: "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet diam congue is laoreet elit metus.",
    },
    {
      image: withBasePath("/images/feature2.png"),
      title: "Fully Responsive",
      description: "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet diam congue is laoreet elit metus.",
    },
    {
      image: withBasePath("/images/feature3.png"),
      title: "Buy & Sell Easily",
      description: "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet diam congue is laoreet elit metus.",
    },
  ]

  return (
    <section className="features section--padding">
      <div className="container">
        <div className="row">
          {features.map((feature, index) => (
            <div key={index} className="col-lg-4 col-md-6">
              <div className="feature">
                <div className="feature__img">
                  <img src={feature.image} alt={feature.title} />
                </div>
                <div className="feature__title">
                  <h3>{feature.title}</h3>
                </div>
                <div className="feature__desc">
                  <p>{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

