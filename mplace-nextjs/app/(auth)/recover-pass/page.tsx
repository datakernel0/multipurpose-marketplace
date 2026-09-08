"use client"

import { useState } from "react"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import Breadcrumb from "@/components/common/Breadcrumb"
import { getApiUrl } from "@/utils/paths"

export default function RecoverPasswordPage() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const response = await fetch(getApiUrl("/api/auth/forgot-password"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("Password reset link has been sent to your email")
      } else {
        setMessage(data.error || "An error occurred")
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="preload login-page">
      <Preloader />
      <Header />
      <Breadcrumb pageTitle="Recover password" paths={[{ name: "Home", link: "/" }, { name: "Recover-Password", link: "/recover-pass" }]} />
      <section className="pass_recover_area section--padding2">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 offset-lg-3">
              <form onSubmit={handleSubmit}>
                <div className="cardify recover_pass">
                  <div className="login--header">
                    <p>
                      Please enter the email address for your account. A verification code will be sent to you. Once you have
                      received the verification code, you will be able to choose a new password for your account.
                    </p>
                  </div>
                  {/* end .login_header */}

                  <div className="login--form">
                    {message && (
                      <div className={`alert ${message.includes("sent") ? "alert-success" : "alert-danger"}`} role="alert" style={{ marginBottom: "20px" }}>
                        {message}
                      </div>
                    )}

                    <div className="form-group">
                      <label htmlFor="email_ad">Email Address</label>
                      <input
                        id="email_ad"
                        type="email"
                        className="text_field"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <button className="btn btn--md btn--round register_btn" type="submit" disabled={loading}>
                      {loading ? "Sending..." : "Send Verification Code"}
                    </button>
                  </div>
                  {/* end .login--form */}
                </div>
                {/* end .cardify */}
              </form>
            </div>
            {/* end .col-md-6 */}
          </div>
          {/* end .row */}
        </div>
        {/* end .container */}
      </section>
      {/*================================
            END DASHBOARD AREA
    =================================*/}
      <Footer />
      <ScrollToTop />
    </div>
  )
}
