"use client"

import { Avatar, Popover } from "antd"
import FeatherIcon from "feather-icons-react"
import { signOut } from "next-auth/react"
import { useState } from "react"
import Link from "next/link"
import { withBasePath } from "@/utils/paths"
import { MessageIcon, NotificationIcon, SettingsIcon, SupportIcon } from "./AdminHeaderIcons"
import { AdminHeaderContentStyled } from "./AdminHeaderContentStyled"

interface AdminHeaderContentProps {
  user: {
    name?: string | null
    email: string
    image?: string | null
    role: string
  }
}

export default function AdminHeaderContent({ user }: AdminHeaderContentProps) {
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    try {
      setSigningOut(true)
      await signOut({ callbackUrl: withBasePath("/login") })
    } catch (error) {
      setSigningOut(false)
    }
  }

  const userContent = (
    <AdminHeaderContentStyled>
      <div className="user-dropdwon">
        <figure className="user-dropdwon__info">
          <Avatar
            src={user.image || undefined}
            style={{ backgroundColor: "#5F63F2", width: "48px", height: "48px" }}
            size={48}
          >
            {(user.name || user.email || "A").charAt(0).toUpperCase()}
          </Avatar>
          <figcaption>
            <h5>{user.name || user.email}</h5>
            <p>{user.role}</p>
          </figcaption>
        </figure>
        <ul className="user-dropdwon__links">
          <li>
            <Link href={withBasePath("/dashboard")}>
              <FeatherIcon icon="user" size={16} />
              Profile
            </Link>
          </li>
          <li>
            <Link href={withBasePath("/admin/settings")}>
              <FeatherIcon icon="settings" size={16} />
              Settings
            </Link>
          </li>
          <li>
            <Link href={withBasePath("/dashboard/statement")}>
              <FeatherIcon icon="dollar-sign" size={16} />
              Billing
            </Link>
          </li>
          <li>
            <Link href={withBasePath("/dashboard")}>
              <FeatherIcon icon="users" size={16} />
              Activity
            </Link>
          </li>
          <li>
            <Link href={withBasePath("/admin/support")}>
              <FeatherIcon icon="bell" size={16} />
              Help
            </Link>
          </li>
        </ul>
        <button type="button" className="user-dropdwon__bottomAction" onClick={handleSignOut} disabled={signingOut}>
          <FeatherIcon icon="log-out" size={15} />
          {signingOut ? "Signing out..." : "Sign Out"}
        </button>
      </div>
    </AdminHeaderContentStyled>
  )

  return (
    <AdminHeaderContentStyled>
      <div className="info-wrapper">
        <MessageIcon />
        <NotificationIcon />
        <SettingsIcon />
        <SupportIcon />
        <div className="nav-author">
          <Popover content={userContent} placement="bottomRight" trigger="click">
            <span className="head-example">
              <Avatar
                src={user.image || undefined}
                style={{ backgroundColor: "#5F63F2", width: "32px", height: "32px" }}
                size={32}
              >
                {(user.name || user.email || "A").charAt(0).toUpperCase()}
              </Avatar>
            </span>
          </Popover>
        </div>
      </div>
    </AdminHeaderContentStyled>
  )
}

