"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import Breadcrumb from "@/components/common/Breadcrumb"
import { getApiUrl, withBasePath } from "@/utils/paths"

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    agree: false,
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (!formData.agree) {
      setError("Please agree to the terms and conditions")
      return
    }

    setLoading(true)

    try {
      const response = await fetch(getApiUrl("/api/auth/signup"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "An error occurred")
        return
      }

      router.push(withBasePath("/login?registered=true"))
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="preload signup-page">
      <Preloader />
      <Header />
      <Breadcrumb pageTitle="Sign up" paths={[{ name: "Home", link: "/" }, { name: "Signup", link: "/signup" }]} />
      <section className="signup_area section--padding2">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 offset-lg-3">
              <form onSubmit={handleSubmit}>
                <div className="cardify signup_form">
                  <div className="login--header">
                    <h3>Create Your Account</h3>
                    <p>
                      Please fill the following fields with appropriate information to register a new MartPlace account.
                    </p>
                  </div>
                  {/* end .login_header */}

                  <div className="login--form">
                    {error && (
                      <div className="alert alert-danger" role="alert" style={{ marginBottom: "20px" }}>
                        {error}
                      </div>
                    )}

                    <div className="form-group">
                      <label htmlFor="urname">Your Name</label>
                      <input
                        id="urname"
                        type="text"
                        name="name"
                        className="text_field"
                        placeholder="Enter your Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email_ad">Email Address</label>
                      <input
                        id="email_ad"
                        type="email"
                        name="email"
                        className="text_field"
                        placeholder="Enter your email address"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="user_name">Username</label>
                      <input
                        id="user_name"
                        type="text"
                        name="username"
                        className="text_field"
                        placeholder="Enter your username..."
                        value={formData.username}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="password">Password</label>
                      <input
                        id="password"
                        type="password"
                        name="password"
                        className="text_field"
                        placeholder="Enter your password..."
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="con_pass">Confirm Password</label>
                      <input
                        id="con_pass"
                        type="password"
                        name="confirmPassword"
                        className="text_field"
                        placeholder="Confirm password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <div className="custom_checkbox">
                        <input
                          type="checkbox"
                          id="agree_terms"
                          name="agree"
                          checked={formData.agree}
                          onChange={handleChange}
                          required
                        />
                        <label htmlFor="agree_terms">
                          <span className="shadow_checkbox"></span>
                          <span className="label_text">
                            I agree to the <Link href="/term-condition">Terms and Conditions</Link>
                          </span>
                        </label>
                      </div>
                    </div>

                    <button className="btn btn--md btn--round register_btn" type="submit" disabled={loading}>
                      {loading ? "Registering..." : "Register Now"}
                    </button>

                    <div className="social_login">
                      <p>Or register with</p>
                      <div className="social_login--buttons">
                        <button
                          type="button"
                          className="btn btn--sm btn--round btn--google"
                          onClick={() => signIn("google", { callbackUrl: withBasePath("/dashboard") })}
                        >
                          <span className="fa fa-google-plus"></span>
                          <span>Google</span>
                        </button>
                        <button
                          type="button"
                          className="btn btn--sm btn--round btn--facebook"
                          onClick={() => signIn("facebook", { callbackUrl: withBasePath("/dashboard") })}
                        >
                          <span className="fa fa-facebook"></span>
                          <span>Facebook</span>
                        </button>
                      </div>
                    </div>

                    <div className="login_assist">
                      <p>
                        Already have an account?
                        <Link href="/login">Login</Link>
                      </p>
                    </div>
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
            END SIGNUP AREA
    =================================*/}
      <Footer />
      <ScrollToTop />
    </div>
  )
}
