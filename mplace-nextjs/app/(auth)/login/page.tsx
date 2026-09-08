"use client"

import { useState, useEffect, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import Breadcrumb from "@/components/common/Breadcrumb"
import { getAuthCallbackUrl, withBasePath } from "@/utils/paths"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Check for error in URL params (from NextAuth error redirect)
  // This runs when the page loads or when searchParams change
  useEffect(() => {
    // Check both searchParams and window.location.search to catch errors
    const urlError = searchParams?.get?.("error") || new URLSearchParams(window.location.search).get("error")
    
    if (urlError) {
      // Decode error message
      const decodedError = decodeURIComponent(urlError)
      let errorMessage = "An error occurred during login"
      
      // Handle different error types
      if (decodedError === "CredentialsSignin" || decodedError.includes("credentials")) {
        errorMessage = "Invalid email or password"
      } else if (decodedError === "OAuthSignin" || decodedError === "OAuthCallback") {
        errorMessage = "OAuth sign-in failed. Please try again or use email/password login."
      } else if (decodedError === "OAuthAccountNotLinked") {
        errorMessage = "An account with this email already exists. Please sign in with your password instead."
      } else if (decodedError === "AccessDenied") {
        errorMessage = "Access denied. Please check your account permissions."
      } else if (decodedError === "Configuration") {
        errorMessage = "OAuth configuration error. Please contact support."
      } else if (decodedError) {
        errorMessage = `Login error: ${decodedError}`
      }
      
      // Set error message immediately - this will be displayed on the page
      setError(errorMessage)
      setLoading(false) // Make sure loading is false so error is visible
      
      // Scroll to top to ensure error is visible
      window.scrollTo({ top: 0, behavior: "smooth" })
      
      // Clean up URL - remove error parameter after displaying error
      // Use a longer delay to ensure error is visible before cleaning URL
      setTimeout(() => {
        const newUrl = window.location.pathname + window.location.search.replace(/[?&]error=[^&]*/, "")
        window.history.replaceState({}, "", newUrl)
      }, 2000) // Increased delay to ensure error message is visible
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setError("")
    setLoading(true)

    try {
      // Use signIn with redirect: false
      // NOTE: Even with redirect: false, NextAuth might still redirect on server side
      // If that happens, our custom error handler route will catch it and redirect to /login?error=...
      // The useEffect will then pick up the error from URL params
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      // Handle the result
      if (!result) {
        // If result is null/undefined, NextAuth might have redirected
        // Check URL params for error (might have been redirected to /login?error=...)
        const urlParams = new URLSearchParams(window.location.search)
        const urlError = urlParams.get("error")
        if (urlError) {
          // Error is in URL - useEffect will handle it
          setLoading(false)
          return
        }
        setError("No response from server. Please try again.")
        setLoading(false)
        return
      }

      if (result?.error) {
        // Handle specific error types
        if (result.error === "CredentialsSignin" || result.error.includes("credentials")) {
          setError("Invalid email or password")
        } else {
          setError(result.error || "An error occurred. Please try again.")
        }
        setLoading(false)
        return // Don't redirect - stay on login page
      }

      // Only redirect if login was successful
      if (result.ok && !result.error) {
        // Success - redirect to dashboard
        const dashboardPath = withBasePath("/dashboard")
        router.push(dashboardPath)
        router.refresh()
      } else {
        // Unknown result - show error on login page
        setError("An error occurred. Please try again.")
        setLoading(false)
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signIn('google', { callbackUrl: withBasePath('/dashboard') });
    } catch (error) {
      setError('Google sign-in failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="preload login-page">
      <Preloader />
      <Header />
      <Breadcrumb pageTitle="Login" paths={[{ name: "Home", link: "/" }, { name: "Login", link: "/login" }]} />
      <section className="login_area section--padding2">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 offset-lg-3">
              <form onSubmit={handleSubmit}>
                <div className="cardify login">
                  <div className="login--header">
                    <h3>Welcome Back</h3>
                    <p>You can sign in with your username</p>
                  </div>
                  {/* end .login_header */}

                  <div className="login--form">
                    {error && (
                      <div 
                        className="alert alert-danger" 
                        role="alert" 
                        style={{ 
                          marginBottom: "20px", 
                          display: "block", 
                          padding: "15px", 
                          borderRadius: "4px",
                          backgroundColor: "#f8d7da",
                          borderColor: "#f5c6cb",
                          color: "#721c24",
                          fontSize: "14px",
                          lineHeight: "1.5"
                        }}
                      >
                        <strong style={{ display: "block", marginBottom: "5px", fontSize: "16px" }}>⚠️ Error:</strong>
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="form-group">
                      <label htmlFor="user_name">Username</label>
                      <input
                        id="user_name"
                        type="email"
                        className="text_field"
                        placeholder="Enter your username..."
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="pass">Password</label>
                      <input
                        id="pass"
                        type="password"
                        className="text_field"
                        placeholder="Enter your password..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <div className="custom_checkbox">
                        <input
                          type="checkbox"
                          id="ch2"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <label htmlFor="ch2">
                          <span className="shadow_checkbox"></span>
                          <span className="label_text">Remember me</span>
                        </label>
                      </div>
                    </div>

                    <button className="btn btn--md btn--round" type="submit" disabled={loading}>
                      {loading ? "Logging in..." : "Login Now"}
                    </button>

                    <div className="social_login">
                      <p>Or login with</p>
                      <div className="social_login--buttons">
                        <button
                          type="button"
                          className="btn btn--sm btn--round btn--google"
                          onClick={(e) => { e.preventDefault(); handleGoogleSignIn(); }}
                        >
                          <span className="fa fa-google"></span>
                          <span>Google</span>
                        </button>
                        <button
                          type="button"
                          className="btn btn--sm btn--round btn--facebook"
                          onClick={() => signIn("facebook", { callbackUrl: getAuthCallbackUrl("/") })}
                        >
                          <span className="fa fa-facebook"></span>
                          <span>Facebook</span>
                        </button>
                      </div>
                    </div>

                    <div className="login_assist">
                      <p className="recover">
                        Lost your
                        <Link href="/recover-pass">username</Link> or
                        <Link href="/recover-pass">password</Link>?
                      </p>
                      <p className="signup">
                        Don't have an
                        <Link href="/signup">account</Link>?
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
            END LOGIN AREA
    =================================*/}
      <Footer />
      <ScrollToTop />
    </div>
  )
}

function LoginPageInner() {
  return (
    <LoginForm />
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="preload login-page">
          <Preloader />
          <Header />
          <ScrollToTop />
        </div>
      }
    >
      <LoginPageInner />
    </Suspense>
  )
}
