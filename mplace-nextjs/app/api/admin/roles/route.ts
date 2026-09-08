import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ensureAdmin } from "@/lib/adminAuth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  ensureAdmin(session, { roles: ["SUPERADMIN", "ADMIN"], allowSuperAdmin: true })

  const roles = await prisma.adminRole.findMany({
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
      assignments: true,
    },
    orderBy: {
      level: "desc",
    },
  })

  const data = roles.map((role) => ({
    id: role.id,
    name: role.name,
    description: role.description,
    level: role.level,
    isSystem: role.isSystem,
    memberCount: role.assignments.length,
    permissions: role.permissions
      .map((rp) => rp.permission)
      .filter((permission): permission is NonNullable<typeof permission> => Boolean(permission))
      .map((permission) => ({
        key: permission.key,
        description: permission.description,
        category: permission.category,
      })),
  }))

  return NextResponse.json({ roles: data })
}
