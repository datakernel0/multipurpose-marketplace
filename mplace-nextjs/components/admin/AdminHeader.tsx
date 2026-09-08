"use client"

import Link from "next/link"
import { useState } from "react"
import { signOut } from "next-auth/react"
import { withBasePath } from "@/utils/paths"

import type { AdminSessionUser } from "@/lib/adminAuth"

interface AdminHeaderProps {
  user: AdminSessionUser
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  const roles = user.adminRoles ?? []
  const [signingOut, setSigningOut] = useState(false)

  const primaryRole = user.isSuperAdmin ? "Super Admin" : roles[0]?.name || user.role

  const handleSignOut = async () => {
    try {
      setSigningOut(true)
      await signOut({ callbackUrl: withBasePath("/login") })
    } catch (error) {
      setSigningOut(false)
    }
  }

  return (
    <header className="admin-header">
      <div className="admin-header__left">
        <div>
          <h2>Administration</h2>
          <p>Monitor activity, approvals, and platform health.</p>
        </div>
        <div className="admin-header__actions">
          <Link href="/" className="admin-header__link">
            View Marketplace
          </Link>
          <Link href="/dashboard" className="admin-header__link">
            Go to Seller Dashboard
          </Link>
        </div>
      </div>

      <div className="admin-header__user">
        <div className="admin-header__user-info">
          <span className="admin-header__user-name">{user.name || user.email}</span>
          <div className="admin-header__user-meta">
            <span className="admin-header__pill">{primaryRole}</span>
            {roles.length > 1 && (
              <span className="admin-header__roles">
                {roles.slice(0, 3).map((role) => (
                  <span key={role.id} className="admin-header__tag">
                    {role.name}
                  </span>
                ))}
                {roles.length > 3 && <span className="admin-header__tag">+{roles.length - 3}</span>}
              </span>
            )}
          </div>
        </div>
        {user.image ? (
          <img src={user.image} alt={user.name || "Admin"} className="admin-header__avatar-img" />
        ) : (
          <div className="admin-header__avatar">{(user.name || user.email || "A").slice(0, 1).toUpperCase()}</div>
        )}
        <button className="admin-header__signout" onClick={handleSignOut} disabled={signingOut}>
          {signingOut ? "Signing out..." : "Sign Out"}
        </button>
      </div>
    </header>
  )
}
