import { NextResponse } from "next/server"
import { withBasePath } from "@/utils/paths"

/**
 * Custom error handler for NextAuth
 * Intercepts NextAuth error redirects and redirects back to login with error query param
 * This prevents the error page from being shown
 * 
 * IMPORTANT: This route intercepts ALL requests to /api/auth/error
 * and redirects them back to the login page with the error message
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const error = searchParams.get("error") || "CredentialsSignin"
    
    // Redirect back to login page with error message using withBasePath
    const loginPath = `/login?error=${encodeURIComponent(error)}`
    const loginUrl = withBasePath(loginPath)
    
    // Construct full URL with basePath
    const baseUrl = new URL(request.url).origin
    const fullLoginUrl = `${baseUrl}${loginUrl}`
    
    return NextResponse.redirect(fullLoginUrl)
  } catch (error) {
    // Fallback redirect
    const loginPath = `/login?error=CredentialsSignin`
    const loginUrl = withBasePath(loginPath)
    const baseUrl = new URL(request.url).origin
    const fullLoginUrl = `${baseUrl}${loginUrl}`
    return NextResponse.redirect(fullLoginUrl)
  }
}

