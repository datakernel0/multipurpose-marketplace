"use client"

import { useCallback, useRef, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import Breadcrumb from "@/components/common/Breadcrumb"
import { useFileUpload } from "@/hooks/useFileUpload"
import Link from "next/link"
import Image from "next/image"
import { getApiUrl } from "@/utils/paths"

export default function MessageComposePage() {
  const {
    uploadedFiles,
    handleFileChange,
    removeFile,
    clearFiles,
    error: fileError,
    setError: setFileError,
    isAtLimit,
  } = useFileUpload({
    maxFiles: 5,
    maxFileSize: 10 * 1024 * 1024,
  })
  const composerRef = useRef<HTMLDivElement>(null)
  const { data: session, status } = useSession()
  const router = useRouter()

  const [recipient, setRecipient] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return "0 B"
    const units = ["B", "KB", "MB", "GB"]
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
    const value = bytes / Math.pow(1024, index)
    return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`
  }, [])

  const uploadSelectedAttachments = useCallback(async () => {
    if (uploadedFiles.length === 0) {
      return []
    }

    setFileError(null)
    const uploaded: Array<{ url: string; fileName: string; mimeType: string; fileSize: number }> = []

    for (const file of uploadedFiles) {
      try {
        const formData = new FormData()
        formData.append("file", file.file)

        const response = await fetch(getApiUrl("/api/messages/attachments"), {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const data = await response.json().catch(() => ({ error: "Failed to upload attachment" }))
          throw new Error(data.error || `Failed to upload ${file.name}`)
        }

        const json = await response.json()
        const attachment = json?.attachment

        if (!attachment?.url) {
          throw new Error("Attachment upload response invalid")
        }

        uploaded.push({
          url: attachment.url,
          fileName: attachment.fileName || file.name,
          mimeType: attachment.mimeType || file.file.type || "application/octet-stream",
          fileSize: typeof attachment.fileSize === "number" ? attachment.fileSize : file.file.size,
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to upload attachment."
        setFileError(message)
        throw err instanceof Error ? err : new Error(message)
      }
    }

    return uploaded
  }, [getApiUrl, setFileError, uploadedFiles])

  const renderAttachments = (disabled: boolean) => (
    <>
      {uploadedFiles.length > 0 && (
        <div className="attached attached--list">
          {uploadedFiles.map((file) => (
            <div key={file.id} className="attached__item">
              {file.previewUrl ? (
                <Image
                  src={file.previewUrl}
                  alt={file.name}
                  width={48}
                  height={48}
                  className="attached__thumb"
                  unoptimized
                />
              ) : (
                <span className="lnr lnr-file-empty attached__icon" aria-hidden="true"></span>
              )}
              <div className="attached__meta">
                <p className="attached__name" title={file.name}>
                  {file.name}
                </p>
                <span className="attached__size">{formatFileSize(file.size)}</span>
              </div>
              <button
                type="button"
                className="attached__remove"
                onClick={() => removeFile(file.id)}
                disabled={disabled}
                aria-label={`Remove ${file.name}`}
              >
                <span className="lnr lnr-cross"></span>
              </button>
            </div>
          ))}
        </div>
      )}
      {fileError && <p className="attached__error">{fileError}</p>}
    </>
  )

  if (status === "loading") {
    return (
      <div className="preload messages-page">
        <Preloader />
        <Header />
        <div className="text-center" style={{ padding: "120px 0" }}>
          <p>Loading...</p>
        </div>
        <Footer />
        <ScrollToTop />
      </div>
    )
  }

  if (status === "unauthenticated") {
    router.push("/login?callbackUrl=/message-compose")
    return null
  }

  const handleSend = async () => {
    if (!composerRef.current) return

    const messageContent = composerRef.current.innerText.trim()
    setFileError(null)
    if (!recipient.trim()) {
      setError("Please enter a recipient username or email.")
      setSuccess("")
      return
    }

    if (!messageContent && uploadedFiles.length === 0) {
      setError("Add a message or at least one attachment.")
      setSuccess("")
      return
    }

    try {
      setSending(true)
      setError("")
      setSuccess("")

      const resolveResponse = await fetch(getApiUrl("/api/messages/resolve"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: recipient }),
      })

      if (!resolveResponse.ok) {
        const data = await resolveResponse.json().catch(() => ({ error: "Failed to resolve user" }))
        throw new Error(data.error || "Failed to resolve recipient")
      }

      const { user } = await resolveResponse.json()

      const attachmentPayload = await uploadSelectedAttachments()

      const sendResponse = await fetch(getApiUrl("/api/messages/send"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: user.id,
          content: messageContent,
          attachments: attachmentPayload,
        }),
      })

      if (!sendResponse.ok) {
        const data = await sendResponse.json().catch(() => ({ error: "Failed to send message" }))
        throw new Error(data.error || "Failed to send message")
      }

      const result = await sendResponse.json()
      const chatId = result.message?.chatId

      composerRef.current.innerText = ""
      setRecipient("")
      setSuccess("Message sent successfully.")
      clearFiles()

      if (chatId) {
        router.push(`/message?chat=${chatId}`)
      } else {
        router.push("/message")
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="preload messages-page">
      <Preloader />
      <Header />
      <Breadcrumb pageTitle="Messages" paths={[{ name: "Message", link: "/message" }]} />

      <section className="message_area">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="content_title">
                <h3>Messages</h3>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-5">
              <div className="cardify messaging_sidebar">
                <div className="messaging__header">
                  <div className="messaging_menu">
                    <a href="#" id="drop2" className="dropdown-toggle" aria-haspopup="true" aria-expanded="true" onClick={(event) => event.preventDefault()}>
                      <span className="lnr lnr-inbox"></span>Inbox
                      <span className="msg">0</span>
                      <span className="lnr lnr-chevron-down"></span>
                    </a>

                    <ul className="custom_dropdown messaging_dropdown dropdown-menu" aria-labelledby="drop2">
                      <li>
                        <a href="#">
                          <span className="lnr lnr-inbox"></span>Inbox
                        </a>
                      </li>
                      <li>
                        <a href="#">
                          <span className="fa fa-star-o"></span>Starred
                        </a>
                      </li>
                      <li>
                        <a href="#">
                          <span className="lnr lnr-dice"></span>Sent
                        </a>
                      </li>
                      <li>
                        <a href="#">
                          <span className="lnr lnr-trash"></span>Trash
                        </a>
                      </li>
                    </ul>
                  </div>

                  <div className="messaging_action">
                    <span className="lnr lnr-trash"></span>
                    <span className="lnr lnr-sync"></span>

                    <Link href="/message-compose" className="btn btn--round btn--sm">
                      <span className="lnr lnr-pencil"></span>
                      <span className="text">Compose</span>
                    </Link>
                  </div>
                </div>

                <div className="messaging__contents">
                  <div className="message_search">
                    <input type="text" placeholder="Search messages..." disabled />
                    <span className="lnr lnr-magnifier"></span>
                  </div>

                  <div className="messages">
                    {/* Empty message list for compose page */}
                    <p className="text-center p-3">Select a recipient to start a conversation.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-7">
              <div className="chat_area cardify">
                <div className="chat_area--title">
                  <h3>Compose New Message</h3>
                </div>

                <div className="message_composer composing">
                  {error && <div className="alert alert-danger" role="alert">{error}</div>}
                  {success && <div className="alert alert-success" role="alert">{success}</div>}

                  <input
                    type="text"
                    className="recipient_field"
                    placeholder="To"
                    value={recipient}
                    onChange={(event) => setRecipient(event.target.value)}
                    disabled={sending}
                  />

                  <div className="composer_field" id="trumbowyg-demo" contentEditable={!sending} ref={composerRef}></div>

                  {renderAttachments(sending)}

                  <div className="btns">
                    <button className="btn send btn--sm btn--round" onClick={handleSend} disabled={sending}>
                      {sending ? "Sending..." : "Send"}
                    </button>
                    <label htmlFor="att">
                      <input
                        type="file"
                        className="attachment_field"
                        id="att"
                        multiple
                        onChange={handleFileChange}
                        disabled={sending || isAtLimit}
                      />
                      <span className="lnr lnr-paperclip"></span>Attachment
                    </label>

                    <Link href="/message" className="btn btn--round btn--sm cancel_btn">
                      Cancel
                    </Link>
                  </div>
                </div>
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

