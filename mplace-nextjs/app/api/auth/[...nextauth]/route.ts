import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import { prisma } from "@/lib/prisma"
import type { AdminRoleSummary } from "@/types/admin"
import type { AdminSessionUser } from "@/lib/adminAuth"
import bcrypt from "bcryptjs"

type AssignmentWithRole = {
  role: {
    id: string
    name: string
    level: number
    isSystem: boolean
    permissions: Array<{
      permission: {
        key: string | null
      } | null
    }>
  }
  assignedAt: Date
  expiresAt: Date | null
}

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""
// Ensure NEXTAUTH_URL includes basePath if it's set
const getNextAuthUrl = () => {
  let url = process.env.NEXTAUTH_URL
  if (!url) {
    // Fallback to constructing from environment or default
    if (typeof window !== "undefined") {
      url = window.location.origin
    } else {
      url = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    }
  }
  
  // Remove trailing slash from URL
  url = url.replace(/\/$/, "")
  
  // Add basePath if it's set and not already in the URL
  if (basePath && basePath.trim() !== "") {
    const cleanBasePath = basePath.replace(/\/$/, "")
    if (!url.includes(cleanBasePath)) {
      url = `${url}${cleanBasePath}`
    }
  }
  
  return url
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user || !user.password) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role
          }
        } catch (error) {
          return null
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
    }),
  ],
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: (process.env.NEXT_PUBLIC_BASE_PATH || '') + '/auth/login',
    error: (process.env.NEXT_PUBLIC_BASE_PATH || '') + '/auth/login', // Redirect errors to login page
  },
  // Prevent automatic error redirects
  debug: process.env.NODE_ENV === "development",
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle OAuth sign in
      if (account?.provider === "google" || account?.provider === "facebook") {
        if (!user.email) return false

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        })

        // Create user if doesn't exist
        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || "",
              image: user.image || null,
              emailVerified: new Date(),
              accounts: {
                create: {
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                },
              },
            },
          })
        } else {
          // Update existing user's account if needed
          const existingAccount = await prisma.account.findFirst({
            where: {
              userId: existingUser.id,
              provider: account.provider,
            },
          })

          if (!existingAccount) {
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
              },
            })
          }
        }
      }
      return true
    },
    async jwt({ token, user }) {
      const adminRefreshIntervalMs = 5 * 60 * 1000

      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email || "" },
        })

        if (dbUser) {
          token.id = dbUser.id
          token.role = dbUser.role
          token.email = dbUser.email
          token.name = dbUser.name
          token.image = dbUser.image
          token.isSuperAdmin = dbUser.role === "SUPERADMIN"
        } else {
          token.id = user.id
          // OAuth users default to USER role unless they have a database record
          token.role = "USER"
          token.email = user.email
          token.name = user.name
          token.image = user.image
          token.isSuperAdmin = false
        }
      }

      const userId = (token.id as string) || undefined
      const shouldRefreshAdmin =
        !!user ||
        !token.adminRolesUpdatedAt ||
        Date.now() - (token.adminRolesUpdatedAt as number) > adminRefreshIntervalMs

      if (userId && shouldRefreshAdmin) {
        try {
          const now = new Date()
          const assignments = (await prisma.adminRoleAssignment.findMany({
            where: {
              userId,
              OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
            },
            include: {
              role: {
                include: {
                  permissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          })) as AssignmentWithRole[]

          const adminRoles: AdminRoleSummary[] = assignments.map((assignment) => ({
            id: assignment.role.id,
            name: assignment.role.name,
            level: assignment.role.level,
            isSystem: assignment.role.isSystem,
            assignedAt: assignment.assignedAt.toISOString(),
            expiresAt: assignment.expiresAt ? assignment.expiresAt.toISOString() : null,
          }))

          const permissionSet = new Set<string>()
          assignments.forEach((assignment) => {
            assignment.role.permissions.forEach((rolePermission) => {
              const key = rolePermission?.permission?.key
              if (key) {
                permissionSet.add(key)
              }
            })
          })

          token.adminRoles = adminRoles
          token.adminPermissions = Array.from(permissionSet)
          token.adminRolesUpdatedAt = Date.now()
          token.isSuperAdmin = token.isSuperAdmin || token.role === "SUPERADMIN"
        } catch (error) {
          return { roles: [], permissions: [] }
        }
      } else {
        token.adminRoles = token.adminRoles || []
        token.adminPermissions = token.adminPermissions || []
        token.isSuperAdmin = token.isSuperAdmin || token.role === "SUPERADMIN"
      }

      return token
    },
    async session({ session, token }) {
      if (token && session) {
        const adminSessionUser: AdminSessionUser = {
          id: (token.id as string) || "",
          email: (token.email as string) || "",
          name: (token.name as string) || null,
          image: (token.image as string) || null,
          role: (token.role as string) || "USER",
          adminRoles: (token.adminRoles as AdminRoleSummary[]) || [],
          adminPermissions: (token.adminPermissions as string[]) || [],
          isSuperAdmin: Boolean(token.isSuperAdmin),
        }
        session.user = adminSessionUser
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Get base URL and remove basePath if it's already included
      let baseUrlRaw = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL?.replace(/\/api\/auth$/, "") || "http://localhost:3000"
      baseUrlRaw = baseUrlRaw.replace(/\/$/, "")
      
      const cleanBasePath = basePath.replace(/\/$/, "")
      
      // Remove basePath from baseUrlRaw if it's already there
      let baseWithoutPath = baseUrlRaw
      if (cleanBasePath && baseUrlRaw.includes(cleanBasePath)) {
        // Extract origin and remove basePath from the URL
        try {
          const urlObj = new URL(baseUrlRaw)
          baseWithoutPath = `${urlObj.protocol}//${urlObj.host}`
        } catch {
          // If URL parsing fails, try string replacement
          baseWithoutPath = baseUrlRaw.replace(cleanBasePath, "").replace(/\/$/, "")
        }
      }

      // If URL is relative, construct the full URL
      if (url.startsWith("/")) {
        const cleanUrl = url.startsWith("/") ? url : `/${url}`
        
        // Check if URL already includes basePath
        if (cleanBasePath && cleanUrl.startsWith(cleanBasePath)) {
          // URL already has basePath, just prepend the base URL without basePath
          return `${baseWithoutPath}${cleanUrl}`
        }
        
        // URL doesn't have basePath, add basePath and prepend base URL
        if (cleanBasePath) {
          return `${baseWithoutPath}${cleanBasePath}${cleanUrl}`
        }
        
        // No basePath configured
        return `${baseWithoutPath}${cleanUrl}`
      }

      // If URL is absolute, check if it's on the same origin
      try {
        const target = new URL(url)
        const baseUrlObj = new URL(baseWithoutPath)
        if (target.origin === baseUrlObj.origin) {
          // Same origin, check if pathname already has basePath
          const pathname = target.pathname
          
          // If pathname already starts with basePath, use it as-is
          if (cleanBasePath && pathname.startsWith(cleanBasePath)) {
            return url
          }
          
          // If pathname doesn't have basePath, add it
          if (cleanBasePath) {
            return `${baseWithoutPath}${cleanBasePath}${pathname}`
          }
          
          return url
        }
      } catch (error) {
        // Invalid URL, return base with basePath
        return cleanBasePath ? `${baseWithoutPath}${cleanBasePath}` : baseWithoutPath
      }

      // Fallback: return base with basePath
      return cleanBasePath ? `${baseWithoutPath}${cleanBasePath}` : baseWithoutPath
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  // Fix for development - use the correct URL
  ...(process.env.NODE_ENV === "development" && {
    trustHost: true,
  }),
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

