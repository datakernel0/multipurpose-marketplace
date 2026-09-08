"use client"

import Link from "next/link"

interface BreadcrumbItem {
  label: string
  href?: string
  active?: boolean
}

interface BreadcrumbPath {
  name: string
  link: string
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[]
  title?: string
  pageTitle?: string
  paths?: BreadcrumbPath[]
  subtitle?: string
}

export default function Breadcrumb({ items, title, pageTitle, paths, subtitle }: BreadcrumbProps) {
  // Support both old format (items/title) and new format (paths/pageTitle)
  const breadcrumbItems: BreadcrumbItem[] = items || (paths ? [{ label: "Home", href: "/" }, ...paths.map(p => ({ label: p.name, href: p.link, active: p.link === paths[paths.length - 1]?.link }))] : [{ label: "Home", href: "/" }])
  const pageTitleText = title || pageTitle || ""

  return (
    <section className="breadcrumb-area">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="breadcrumb">
              <ul>
                {breadcrumbItems.map((item, index) => (
                  <li key={index} className={item.active ? "active" : ""}>
                    {item.href ? <Link href={item.href}>{item.label}</Link> : <a href="#">{item.label}</a>}
                  </li>
                ))}
              </ul>
            </div>
            <h1 className="page-title">{pageTitleText}</h1>
            {subtitle && <p className="subtitle" style={{ color: "#f3f3f8", fontSize: "20px", lineHeight: "1.5", marginTop: "10px", fontWeight: 300 }}>{subtitle}</p>}
          </div>
        </div>
      </div>
    </section>
  )
}

