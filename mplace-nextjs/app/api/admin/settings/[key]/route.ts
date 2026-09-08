import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ensureAdmin } from "@/lib/adminAuth"
import { prisma } from "@/lib/prisma"

function coerceValue(value: unknown, type: string) {
  switch (type) {
    case "BOOLEAN":
      if (typeof value === "boolean") return value
      if (typeof value === "string") return value.toLowerCase() === "true"
      if (typeof value === "number") return value === 1
      throw new Error("Invalid boolean value")
    case "NUMBER":
      if (typeof value === "number") return value
      if (typeof value === "string" && value.trim() !== "") {
        const parsed = Number(value)
        if (!Number.isNaN(parsed)) return parsed
      }
      throw new Error("Invalid number value")
    case "JSON":
      if (typeof value === "object") return value
      if (typeof value === "string") {
        try {
          return JSON.parse(value)
        } catch (error) {
          throw new Error("Invalid JSON value")
        }
      }
      throw new Error("Invalid JSON value")
    case "TEXT":
    case "STRING":
    default:
      if (typeof value === "string") return value
      if (value == null) return ""
      return String(value)
  }
}

function serializeValue(value: unknown, type: string) {
  switch (type) {
    case "BOOLEAN":
      return value ? "true" : "false"
    case "NUMBER":
      return String(value)
    case "JSON":
      return JSON.stringify(value)
    case "TEXT":
    case "STRING":
    default:
      return String(value ?? "")
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const session = await getServerSession(authOptions)
  ensureAdmin(session, { roles: ["SUPERADMIN", "ADMIN"], allowSuperAdmin: true })

  const { key } = await params
  const setting = await prisma.systemSetting.findUnique({ where: { key } })

  if (!setting) {
    return NextResponse.json({ error: "Setting not found" }, { status: 404 })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object" || !("value" in body)) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  let parsed: unknown
  try {
    parsed = coerceValue((body as any).value, setting.type)
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Invalid value" }, { status: 400 })
  }

  const value = serializeValue(parsed, setting.type)

  const updated = await prisma.systemSetting.update({
    where: { key },
    data: {
      value,
      updatedById: session?.user?.id ?? null,
    },
    select: {
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

  return NextResponse.json({
    setting: {
      key: updated.key,
      label: updated.label,
      description: updated.description,
      value: updated.value,
      type: updated.type,
      group: updated.group,
      updatedAt: updated.updatedAt.toISOString(),
      updatedBy: updated.updatedBy
        ? {
            id: updated.updatedBy.id,
            name: updated.updatedBy.name,
            email: updated.updatedBy.email,
          }
        : null,
    },
  })
}
