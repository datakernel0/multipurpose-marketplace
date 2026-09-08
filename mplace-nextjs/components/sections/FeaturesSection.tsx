import Link from "next/link"

export default function FeaturesSection() {
  const features = [
    { icon: "lnr-laptop", title: "Templates", slug: "templates" },
    { icon: "lnr-code", title: "Source Code", slug: "source-code" },
    { icon: "lnr-layers", title: "UI Kits", slug: "ui-kits" },
    { icon: "lnr-picture", title: "Graphics", slug: "graphics" },
    { icon: "lnr-screen", title: "Themes", slug: "themes" },
    { icon: "lnr-plug", title: "Plugins", slug: "plugins" },
    { icon: "lnr-book", title: "Ebooks", slug: "ebooks" },
    { icon: "lnr-file-empty", title: "Excel Templates", slug: "excel-templates" },
    { icon: "lnr-chart-bars", title: "Power BI Templates", slug: "power-bi-templates" },
    { icon: "lnr-magic-wand", title: "AI Resources", slug: "ai-resources" },
    { icon: "lnr-music-note", title: "Audio", slug: "audio" },
    { icon: "lnr-camera-video", title: "Video", slug: "video" },
  ]

  return (
    <section className="features marketnest-categories section--padding" aria-labelledby="popular-categories-title">
      <div className="container">
        <div className="marketnest-section-heading">
          <div>
            <span className="marketnest-eyebrow">Browse the marketplace</span>
            <h2 id="popular-categories-title">Shop by category</h2>
          </div>
          <p>Start with a category and find a digital resource that fits your next idea.</p>
        </div>
        <div className="marketnest-category-grid">
            {features.map((feature) => (
              <Link key={feature.title} href={`/all-products?category=${feature.slug}`} className="marketnest-category-card">
                <span className={`lnr ${feature.icon}`} aria-hidden="true"></span>
                <span>{feature.title}</span>
                <small>Explore products <span aria-hidden="true">→</span></small>
              </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

