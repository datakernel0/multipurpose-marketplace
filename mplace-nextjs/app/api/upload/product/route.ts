import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
import AdmZip from "adm-zip"

const safeAutodrain = (entry: any) => {
  if (entry && typeof entry.autodrain === "function") {
    entry.autodrain()
  }
}

// Disable body parsing for file uploads
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Handle product file uploads (thumbnail, main file, screenshots)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string // "thumbnail", "main", "screenshot"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type based on upload type
    if (type === "thumbnail") {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json({ error: "Thumbnail must be an image" }, { status: 400 })
      }
      // Validate file size (max 2MB for thumbnail)
      if (file.size > 2 * 1024 * 1024) {
        return NextResponse.json({ error: "Thumbnail size must be less than 2MB" }, { status: 400 })
      }
    } else if (type === "main") {
      // Accept ZIP files for main file
      if (!file.type.includes("zip") && !file.name.endsWith(".zip")) {
        return NextResponse.json({ error: "Main file must be a ZIP file" }, { status: 400 })
      }
      // Validate file size (max 100MB for main file)
      if (file.size > 100 * 1024 * 1024) {
        return NextResponse.json({ error: "Main file size must be less than 100MB" }, { status: 400 })
      }
    } else if (type === "screenshot") {
      // Accept ZIP files for screenshots
      if (!file.type.includes("zip") && !file.name.endsWith(".zip")) {
        return NextResponse.json({ error: "Screenshots must be a ZIP file" }, { status: 400 })
      }
      // Validate file size (max 50MB for screenshots)
      if (file.size > 50 * 1024 * 1024) {
        return NextResponse.json({ error: "Screenshots size must be less than 50MB" }, { status: 400 })
      }
      // We'll extract images from the ZIP, so this is handled separately below
    }

    // Read file as buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const extension = originalName.split(".").pop() || "zip"

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads", "products")
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Handle screenshot ZIP extraction
    if (type === "screenshot") {
      try {
        // Create screenshots directory
        const screenshotsDir = join(uploadsDir, "screenshots", `${session.user.id}_${timestamp}`)
        if (!existsSync(screenshotsDir)) {
          await mkdir(screenshotsDir, { recursive: true })
        }

        // Extract ZIP file
        const zip = new AdmZip(buffer)
        const zipEntries = zip.getEntries()

        // Filter for image files only - skip hidden/system files and directories
        const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"]
        const imageEntries = zipEntries.filter((entry: any) => {
          // Skip directories
          if (entry.isDirectory) return false
          
          // Skip hidden/system files (macOS, Windows, Linux)
          const entryName = entry.entryName
          const lowerName = entryName.toLowerCase()
          const fileName = entryName.split("/").pop() || entryName
          
          // Skip hidden files (starting with .)
          if (fileName.startsWith(".")) return false
          
          // Skip macOS system files (__MACOSX folder and .DS_Store)
          if (lowerName.includes("__macosx") || lowerName.includes(".ds_store")) return false
          
          // Skip Windows system files
          if (lowerName.includes("thumbs.db") || lowerName.includes("desktop.ini")) return false
          
          // Skip empty or very small files (less than 100 bytes - likely corrupted or empty)
          if (!entry.header || entry.header.size < 100) {
            safeAutodrain(entry)
            return false
          }
          
          // Check if it's a valid image file by extension
          const hasValidExtension = imageExtensions.some((ext) => lowerName.endsWith(ext))
          if (!hasValidExtension) {
            safeAutodrain(entry)
            return false
          }
          
          return true
        })

        if (imageEntries.length === 0) {
          return NextResponse.json(
            { error: "No valid image files found in ZIP file. Please ensure the ZIP contains image files (jpg, png, gif, webp, bmp) and no system files." },
            { status: 400 }
          )
        }

        // Extract and save images
        const imageUrls: string[] = []
        for (let i = 0; i < imageEntries.length && i < 20; i++) {
          // Limit to 20 images max
          const entry = imageEntries[i]
          
          try {
            const entryBuffer = entry.getData()
            
            // Validate buffer is not empty
            if (!entryBuffer || entryBuffer.length < 20) {
              safeAutodrain(entry)
              continue
            }
            
            // Validate it's actually an image by checking file signature (magic bytes)
            const isValidImage = 
              (entryBuffer[0] === 0xFF && entryBuffer[1] === 0xD8 && entryBuffer[2] === 0xFF) || // JPEG
              (entryBuffer[0] === 0x89 && entryBuffer[1] === 0x50 && entryBuffer[2] === 0x4E && entryBuffer[3] === 0x47) || // PNG
              (entryBuffer[0] === 0x47 && entryBuffer[1] === 0x49 && entryBuffer[2] === 0x46 && entryBuffer[3] === 0x38) || // GIF89a
              (entryBuffer[0] === 0x47 && entryBuffer[1] === 0x49 && entryBuffer[2] === 0x46 && entryBuffer[3] === 0x39) || // GIF87a
              (entryBuffer[0] === 0x42 && entryBuffer[1] === 0x4D) || // BMP
              (entryBuffer[0] === 0x52 && entryBuffer[1] === 0x49 && entryBuffer[2] === 0x46 && entryBuffer[3] === 0x46) // WEBP (RIFF)
              
            if (!isValidImage) {
              safeAutodrain(entry)
              continue
            }
            
            const entryName = entry.entryName.split("/").pop() || `image_${i}`
            const safeName = entryName.replace(/[^a-zA-Z0-9.-]/g, "_")
            const imageFilename = `screenshot_${session.user.id}_${timestamp}_${i}_${safeName}`
            const imagePath = join(screenshotsDir, imageFilename)

            await writeFile(imagePath, entryBuffer)
            const imageUrl = `/uploads/products/screenshots/${session.user.id}_${timestamp}/${imageFilename}`
            imageUrls.push(imageUrl)
          } catch (error: any) {
            safeAutodrain(entry)
            // Continue with next file instead of failing completely
            continue
          }
        }
        
        if (imageUrls.length === 0) {
          return NextResponse.json(
            { error: "No valid images could be extracted from ZIP file" },
            { status: 400 }
          )
        }

        return NextResponse.json(
          {
            success: true,
            urls: imageUrls, // Return array of image URLs
            url: imageUrls[0], // Also return first URL for backward compatibility
            filename: `screenshots_${session.user.id}_${timestamp}`,
            count: imageUrls.length,
          },
          { status: 200 }
        )
      } catch (error: any) {
        return NextResponse.json(
          { error: "Failed to extract screenshots from ZIP file: " + error.message },
          { status: 500 }
        )
      }
    }

    // Handle other file types (thumbnail, main)
    const filename = `${type}_${session.user.id}_${timestamp}_${randomString}.${extension}`
    const filepath = join(uploadsDir, filename)
    await writeFile(filepath, buffer)

    // Return public URL
    const imageUrl = `/uploads/products/${filename}`

    return NextResponse.json(
      {
        success: true,
        url: imageUrl,
        filename: filename,
      },
      { status: 200 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    )
  }
}
