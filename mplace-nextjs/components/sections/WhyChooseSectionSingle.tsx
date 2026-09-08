"use client"

import { withBasePath } from "@/utils/paths"

export default function WhyChooseSectionSingle() {
  const features = [
    {
      id: 1,
      count: "01",
      icon: "lnr-license",
      iconColor: "pcolor",
      title: "One Time Payment",
      description:
        "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet diam congue is laoreet elit metus.",
    },
    {
      id: 2,
      count: "02",
      icon: "lnr-magic-wand",
      iconColor: "scolor",
      title: "Quality Products",
      description:
        "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet diam congue is laoreet elit metus.",
    },
    {
      id: 3,
      count: "03",
      icon: "lnr-lock",
      iconColor: "mcolor1",
      title: "100% Secure Paymentt",
      description:
        "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet diam congue is laoreet elit metus.",
    },
    {
      id: 4,
      count: "04",
      icon: "lnr-chart-bars",
      iconColor: "mcolor2",
      title: "Well Organized Code",
      description:
        "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet diam congue is laoreet elit metus.",
    },
    {
      id: 5,
      count: "05",
      icon: "lnr-leaf",
      iconColor: "mcolor3",
      title: "Life Time Free Update",
      description:
        "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet diam congue is laoreet elit metus.",
    },
    {
      id: 6,
      count: "06",
      icon: "lnr-phone",
      iconColor: "mcolor4",
      title: "Fast and Friendly Support",
      description:
        "Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet diam congue is laoreet elit metus.",
    },
  ]

  return (
    <section className="why_choose section--padding">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="section-title">
              <h1>
                Why Choose <span className="highlighted">MartPlace</span>
              </h1>
              <p>
                Laborum dolo rumes fugats untras. Etharums ser quidem rerum facilis dolores nemis omnis fugats. Lid est laborum
                dolo rumes fugats untras.
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

