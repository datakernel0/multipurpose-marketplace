import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { SystemSettingGroup } from "@prisma/client"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ensureAdmin } from "@/lib/adminAuth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  ensureAdmin(session, { roles: ["SUPERADMIN", "ADMIN"], allowSuperAdmin: true })

  const { searchParams } = new URL(request.url)
  const groupFilter = searchParams.get("group")?.toUpperCase()
  const groups = groupFilter ? ([groupFilter] as SystemSettingGroup[]) : undefined

  const settings = await prisma.systemSetting.findMany({
    where: groups ? { group: { in: groups } } : undefined,
    orderBy: [{ group: "asc" }, { label: "asc" }, { key: "asc" }],
    select: {
      id: true,
      key: true,
      value: true,
      type: true,
      label: true,
      description: true,
      group: true,
      updatedAt: true,
      updatedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })

  const grouped = settings.reduce<Record<string, unknown[]>>((acc, setting) => {
    const group = setting.group
    if (!acc[group]) acc[group] = []
    acc[group].push({
      key: setting.key,
      label: setting.label,
      description: setting.description,
      value: setting.value,
      type: setting.type,
      group: setting.group,
      updatedAt: setting.updatedAt.toISOString(),
      updatedBy: setting.updatedBy
        ? {
            id: setting.updatedBy.id,
            name: setting.updatedBy.name,
            email: setting.updatedBy.email,
          }
        : null,
    })
    return acc
  }, {})

  return NextResponse.json({
    settings: grouped,
    total: settings.length,
    generatedAt: new Date().toISOString(),
  })
}
