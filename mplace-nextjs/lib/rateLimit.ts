/**
 * Simple in-memory rate limiter for API routes
 * For production with high traffic, consider using Redis-based rate limiting
 */

interface RateLimitStore {
  count: number
  resetTime: number
}

// In-memory store (clears on server restart)
// In production, use Redis or a persistent store
const store = new Map<string, RateLimitStore>()

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of store.entries()) {
    if (value.resetTime < now) {
      store.delete(key)
    }
  }
}, 5 * 60 * 1000)

export interface RateLimitOptions {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime: number
  retryAfter?: number // Seconds until retry is allowed
}

/**
 * Rate limit check for a given identifier (IP address, user ID, etc.)
 * @param identifier - Unique identifier for rate limiting (e.g., IP address)
 * @param options - Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { windowMs: 60 * 1000, maxRequests: 100 }
): RateLimitResult {
  const now = Date.now()
  const key = identifier
  const entry = store.get(key)

  if (!entry || entry.resetTime < now) {
    // Create new entry or reset expired entry
    store.set(key, {
      count: 1,
      resetTime: now + options.windowMs,
    })
    return {
      success: true,
      remaining: options.maxRequests - 1,
      resetTime: now + options.windowMs,
    }
  }

  if (entry.count >= options.maxRequests) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000)
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter,
    }
  }

  // Increment count
  entry.count++
  store.set(key, entry)

  return {
    success: true,
    remaining: options.maxRequests - entry.count,
    resetTime: entry.resetTime,
  }
}

/**
 * Get client identifier from request (IP address)
 */
export function getClientIdentifier(request: Request): string {
  // Try to get IP from various headers (for proxies/load balancers)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0]?.trim() || realIp || 'unknown'
  return ip
}

/**
 * Rate limit middleware for Next.js API routes
 * Returns a response with 429 status if rate limit is exceeded
 */
export function withRateLimit(
  handler: (request: Request) => Promise<Response>,
  options?: RateLimitOptions
) {
  return async (request: Request): Promise<Response> => {
    const identifier = getClientIdentifier(request)
    const result = checkRateLimit(identifier, options)

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: 'Too many requests',
          message: `Rate limit exceeded. Please try again in ${result.retryAfter} seconds.`,
          retryAfter: result.retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(result.retryAfter || 60),
            'X-RateLimit-Limit': String(options?.maxRequests || 100),
            'X-RateLimit-Remaining': String(result.remaining),
            'X-RateLimit-Reset': String(Math.ceil(result.resetTime / 1000)),
          },
        }
      )
    }

    // Add rate limit headers to successful responses
    const response = await handler(request)
    const headers = new Headers(response.headers)
    headers.set('X-RateLimit-Limit', String(options?.maxRequests || 100))
    headers.set('X-RateLimit-Remaining', String(result.remaining))
    headers.set('X-RateLimit-Reset', String(Math.ceil(result.resetTime / 1000)))

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  }
}

