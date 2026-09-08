"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import Breadcrumb from "@/components/common/Breadcrumb"
import DashboardMenu from "@/components/dashboard/DashboardMenu"
import { withBasePath, getApiUrl } from "@/utils/paths"
import Image from "next/image"

interface Category {
  id: string
  name: string
  slug: string
}

interface Product {
  id: string
  title: string
  description: string
  price: number
  salePrice: number | null
  livePreviewUrl: string | null
  downloadUrl: string | null
  categoryId: string
  images: string[]
  tags: string
  filesIncluded: string[]
  compatibleBrowsers: string[]
  columns: string
  dimensions: string
  minSoftwareVersion: string
  highResolution: string
  retinaReady: string
}

function EditItemPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [product, setProduct] = useState<Product | null>(null)
  const productId = searchParams?.get?.("id") || ""

  // Form state
  const [formData, setFormData] = useState({
    categoryId: "",
    title: "",
    description: "",
    price: "",
    salePrice: "",
    livePreviewUrl: "",
    downloadUrl: "",
    tags: "",
    filesIncluded: [] as string[],
    compatibleBrowsers: [] as string[],
    columns: "",
    dimensions: "",
    minSoftwareVersion: "",
    highResolution: "",
    retinaReady: "",
  })

  // File uploads
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("")
  const [mainFile, setMainFile] = useState<File | null>(null)
  const [screenshots, setScreenshots] = useState<File | null>(null)
  const [existingImages, setExistingImages] = useState<string[]>([])

  const thumbnailInputRef = useRef<HTMLInputElement>(null)
  const mainFileInputRef = useRef<HTMLInputElement>(null)
  const screenshotsInputRef = useRef<HTMLInputElement>(null)

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(getApiUrl("/api/categories"))
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        }
      } catch (error: any) {
        setError("Failed to load categories.")
      }
    }

    fetchCategories()
  }, [])

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId || !session?.user) return

      try {
        setLoading(true)
        const response = await fetch(getApiUrl(`/api/products/${productId}`))

        if (!response.ok) {
          throw new Error("Failed to fetch product")
        }

        const data = await response.json()
        setProduct(data)

        // Filter out ZIP files from existing images
        const validImages = (data.images || []).filter((img: string) => {
          if (!img || typeof img !== 'string') return false
          const lowerImg = img.toLowerCase()
          const isZip = lowerImg.endsWith('.zip')
          const isImage = lowerImg.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i)
          return !isZip && (isImage || img.startsWith('/uploads/products/'))
        })

        setExistingImages(validImages)

        // Pre-populate form
        setFormData({
          categoryId: data.categoryId || "",
          title: data.title || "",
          description: data.description || "",
          price: data.price?.toString() || "",
          salePrice: data.salePrice?.toString() || "",
          livePreviewUrl: data.livePreviewUrl || "",
          downloadUrl: data.downloadUrl || "",
          tags: data.tags || "",
          filesIncluded: Array.isArray(data.filesIncluded) ? data.filesIncluded : [],
          compatibleBrowsers: Array.isArray(data.compatibleBrowsers) ? data.compatibleBrowsers : [],
          columns: data.columns || "",
          dimensions: data.dimensions || "",
          minSoftwareVersion: data.minSoftwareVersion || "",
          highResolution: data.highResolution || "",
          retinaReady: data.retinaReady || "",
        })

        // Set thumbnail preview from first image
        if (validImages.length > 0) {
          setThumbnailPreview(validImages[0])
        }
      } catch (error: any) {
        setError(error.message || "Failed to load product.")
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }

    if (productId && session?.user) {
      fetchProduct()
    }
  }, [productId, session])

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(withBasePath("/login"))
    }
  }, [status, router])

  const handleFileUpload = async (file: File, type: "thumbnail" | "main" | "screenshot") => {
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", type)

      const response = await fetch(getApiUrl("/api/upload/product"), {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload file")
      }

      // Handle screenshot ZIP extraction - returns array of URLs
      if (type === "screenshot" && data.urls && Array.isArray(data.urls)) {
        return data.urls // Return array of URLs
      }

      // Handle single file uploads
      return data.url
    } catch (error: any) {
      throw new Error(error.message || "File upload failed")
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target

    if (type === "select-multiple") {
      const select = e.target as HTMLSelectElement
      const selectedValues = Array.from(select.selectedOptions, (option) => option.value)
      setFormData((prev) => ({
        ...prev,
        [name]: selectedValues,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleRadioChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setMessage("")
    setSubmitting(true)

    try {
      // Validate required fields
      if (!formData.categoryId || !formData.title || !formData.description || !formData.price) {
        setError("Please fill in all required fields")
        setSubmitting(false)
        return
      }

      // Ensure we have at least one image (either existing or new upload)
      if (!thumbnail && existingImages.length === 0) {
        setError("Please upload at least one image (thumbnail)")
        setSubmitting(false)
        return
      }

      // Prepare images array
      let images: string[] = []

      // If new thumbnail uploaded, use it; otherwise keep existing first image
      if (thumbnail) {
        const uploadedThumbnail = await handleFileUpload(thumbnail, "thumbnail")
        images.push(uploadedThumbnail)
        // Add existing screenshots (skip first one as it's the old thumbnail)
        if (existingImages.length > 1) {
          images.push(...existingImages.slice(1))
        }
      } else {
        // Keep all existing images
        images = [...existingImages]
      }

      // Handle new screenshots
      if (screenshots) {
        const uploadedScreenshots = await handleFileUpload(screenshots, "screenshot")
        if (Array.isArray(uploadedScreenshots)) {
          images.push(...uploadedScreenshots)
        } else {
          images.push(uploadedScreenshots)
        }
      }


      // Ensure we have images
      const finalImages = images.length > 0 ? images : existingImages
      
      if (finalImages.length === 0) {
        setError("At least one image is required")
        setSubmitting(false)
        return
      }

      let uploadedMainFile: string | null = null
      if (mainFile) {
        uploadedMainFile = await handleFileUpload(mainFile, "main")
        setFormData((prev) => ({ ...prev, downloadUrl: uploadedMainFile ?? "" }))
      }

      // Update product
      const resolvedDownloadUrl = uploadedMainFile || formData.downloadUrl

      const response = await fetch(getApiUrl(`/api/products/${productId}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          categoryId: formData.categoryId,
          price: formData.price,
          salePrice: formData.salePrice || null,
          livePreviewUrl: formData.livePreviewUrl || null,
          downloadUrl: resolvedDownloadUrl || null,
          images: finalImages,
          tags: formData.tags,
          filesIncluded: formData.filesIncluded,
          compatibleBrowsers: formData.compatibleBrowsers,
          columns: formData.columns,
          dimensions: formData.dimensions,
          minSoftwareVersion: formData.minSoftwareVersion,
          highResolution: formData.highResolution,
          retinaReady: formData.retinaReady,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update product")
      }

      setMessage("Product updated successfully!")
      
      // Redirect to manage items after 2 seconds
      setTimeout(() => {
        router.push(withBasePath("/dashboard/manage-item"))
      }, 2000)
    } catch (error: any) {
      setError(error.message || "Failed to update product.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="preload dashboard-page">
        <Preloader />
        <Header />
        <div className="text-center" style={{ padding: "100px 0" }}>
          <p>Loading product data...</p>
        </div>
        <Footer />
        <ScrollToTop />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="preload dashboard-page">
        <Preloader />
        <Header />
        <div className="text-center" style={{ padding: "100px 0" }}>
          <p>Product not found</p>
          <button
            className="btn btn--round"
            onClick={() => router.push(withBasePath("/dashboard/manage-item"))}
          >
            Back to Manage Items
          </button>
        </div>
        <Footer />
        <ScrollToTop />
      </div>
    )
  }

  return (
    <div className="preload dashboard-page">
      <Preloader />
      <Header />
      <Breadcrumb
        pageTitle="Edit Item"
        paths={[
          { name: "Dashboard", link: "/dashboard" },
          { name: "Manage Item", link: "/dashboard/manage-item" },
          { name: "Edit Item", link: "/dashboard/edit-item" },
        ]}
      />

      <section className="dashboard-area">
        <DashboardMenu />

        <div className="dashboard_contents">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="dashboard_title_area">
                  <div className="pull-left">
                    <div className="dashboard__title">
                      <h3>Edit Your Item</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-lg-8 col-md-7">
                <form action="#" onSubmit={handleFormSubmit}>
                  <div className="upload_modules">
                    <div className="modules__title">
                      <h3>Item Name & Description</h3>
                    </div>

                    <div className="modules__content">
                      <div className="form-group">
                        <label htmlFor="category">
                          Select Category<sup>*</sup>
                        </label>
                        <div className="select-wrap select-wrap2">
                          <select
                            name="categoryId"
                            id="category"
                            className="text_field"
                            value={formData.categoryId}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Select one</option>
                            {categories.map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                          <span className="lnr lnr-chevron-down"></span>
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="product_name">
                          Product Name<sup>*</sup>
                          <span>(Max 100 characters)</span>
                        </label>
                        <input
                          type="text"
                          id="product_name"
                          name="title"
                          className="text_field"
                          placeholder="Enter your product name here..."
                          value={formData.title}
                          onChange={handleInputChange}
                          maxLength={100}
                          required
                        />
                        <small style={{ color: "#999" }}>
                          {formData.title.length}/100 characters
                        </small>
                      </div>

                      <div className="form-group">
                        <p className="label">
                          Product Description<sup>*</sup>
                        </p>
                        <textarea
                          name="description"
                          id="description"
                          className="text_field"
                          rows={10}
                          placeholder="Enter product description..."
                          value={formData.description}
                          onChange={handleInputChange}
                          required
                          style={{ minHeight: "200px" }}
                        />
                      </div>

                      <div className="form-group no-margin">
                        <label htmlFor="live_preview_url">
                          Live Preview URL (Optional)
                          <span>(Demo link where users can preview your product)</span>
                        </label>
                        <input
                          type="url"
                          id="live_preview_url"
                          name="livePreviewUrl"
                          className="text_field"
                          placeholder="https://example.com/demo"
                          value={formData.livePreviewUrl}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="upload_modules module--upload">
                    <div className="modules__title">
                      <h3>Update Files</h3>
                    </div>

                    <div className="modules__content">
                      <div className="form-group">
                        <div className="upload_wrapper">
                          <p>
                            Upload Preview Image<span>(JPEG or PNG 590x300px)</span>
                          </p>

                          {existingImages.length > 0 && !thumbnail && (
                            <div style={{ marginBottom: "15px" }}>
                              <p style={{ marginBottom: "10px", color: "#666" }}>Current preview image:</p>
                              <Image
                                src={withBasePath(existingImages[0])}
                                alt="Current preview"
                                width={200}
                                height={150}
                                style={{
                                  border: "1px solid #ddd",
                                  borderRadius: "4px",
                                  padding: "5px",
                                  backgroundColor: "#f9f9f9",
                                }}
                              />
                            </div>
                          )}

                          <div className="custom_upload">
                            <label htmlFor="thumbnail">
                              <input
                                ref={thumbnailInputRef}
                                type="file"
                                id="thumbnail"
                                className="files"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) {
                                    setThumbnail(file)
                                    // Create preview URL
                                    const reader = new FileReader()
                                    reader.onloadend = () => {
                                      setThumbnailPreview(reader.result as string)
                                    }
                                    reader.readAsDataURL(file)
                                  }
                                }}
                              />
                              <span className="btn btn--round btn--sm">
                                {thumbnail ? thumbnail.name : "Choose File"}
                              </span>
                            </label>
                          </div>
                          {thumbnail && (
                            <>
                              <p style={{ marginTop: "10px", color: "#28a745" }}>
                                ✓ {thumbnail.name} selected
                              </p>
                              {thumbnailPreview && (
                                <div style={{ marginTop: "15px" }}>
                                  <img
                                    src={thumbnailPreview}
                                    alt="Thumbnail preview"
                                    style={{
                                      maxWidth: "200px",
                                      maxHeight: "200px",
                                      border: "1px solid #ddd",
                                      borderRadius: "4px",
                                      padding: "5px",
                                      backgroundColor: "#f9f9f9",
                                    }}
                                  />
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      <div className="form-group">
                        <div className="upload_wrapper">
                          <p>
                            Upload Main File<span>(ZIP up to 500MB)</span>
                          </p>

                          <div className="custom_upload">
                            <label htmlFor="main_file">
                              <input
                                ref={mainFileInputRef}
                                type="file"
                                id="main_file"
                                className="files"
                                accept=".zip"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) {
                                    setMainFile(file)
                                  }
                                }}
                              />
                              <span className="btn btn--round btn--sm">
                                {mainFile ? mainFile.name : "Choose File"}
                              </span>
                            </label>
                          </div>
                          {mainFile && (
                            <p style={{ marginTop: "10px", color: "#28a745" }}>
                              ✓ {mainFile.name} selected
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="download_url">Download File URL</label>
                        <input
                          type="text"
                          id="download_url"
                          name="downloadUrl"
                          className="text_field"
                          placeholder="Auto-filled after uploading main file or paste a URL"
                          value={formData.downloadUrl}
                          onChange={handleInputChange}
                        />
                        <small>Customers will receive this file when they download their purchase.</small>
                      </div>

                      <div className="form-group">
                        <div className="upload_wrapper">
                          <p>
                            Upload Screenshots<span>(ZIP file of images)</span>
                          </p>

                          {existingImages.length > 1 && !screenshots && (
                            <div style={{ marginBottom: "15px" }}>
                              <p style={{ marginBottom: "10px", color: "#666" }}>Current screenshots ({existingImages.length - 1}):</p>
                              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                                {existingImages.slice(1).map((img, idx) => (
                                  <Image
                                    key={idx}
                                    src={withBasePath(img)}
                                    alt={`Screenshot ${idx + 1}`}
                                    width={100}
                                    height={75}
                                    style={{
                                      border: "1px solid #ddd",
                                      borderRadius: "4px",
                                      padding: "5px",
                                      backgroundColor: "#f9f9f9",
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="custom_upload">
                            <label htmlFor="screenshot">
                              <input
                                ref={screenshotsInputRef}
                                type="file"
                                id="screenshot"
                                className="files"
                                accept=".zip"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) {
                                    setScreenshots(file)
                                  }
                                }}
                              />
                              <span className="btn btn--round btn--sm">
                                {screenshots ? screenshots.name : "Choose File"}
                              </span>
                            </label>
                          </div>
                          {screenshots && (
                            <p style={{ marginTop: "10px", color: "#28a745" }}>
                              ✓ {screenshots.name} selected
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="upload_modules">
                    <div className="modules__title">
                      <h3>Others Information</h3>
                    </div>

                    <div className="modules__content">
                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="selected">Files Included</label>
                            <select
                              name="filesIncluded"
                              id="selected"
                              multiple
                              className="text_field"
                              value={formData.filesIncluded}
                              onChange={handleInputChange}
                            >
                              <option value="php">php</option>
                              <option value="html">Html</option>
                              <option value="psd">psd</option>
                              <option value="js">javascript</option>
                              <option value="coffee">coffeescript</option>
                              <option value="video">Video</option>
                            </select>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="browsers">Compatible Browsers</label>
                            <select
                              name="compatibleBrowsers"
                              id="browsers"
                              multiple
                              className="text_field"
                              value={formData.compatibleBrowsers}
                              onChange={handleInputChange}
                            >
                              <option value="ie8">IE8</option>
                              <option value="ie9">IE9</option>
                              <option value="chrome">Chrome</option>
                              <option value="firefox">firefox</option>
                              <option value="safari">safari</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="columns">Columns</label>
                            <div className="select-wrap select-wrap2">
                              <select
                                name="columns"
                                id="columns"
                                className="text_field"
                                value={formData.columns}
                                onChange={handleInputChange}
                              >
                                <option value="">Choose Columns</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4+</option>
                              </select>
                              <span className="lnr lnr-chevron-down"></span>
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="dimension">Item Dimensions</label>
                            <input
                              type="text"
                              id="dimension"
                              name="dimensions"
                              className="text_field"
                              placeholder="Ex: 1920x6000."
                              value={formData.dimensions}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="soft">Minimum Software Version</label>
                        <div className="select-wrap select-wrap2">
                          <select
                            name="minSoftwareVersion"
                            id="soft"
                            className="text_field"
                            value={formData.minSoftwareVersion}
                            onChange={handleInputChange}
                          >
                            <option value="">Choose version</option>
                            <option value="4">WordPress 4</option>
                            <option value="4.1">WordPress 4.1.*</option>
                            <option value="4.2">WordPress 4.2.*</option>
                            <option value="4.3">WordPress 4.3.*</option>
                            <option value="4.4">WordPress 4.4.*</option>
                          </select>
                          <span className="lnr lnr-chevron-down"></span>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group radio-group">
                            <p className="label">High Resolution</p>
                            <div className="custom-radio">
                              <input
                                type="radio"
                                id="yes"
                                name="high_res"
                                checked={formData.highResolution === "yes"}
                                onChange={() => handleRadioChange("highResolution", "yes")}
                              />
                              <label htmlFor="yes">
                                <span className="circle"></span>Yes
                              </label>
                            </div>

                            <div className="custom-radio">
                              <input
                                type="radio"
                                id="no"
                                name="high_res"
                                checked={formData.highResolution === "no"}
                                onChange={() => handleRadioChange("highResolution", "no")}
                              />
                              <label htmlFor="no">
                                <span className="circle"></span>no
                              </label>
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group radio-group">
                            <p className="label">Retina Ready</p>
                            <div className="custom-radio">
                              <input
                                type="radio"
                                id="ryes"
                                name="retina"
                                checked={formData.retinaReady === "yes"}
                                onChange={() => handleRadioChange("retinaReady", "yes")}
                              />
                              <label htmlFor="ryes">
                                <span className="circle"></span>Yes
                              </label>
                            </div>

                            <div className="custom-radio">
                              <input
                                type="radio"
                                id="rno"
                                name="retina"
                                checked={formData.retinaReady === "no"}
                                onChange={() => handleRadioChange("retinaReady", "no")}
                              />
                              <label htmlFor="rno">
                                <span className="circle"></span>no
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="tags">
                          Item Tags<span>(Max 10 tags, comma-separated)</span>
                        </label>
                        <textarea
                          name="tags"
                          id="tags"
                          className="text_field"
                          placeholder="Enter your item tags here (e.g., wordpress, theme, responsive)..."
                          value={formData.tags}
                          onChange={handleInputChange}
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  <div className="upload_modules with--addons">
                    <div className="modules__title">
                      <h3>Pricing Information</h3>
                    </div>

                    <div className="modules__content">
                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="rlicense">
                              Regular License<sup>*</sup>
                            </label>
                            <div className="input-group">
                              <span className="input-group-addon">$</span>
                              <input
                                type="number"
                                id="rlicense"
                                name="price"
                                className="text_field"
                                placeholder="00.00"
                                step="0.01"
                                min="0"
                                value={formData.price}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="exlicense">Sale Price (Optional)</label>
                            <div className="input-group">
                              <span className="input-group-addon">$</span>
                              <input
                                type="number"
                                id="exlicense"
                                name="salePrice"
                                className="text_field"
                                placeholder="00.00"
                                step="0.01"
                                min="0"
                                value={formData.salePrice}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="alert alert-danger" style={{ marginTop: "20px", padding: "15px", backgroundColor: "#f8d7da", color: "#721c24", borderRadius: "4px" }}>
                      <strong>Error:</strong> {error}
                    </div>
                  )}

                  {message && (
                    <div className="alert alert-success" style={{ marginTop: "20px", padding: "15px", backgroundColor: "#d4edda", color: "#155724", borderRadius: "4px" }}>
                      <strong>Success:</strong> {message}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn--round btn--fullwidth btn--lg"
                    disabled={submitting}
                  >
                    {submitting ? "Updating..." : "Update Your Item"}
                  </button>
                </form>
              </div>

              <div className="col-lg-4 col-md-5">
                <aside className="sidebar upload_sidebar">
                  <div className="sidebar-card">
                    <div className="card-title">
                      <h3>Quick Upload Rules</h3>
                    </div>

                    <div className="card_content">
                      <div className="card_info">
                        <h4>Image Upload</h4>
                        <p>Nunc placerat mi id nisi interdum mollis. Praesent there pharetra, justo ut sceleris que the mattis interdum.</p>
                      </div>

                      <div className="card_info">
                        <h4>File Upload</h4>
                        <p>Nunc placerat mi id nisi interdum mollis. Praesent there pharetra, justo ut sceleris que the mattis interdum.</p>
                      </div>

                      <div className="card_info">
                        <h4>Vector Upload</h4>
                        <p>Nunc placerat mi id nisi interdum mollis. Praesent there pharetra, justo ut sceleris que the mattis interdum.</p>
                      </div>
                    </div>
                  </div>

                  <div className="sidebar-card">
                    <div className="card-title">
                      <h3>Trouble Uploading?</h3>
                    </div>

                    <div className="card_content">
                      <p>Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceler isque the mattis, leo quam aliquet congue.</p>
                      <ul>
                        <li>Consectetur elit, sed do eiusmod the labore et dolore magna.</li>
                        <li>Consectetur elit, sed do eiusmod the labore et dolore magna.</li>
                        <li>Consectetur elit, sed do eiusmod the labore et dolore magna.</li>
                        <li>Consectetur elit, sed do eiusmod the</li>
                      </ul>
                    </div>
                  </div>

                  <div className="sidebar-card">
                    <div className="card-title">
                      <h3>More Upload Info</h3>
                    </div>

                    <div className="card_content">
                      <p>Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceler isque the mattis, leo quam aliquet congue.</p>
                      <ul>
                        <li>Consectetur elit, sed do eiusmod the labore et dolore magna.</li>
                        <li>Consectetur elit, sed do eiusmod the labore et dolore magna.</li>
                        <li>Consectetur elit, sed do eiusmod the labore et dolore magna.</li>
                        <li>Consectetur elit, sed do eiusmod the</li>
                      </ul>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <ScrollToTop />
    </div>
  )
}

function EditItemPageInner() {
  return <EditItemPageContent />
}

export default function EditItemPage() {
  return (
    <Suspense
      fallback={
        <div className="preload dashboard-edit-item-page">
          <Preloader />
          <Header />
          <ScrollToTop />
        </div>
      }
    >
      <EditItemPageInner />
    </Suspense>
  )
}

