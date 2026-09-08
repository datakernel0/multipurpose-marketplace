"use client"

import { Menu } from "antd"
import type { MenuProps } from "antd"
import FeatherIcon from "feather-icons-react"
import { usePathname, useRouter } from "next/navigation"
import { withBasePath } from "@/utils/paths"


export default function AdminMenu() {
  const pathname = usePathname()
  const router = useRouter()
  const basePath = withBasePath("/admin")

  // Determine selected key based on pathname
  const getSelectedKey = () => {
    if (!pathname) return ["overview"]
    const path = pathname.replace(basePath, "") || "/"
    if (path === "/" || path === "") return ["overview"]
    const segments = path.split("/").filter(Boolean)
    return segments.length > 0 ? [segments[0]] : ["overview"]
  }

  const selectedKeys = getSelectedKey()

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    const key = e.key as string
    if (key === "overview") {
      router.push(basePath)
    } else {
      router.push(`${basePath}/${key}`)
    }
  }

  const menuItems: MenuProps["items"] = [
    {
      key: "overview",
      icon: <FeatherIcon icon="home" size={16} />,
      label: "Overview",
    },
    {
      key: "products",
      icon: <FeatherIcon icon="package" size={16} />,
      label: "Products",
    },
    {
      key: "sellers",
      icon: <FeatherIcon icon="users" size={16} />,
      label: "Sellers",
    },
    {
      key: "customers",
      icon: <FeatherIcon icon="user-check" size={16} />,
      label: "Customers",
    },
    {
      key: "moderation",
      icon: <FeatherIcon icon="shield" size={16} />,
      label: "Moderation Queue",
    },
    {
      key: "logs",
      icon: <FeatherIcon icon="file-text" size={16} />,
      label: "Audit Logs",
    },
    {
      key: "support",
      icon: <FeatherIcon icon="headphones" size={16} />,
      label: "Support",
    },
    {
      key: "settings",
      icon: <FeatherIcon icon="settings" size={16} />,
      label: "Settings",
    },
  ]

  return (
    <Menu
      mode="inline"
      theme="light"
      selectedKeys={selectedKeys}
      items={menuItems}
      onClick={handleMenuClick}
      style={{ border: "none" }}
    />
  )
}

