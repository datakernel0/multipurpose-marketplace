import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import { join, extname } from "path"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "File is empty" }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size must be less than 10MB" }, { status: 400 })
    }

    const extension = extname(file.name) || ""
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).slice(2, 10)
    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
    const fileName = `${session.user.id}_${timestamp}_${randomString}${extension || ""}`

    const uploadsDir = join(process.cwd(), "public", "uploads", "messages")
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const filePath = join(uploadsDir, fileName)
    await writeFile(filePath, fileBuffer)

    const publicUrl = `/uploads/messages/${fileName}`

    return NextResponse.json(
      {
        success: true,
        attachment: {
          url: publicUrl,
          fileName: safeFileName,
          storedFileName: fileName,
          mimeType: file.type || "application/octet-stream",
          fileSize: file.size,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json({ error: "Failed to upload attachment" }, { status: 500 })
  }
}

