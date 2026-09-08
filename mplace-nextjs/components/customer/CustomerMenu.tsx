"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

interface CustomerMenuItem {
  href: string
  icon: string
  label: string
}

export default function CustomerMenu() {
  const pathname = usePathname()

  const menuItems: CustomerMenuItem[] = [
    { href: "/dashboard", icon: "lnr-home", label: "Dashboard" },
    { href: "/dashboard/customer", icon: "lnr-briefcase", label: "My Purchases / Orders" },
    { href: "/customer/downloads", icon: "lnr-download", label: "Downloads" },
    { href: "/favourites", icon: "lnr-heart", label: "Favorites" },
    { href: "/author/reviews", icon: "lnr-star", label: "Reviews" },
    { href: "/notification", icon: "lnr-alarm", label: "Notifications" },
    { href: "/contact", icon: "lnr-bubble", label: "Support" },
    { href: "/dashboard/customer/info", icon: "lnr-cog", label: "Profile / Settings" },
  ]

  return (
    <div className="dashboard_menu_area">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <ul className="dashboard_menu">
              {menuItems.map((item) => (
                <li key={item.href} className={pathname === item.href ? "active" : ""}>
                  <Link href={item.href}>
                    <span className={`lnr ${item.icon}`}></span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

