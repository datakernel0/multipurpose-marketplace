import type { Session } from "next-auth"
import type { AdminRoleSummary } from "@/types/admin"

export interface AdminCheckOptions {
  roles?: string[]
  permissions?: string[]
  allowSuperAdmin?: boolean
}

export type AdminSessionUser = Session["user"] & {
  adminRoles?: AdminRoleSummary[]
  adminPermissions?: string[]
  isSuperAdmin?: boolean
}

export class AdminAuthorizationError extends Error {
  constructor(message = "Forbidden") {
    super(message)
    this.name = "AdminAuthorizationError"
  }
}

const normalize = (values?: string[]) =>
  values?.map((value) => value.toLowerCase()) ?? []

export function hasAdminAccess(
  user: AdminSessionUser | undefined,
  options: AdminCheckOptions = {}
): boolean {
  if (!user) {
    return false
  }

  const allowSuperAdmin = options.allowSuperAdmin !== false

  if (allowSuperAdmin && (user.isSuperAdmin || user.role === "SUPERADMIN")) {
    return true
  }

  const baseRole = (user.role || "").toLowerCase()
  const assignedRoles = normalize(user.adminRoles?.map((role) => role.name))
  const userPermissions = new Set(user.adminPermissions ?? [])

  if (options.roles && options.roles.length > 0) {
    const requiredRoles = normalize(options.roles)

    const matchesBaseRole = requiredRoles.includes(baseRole)
    const matchesAssignedRole = requiredRoles.some((role) => assignedRoles.includes(role))

    if (!matchesBaseRole && !matchesAssignedRole) {
      return false
    }
  }

  if (options.permissions && options.permissions.length > 0) {
    const missingPermission = options.permissions.find(
      (permission) => !userPermissions.has(permission)
    )

    if (missingPermission) {
      return false
    }
  }

  if (!options.roles && !options.permissions) {
    if (baseRole === "admin") {
      return true
    }

    if (assignedRoles.length > 0) {
      return true
    }
  }

  return (options.roles?.length ?? 0) > 0 || (options.permissions?.length ?? 0) > 0
}

export function ensureAdmin(
  session: Session | null,
  options?: AdminCheckOptions
): AdminSessionUser {
  if (!session?.user) {
    throw new AdminAuthorizationError("Authentication required")
  }

  const user = session.user as AdminSessionUser

  if (!hasAdminAccess(user, options)) {
    throw new AdminAuthorizationError("You do not have permission to perform this action")
  }

  return user
}
