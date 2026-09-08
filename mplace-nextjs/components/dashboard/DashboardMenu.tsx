"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

interface DashboardMenuItem {
  href: string
  icon: string
  label: string
}

export default function DashboardMenu() {
  const pathname = usePathname()

  const menuItems: DashboardMenuItem[] = [
    { href: "/dashboard", icon: "lnr-home", label: "Dashboard" },
    { href: "/dashboard/settings", icon: "lnr-cog", label: "Setting" },
    { href: "/dashboard/purchase", icon: "lnr-cart", label: "Purchase" },
    { href: "/dashboard/add-credit", icon: "lnr-dice", label: "Add Credits" },
    { href: "/dashboard/statement", icon: "lnr-chart-bars", label: "Statements" },
    { href: "/dashboard/upload", icon: "lnr-upload", label: "Upload Items" },
    { href: "/dashboard/manage-item", icon: "lnr-briefcase", label: "Manage Items" },
    { href: "/dashboard/withdrawal", icon: "lnr-briefcase", label: "Withdrawals" },
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

