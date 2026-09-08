"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { useState } from "react"

const links = [
  { href: "/category-grid", label: "All Categories" },
  { href: "/all-products?category=templates", label: "Templates" },
  { href: "/all-products?category=source-code", label: "Source Code" },
  { href: "/all-products?category=ui-kits", label: "UI Kits" },
  { href: "/all-products?category=graphics", label: "Graphics" },
  { href: "/all-products?category=themes", label: "Themes" },
  { href: "/all-products?category=plugins", label: "Plugins" },
  { href: "/all-products?category=ebooks", label: "Ebooks" },
  { href: "/all-products?category=ai-resources", label: "AI Resources" },
]

export default function MarketplaceNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)

  const closeMenu = () => setOpen(false)
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href)

  return (
    <nav className="navbar navbar-expand-md navbar-light mainmenu__menu marketnest-nav">
      <button
        className="navbar-toggler"
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-controls="marketnest-navigation"
        aria-expanded={open}
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div
        className={`collapse navbar-collapse ${open ? "show" : ""}`}
        id="marketnest-navigation"
      >
        <ul className="navbar-nav">
          {links.map((link) => (
            <li
              key={link.href}
              className={`nav-item ${isActive(link.href) ? "active" : ""}`}
            >
              <Link className="nav-link" href={link.href} onClick={closeMenu}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}