"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { useState } from "react"

const links = [
  { href: "/", label: "Home" },
  { href: "/all-products", label: "Browse Products" },
  { href: "/category-grid", label: "Categories" },
  { href: "/dashboard/upload", label: "Become a Seller" },
  { href: "/favourites", label: "Favorites" },
  { href: "/cart", label: "Cart" },
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
          <li className={`nav-item ${isActive(session ? "/dashboard" : "/login") ? "active" : ""}`}>
            <Link
              className="nav-link"
              href={session ? "/dashboard" : "/login"}
              onClick={closeMenu}
            >
              {session ? "Account" : "Login"}
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}