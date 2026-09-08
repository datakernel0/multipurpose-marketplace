import { ReactNode } from "react"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ensureAdmin, type AdminSessionUser } from "@/lib/adminAuth"
import { withBasePath } from "@/utils/paths"
import AdminLayoutWrapper from "@/components/admin/AdminLayoutWrapper"

interface AdminLayoutProps {
  children: ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await getServerSession(authOptions)

  let user: AdminSessionUser
  try {
    user = ensureAdmin(session)
  } catch (error) {
    const loginUrl = withBasePath(`/login?callbackUrl=${encodeURIComponent("/admin")}`)
    redirect(loginUrl)
  }

  return (
    <AdminLayoutWrapper
      user={{
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.isSuperAdmin ? "Super Admin" : user.adminRoles?.[0]?.name || user.role,
      }}
    >
      {children}
    </AdminLayoutWrapper>
  )
}
