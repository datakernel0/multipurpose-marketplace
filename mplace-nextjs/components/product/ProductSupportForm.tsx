"use client"

import { useState, type FormEvent } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { getApiUrl } from "@/utils/paths"

interface ProductSupportFormProps {
  productId: string
}

export default function ProductSupportForm({ productId }: ProductSupportFormProps) {
  const [supportSubject, setSupportSubject] = useState("")
  const [supportMessage, setSupportMessage] = useState("")
  const [supportSending, setSupportSending] = useState(false)
  const [supportSuccess, setSupportSuccess] = useState("")
  const [supportError, setSupportError] = useState("")
  const { data: session } = useSession()

  const isAuthenticated = session !== null

  const handleSupportSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!isAuthenticated) {
      setSupportError("Please sign in to contact the author.")
      setSupportSuccess("")
      return
    }

    if (!supportSubject.trim()) {
      setSupportError("Subject is required.")
      setSupportSuccess("")
      return
    }

    if (!supportMessage.trim()) {
      setSupportError("Please enter your support message.")
      setSupportSuccess("")
      return
    }

    try {
      setSupportSending(true)
      setSupportError("")
      setSupportSuccess("")

      const response = await fetch(getApiUrl(`/api/products/${encodeURIComponent(productId)}/support`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          subject: supportSubject.trim(),
          message: supportMessage.trim(),
        }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data?.error || "Failed to send support message.")
      }

      setSupportSuccess("Your message has been sent to the author. They will get back to you soon.")
      setSupportSubject("")
      setSupportMessage("")
    } catch (error: any) {
      setSupportError("Failed to send support request. Please try again.")
    } finally {
      setSupportSending(false)
    }
  }

  return (
    <>
      {!isAuthenticated && (
        <p>
          Please <Link href="/login">sign in</Link> to contact this author.
        </p>
      )}
      {supportError && <p className="text-danger">{supportError}</p>}
      {supportSuccess && <p className="text-success">{supportSuccess}</p>}

      <form className="support_form" onSubmit={handleSupportSubmit}>
        <div className="form-group">
          <label htmlFor="subj">Support Subject:</label>
          <input
            type="text"
            id="subj"
            className="text_field"
            placeholder="Enter your subject"
            value={supportSubject}
            onChange={(event) => setSupportSubject(event.target.value)}
            disabled={!isAuthenticated || supportSending}
          />
        </div>

        <div className="form-group">
          <label htmlFor="supmsg">Support Query:</label>
          <textarea
            className="text_field"
            id="supmsg"
            name="supmsg"
            placeholder="Enter your text..."
            value={supportMessage}
            onChange={(event) => setSupportMessage(event.target.value)}
            disabled={!isAuthenticated || supportSending}
          ></textarea>
        </div>
        <button
          type="submit"
          className="btn btn--lg btn--round"
          disabled={!isAuthenticated || supportSending}
        >
          {supportSending ? "Sending..." : "Submit Now"}
        </button>
      </form>
    </>
  )
}

