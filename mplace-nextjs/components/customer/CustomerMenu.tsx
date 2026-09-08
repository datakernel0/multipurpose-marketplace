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
    { href: "/dashboard/customer", icon: "lnr-briefcase", label: "Purchase History" },
    { href: "/customer/downloads", icon: "lnr-download", label: "Downloads" },
    { href: "/dashboard/customer/info", icon: "lnr-cog", label: "Account Info" },
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

