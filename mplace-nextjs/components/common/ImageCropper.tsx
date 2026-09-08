"use client"

import { useState, useRef, useCallback } from "react"
import ReactCrop, { Crop, PixelCrop, makeAspectCrop, centerCrop } from "react-image-crop"
import { getApiUrl } from "@/utils/paths"

interface ImageCropperProps {
  image: string | null
  onSave: (imageUrl: string) => void
  onCancel: () => void
  aspectRatio?: number
  type: "profile" | "cover"
}

export default function ImageCropper({ image, onSave, onCancel, aspectRatio, type }: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string>("")
  const imgRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget

    // Set default crop based on type
    if (type === "profile") {
      // Square crop for profile (100x100)
      const cropSize = Math.min(naturalWidth, naturalHeight)
      const crop = makeAspectCrop(
        {
          unit: "px",
          width: cropSize,
          height: cropSize,
        },
        1, // Aspect ratio 1:1
        naturalWidth,
        naturalHeight
      )
      setCrop(centerCrop(crop, naturalWidth, naturalHeight))
    } else if (type === "cover") {
      // Cover image crop (750x370 aspect ratio ≈ 2.03:1)
      const crop = makeAspectCrop(
        {
          unit: "%",
          width: 100,
        },
        aspectRatio || 750 / 370,
        naturalWidth,
        naturalHeight
      )
      setCrop(centerCrop(crop, naturalWidth, naturalHeight))
    }
  }, [type, aspectRatio])

  const getCroppedImg = useCallback(
    async (image: HTMLImageElement, crop: PixelCrop): Promise<Blob | null> => {
      const canvas = canvasRef.current
      if (!canvas || !crop) return null

      const scaleX = image.naturalWidth / image.width
      const scaleY = image.naturalHeight / image.height
      const ctx = canvas.getContext("2d")

      if (!ctx) return null

      const pixelRatio = window.devicePixelRatio
      canvas.width = crop.width * scaleX * pixelRatio
      canvas.height = crop.height * scaleY * pixelRatio

      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      ctx.imageSmoothingQuality = "high"

      const cropX = crop.x * scaleX
      const cropY = crop.y * scaleY

      ctx.drawImage(
        image,
        cropX,
        cropY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width * scaleX,
        crop.height * scaleY
      )

      return new Promise((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", 0.9)
      })
    },
    []
  )

  const handleSave = async () => {
    if (!completedCrop || !imgRef.current) return

    setUploading(true)
    setError("")
    try {
      const croppedImageBlob = await getCroppedImg(imgRef.current, completedCrop)
      if (!croppedImageBlob) {
        setUploading(false)
        return
      }

      // Create FormData and upload
      const formData = new FormData()
      formData.append("file", croppedImageBlob, `cropped-${type}.jpg`)
      formData.append("type", type)

      const response = await fetch(getApiUrl("/api/upload/image"), {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload image")
      }

      onSave(data.url)
    } catch (error: any) {
      setError(error?.message || "Failed to upload image")
    } finally {
      setUploading(false)
    }
  }

  if (!image) return null

  return (
    <div 
      className="image-cropper-modal" 
      style={{ 
        position: "fixed", 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        backgroundColor: "rgba(0,0,0,0.8)", 
        zIndex: 9999, 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        flexDirection: "column", 
        padding: "20px" 
      }}
      onClick={(e) => {
        // Close modal when clicking outside
        if (e.target === e.currentTarget) {
          onCancel()
        }
      }}
    >
      <div 
        style={{ 
          backgroundColor: "#fff", 
          padding: "20px", 
          borderRadius: "8px", 
          maxWidth: "90%", 
          maxHeight: "90%", 
          overflow: "auto",
          position: "relative"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginBottom: "20px", fontSize: "18px", fontWeight: 600 }}>
          Crop {type === "profile" ? "Profile" : "Cover"} Image
        </h3>
        
        <div style={{ marginBottom: "20px", display: "flex", justifyContent: "center" }}>
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspectRatio}
            minWidth={type === "profile" ? 100 : 750}
            minHeight={type === "profile" ? 100 : 370}
          >
            <img
              ref={imgRef}
              alt="Crop me"
              src={image}
              style={{ maxWidth: "100%", maxHeight: "70vh", display: "block" }}
              onLoad={onImageLoad}
            />
          </ReactCrop>
        </div>

        <canvas ref={canvasRef} style={{ display: "none" }} />

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px" }}>
          <button
            type="button"
            className="btn btn--sm btn--round"
            onClick={onCancel}
            disabled={uploading}
            style={{ backgroundColor: "#6c757d", color: "#fff" }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn--sm btn--round"
            onClick={handleSave}
            disabled={uploading || !completedCrop}
          >
            {uploading ? "Uploading..." : "Save & Upload"}
          </button>
        </div>
      </div>
    </div>
  )
}
