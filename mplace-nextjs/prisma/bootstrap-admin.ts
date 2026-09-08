import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()
const adminEmail = "admin@marketnest.local"

async function main() {
  if (process.env.SEED_DEMO_DATA === "true") {
    throw new Error("Refusing admin bootstrap while SEED_DEMO_DATA=true")
  }

  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD
  if (!adminPassword) {
    throw new Error("DEFAULT_ADMIN_PASSWORD must be configured before bootstrapping the admin")
  }

  const password = await bcrypt.hash(adminPassword, 12)

  await prisma.$transaction(async (tx) => {
    const admin = await tx.user.upsert({
      where: { email: adminEmail },
      update: {
        name: "MarketNest Admin",
        password,
        role: "SUPERADMIN",
      },
      create: {
        email: adminEmail,
        name: "MarketNest Admin",
        password,
        role: "SUPERADMIN",
      },
    })

    const superAdminRole = await tx.adminRole.upsert({
      where: { name: "Super Admin" },
      update: {
        description: "Full access to all administrative operations.",
        level: 100,
        isSystem: true,
      },
      create: {
        name: "Super Admin",
        description: "Full access to all administrative operations.",
        level: 100,
        isSystem: true,
      },
    })

    await tx.adminRoleAssignment.upsert({
      where: {
        userId_roleId: {
          userId: admin.id,
          roleId: superAdminRole.id,
        },
      },
      update: {
        assignedById: admin.id,
        expiresAt: null,
      },
      create: {
        userId: admin.id,
        roleId: superAdminRole.id,
        assignedById: admin.id,
      },
    })
  })

  console.log(`Development superadmin ready: ${adminEmail}`)
}

main()
  .catch((error) => {
    console.error("Admin bootstrap failed:", error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })