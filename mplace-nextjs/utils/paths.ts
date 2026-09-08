/**
 * Get the base path for the application
 * This should match the basePath in next.config.ts
 * Note: In Next.js, static files from /public are automatically served with basePath
 * This function is needed for hardcoded paths in components (images, CSS links, etc.)
 */
export function getBasePath(): string {
  if (typeof window !== "undefined") {
    // Client-side: basePath might be available from Next.js router
    return process.env.NEXT_PUBLIC_BASE_PATH || "";
  }
  // Server-side: read from environment
  return process.env.NEXT_PUBLIC_BASE_PATH || "";
}

/**
 * Prefix a path with the basePath
 * @param path - The path to prefix (should start with /)
 * @returns The path with basePath prefix
 * 
 * Note: Next.js automatically serves static files from /public with basePath,
 * but this is needed for paths used in src attributes, background images, etc.
 * If the path is already an absolute URL (http:// or https://), it's returned as-is.
 */
export function withBasePath(path: string | undefined | null): string {
  // Handle undefined/null paths gracefully
  if (!path) {
    return ""
  }
  
  // If path is already an absolute URL, return it as-is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path
  }
  
  const basePath = getBasePath();
  
  // If basePath is not set, just normalize and return the path
  if (!basePath || basePath.trim() === "") {
    return path.startsWith("/") ? path : `/${path}`
  }
  
  const cleanBasePath = basePath.replace(/\/$/, "")
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  
  // Check if path already starts with basePath to avoid double prefixing
  if (normalizedPath.startsWith(cleanBasePath)) {
    // Path already has basePath, return as-is
    return normalizedPath
  }
  
  // Add basePath prefix
  return `${cleanBasePath}${normalizedPath}`
}

export function getAuthCallbackUrl(path: string): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  return basePath + path;
}

/**
 * Get the API URL with basePath prefix
 * Use this for all fetch calls to API routes
 * @param path - The API path (should start with /api/)
 * @returns The API URL with basePath prefix
 */
export function getApiUrl(path: string): string {
  return withBasePath(path);
}

