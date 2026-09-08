"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { label: "Overview", href: "/admin" },
  { label: "Products", href: "/admin/products" },
  { label: "Sellers", href: "/admin/sellers" },
  { label: "Customers", href: "/admin/customers" },
  { label: "Moderation Queue", href: "/admin/moderation" },
  { label: "Audit Logs", href: "/admin/logs" },
  { label: "Support", href: "/admin/support" },
  { label: "Settings", href: "/admin/settings" },
]

function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__header">
        <h1>Admin</h1>
        <p>Control Centre</p>
      </div>
      <nav className="admin-sidebar__nav">
        <ul>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
            return (
              <li key={item.href} className={isActive ? "active" : ""}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}

export default AdminSidebar
