import type { AdminRoleSummary } from "@/types/admin"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: string
      username?: string | null
      adminRoles?: AdminRoleSummary[]
      adminPermissions?: string[]
      isSuperAdmin?: boolean
    }
  }

  interface User {
    id: string
    role: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    role?: string
    adminRoles?: AdminRoleSummary[]
    adminPermissions?: string[]
    isSuperAdmin?: boolean
    adminRolesUpdatedAt?: number
  }
}
