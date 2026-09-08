export interface AdminRoleSummary {
  id: string
  name: string
  level: number
  isSystem: boolean
  assignedAt?: string
  expiresAt?: string | null
}

export interface AdminPermissionSummary {
  key: string
  description?: string | null
  category?: string | null
}
