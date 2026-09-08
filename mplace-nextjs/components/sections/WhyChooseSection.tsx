export default function WhyChooseSection() {
  const features = [
    {
      id: 1,
      count: "01",
      icon: "lnr-license",
      iconColor: "pcolor",
      title: "Digital-first catalog",
      description:
        "Find templates, source code, UI kits, graphics, and other resources built for digital work.",
    },
    {
      id: 2,
      count: "02",
      icon: "lnr-magic-wand",
      iconColor: "scolor",
      title: "Built for creators",
      description:
        "Independent creators can publish their work and build a storefront around what they make best.",
    },
    {
      id: 3,
      count: "03",
      icon: "lnr-lock",
      iconColor: "mcolor1",
      title: "Clear product details",
      description:
        "Browse previews, categories, seller details, ratings, and pricing before choosing a product.",
    },
    {
      id: 4,
      count: "04",
      icon: "lnr-chart-bars",
      iconColor: "mcolor2",
      title: "Simple discovery",
      description:
        "Use search and focused categories to get to the right digital resource faster.",
    },
    {
      id: 5,
      count: "05",
      icon: "lnr-leaf",
      iconColor: "mcolor3",
      title: "Made to move with you",
      description:
        "Keep your purchases, favorites, and seller tools together in one marketplace account.",
    },
    {
      id: 6,
      count: "06",
      icon: "lnr-phone",
      iconColor: "mcolor4",
      title: "Support when needed",
      description:
        "Use the support tools when you need help with an account or marketplace experience.",
    },
  ]

  return (
    <section className="why_choose section--padding">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="section-title">
              <h1>
                Why creators choose <span className="highlighted">MarketNest</span>
              </h1>
              <p>
                A focused home for digital products, with practical tools for both buyers and independent sellers.
              </p>
            </div>
          </div>
        </div>

        <div className="row">
          {features.map((feature) => (
            <div key={feature.id} className="col-lg-4 col-md-6">
              <div className="feature2">
                <span className="feature2__count">{feature.count}</span>
                <div className="feature2__content">
                  <span className={`lnr ${feature.icon} ${feature.iconColor}`}></span>
                  <h3 className="feature2-title">{feature.title}</h3>
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

