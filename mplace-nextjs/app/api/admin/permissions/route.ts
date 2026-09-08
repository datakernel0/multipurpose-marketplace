import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ensureAdmin } from "@/lib/adminAuth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  ensureAdmin(session, { roles: ["SUPERADMIN", "ADMIN"], allowSuperAdmin: true })

  const permissions = await prisma.adminPermission.findMany({
    orderBy: [{ category: "asc" }, { key: "asc" }],
  })

  const grouped = permissions.reduce<Record<string, { key: string; description: string | null }[]>>(
    (accumulator, permission) => {
      const category = permission.category || "general"
      if (!accumulator[category]) {
        accumulator[category] = []
      }
      accumulator[category].push({
        key: permission.key,
        description: permission.description,
      })
      return accumulator
    },
    {}
  )

  return NextResponse.json({ permissions: grouped })
}
