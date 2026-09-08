import Link from "next/link"

export default function FeaturesSection() {
  const features = [
    {
      icon: "lnr-laptop",
      title: "Templates",
      description: "Ready-to-use layouts, documents, and creative starting points.",
    },
    {
      icon: "lnr-code",
      title: "Source Code",
      description: "Practical code, plugins, and developer resources for your next build.",
    },
    {
      icon: "lnr-picture",
      title: "Graphics & UI Kits",
      description: "Visual assets and interface systems to help ideas take shape.",
    },
  ]

  return (
    <section className="features section--padding" aria-labelledby="popular-categories-title">
      <div className="container">
        <div className="section-title text-center">
          <h2 id="popular-categories-title">Popular Categories</h2>
          <p>Start with a category and find a digital resource that fits your next idea.</p>
        </div>
        <div className="row">
            {features.map((feature) => (
              <div key={feature.title} className="col-lg-4 col-md-6">
              <Link href="/category-grid" className="feature marketnest-category-card">
                <div className="feature__img">
                  <span className={`lnr ${feature.icon}`} aria-hidden="true"></span>
                </div>
                <div className="feature__title">
                  <h3>{feature.title}</h3>
                </div>
                <div className="feature__desc">
                  <p>{feature.description}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

