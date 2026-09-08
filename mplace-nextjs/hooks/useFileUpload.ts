"use client"

import { useState, useCallback } from "react"

export interface UploadedFile {
  id: string
  file: File
  name: string
  size: number
  type: string
  previewUrl?: string
}

export interface UseFileUploadOptions {
  maxFiles?: number
  maxFileSize?: number
  allowedTypes?: string[]
  createPreviewUrl?: boolean
}

export interface UseFileUploadResult {
  uploadedFiles: UploadedFile[]
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  removeFile: (id: string) => void
  clearFiles: () => void
  error: string | null
  setError: (value: string | null) => void
  isAtLimit: boolean
}

const DEFAULT_MAX_FILES = 5
const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

export function useFileUpload(options: UseFileUploadOptions = {}): UseFileUploadResult {
  const { maxFiles = DEFAULT_MAX_FILES, maxFileSize = DEFAULT_MAX_FILE_SIZE, allowedTypes, createPreviewUrl = true } = options
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [error, setError] = useState<string | null>(null)

  const generateId = useCallback(
    () =>
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    []
  )

  const revokePreviewUrls = useCallback((files: UploadedFile[]) => {
    files.forEach((file) => {
      if (file.previewUrl) {
        URL.revokeObjectURL(file.previewUrl)
      }
    })
  }, [])

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setError(null)

      const fileList = event.target.files
      if (!fileList || fileList.length === 0) {
        return
      }

      const existingCount = uploadedFiles.length
      const availableSlots = Math.max(maxFiles - existingCount, 0)

      if (availableSlots <= 0) {
        setError(`You can upload up to ${maxFiles} file${maxFiles === 1 ? "" : "s"}.`)
        return
      }

      const selectedFiles = Array.from(fileList).slice(0, availableSlots)
      const nextFiles: UploadedFile[] = []
      let rejectedMessage: string | null = null

      selectedFiles.forEach((file) => {
        if (allowedTypes && allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
          rejectedMessage = `File type not supported (${file.name}).`
          return
        }

        if (file.size > maxFileSize) {
          rejectedMessage = `File ${file.name} exceeds the ${Math.round(maxFileSize / (1024 * 1024))}MB limit.`
          return
        }

        const duplicate = uploadedFiles.some((existing) => existing.name === file.name && existing.size === file.size)
        if (duplicate) {
          rejectedMessage = `File ${file.name} is already attached.`
          return
        }

        nextFiles.push({
          id: generateId(),
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          previewUrl: createPreviewUrl && file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
        })
      })

      if (nextFiles.length > 0) {
        setUploadedFiles((prev) => [...prev, ...nextFiles])
      }

      if (rejectedMessage) {
        setError(rejectedMessage)
      }

      event.target.value = ""
    },
    [allowedTypes, createPreviewUrl, generateId, maxFileSize, maxFiles, uploadedFiles]
  )

  const removeFile = useCallback(
    (id: string) => {
      setUploadedFiles((prev) => {
        const next = prev.filter((file) => file.id !== id)
        const removed = prev.find((file) => file.id === id)
        if (removed?.previewUrl) {
          URL.revokeObjectURL(removed.previewUrl)
        }
        return next
      })
    },
    []
  )

  const clearFiles = useCallback(() => {
    setUploadedFiles((prev) => {
      revokePreviewUrls(prev)
      return []
    })
    setError(null)
  }, [revokePreviewUrls])

  const isAtLimit = uploadedFiles.length >= maxFiles

  return {
    uploadedFiles,
    handleFileChange,
    removeFile,
    clearFiles,
    error,
    setError,
    isAtLimit,
  }
}

