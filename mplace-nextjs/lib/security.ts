/**
 * Security utilities for input sanitization and validation
 */

/**
 * Sanitize HTML content to prevent XSS attacks
 * Removes dangerous tags and attributes while preserving safe formatting
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') {
    return ''
  }

  // Remove script tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  
  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '')
  
  // Remove javascript: and data: URLs
  sanitized = sanitized.replace(/javascript:/gi, '')
  sanitized = sanitized.replace(/data:text\/html/gi, '')
  
  // Remove iframe tags
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
  
  // Remove object and embed tags
  sanitized = sanitized.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
  sanitized = sanitized.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
  
  return sanitized
}

/**
 * Sanitize user input string
 * Removes potentially dangerous characters and trims whitespace
 */
export function sanitizeInput(input: string | null | undefined): string {
  if (!input || typeof input !== 'string') {
    return ''
  }
  
  // Trim whitespace
  let sanitized = input.trim()
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '')
  
  // Remove control characters except newlines and tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')
  
  return sanitized
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false
  }
  
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

/**
 * Sanitize and validate string length
 */
export function sanitizeAndValidateLength(
  input: string | null | undefined,
  maxLength: number,
  minLength: number = 0
): { valid: boolean; sanitized: string; error?: string } {
  const sanitized = sanitizeInput(input)
  
  if (sanitized.length < minLength) {
    return {
      valid: false,
      sanitized,
      error: `Input must be at least ${minLength} characters`,
    }
  }
  
  if (sanitized.length > maxLength) {
    return {
      valid: false,
      sanitized,
      error: `Input must be no more than ${maxLength} characters`,
    }
  }
  
  return { valid: true, sanitized }
}

/**
 * Validate and sanitize numeric input
 */
export function sanitizeNumber(
  input: string | number | null | undefined,
  min?: number,
  max?: number
): { valid: boolean; value?: number; error?: string } {
  if (input === null || input === undefined) {
    return { valid: false, error: 'Number is required' }
  }
  
  const num = typeof input === 'string' ? parseFloat(input) : input
  
  if (isNaN(num) || !isFinite(num)) {
    return { valid: false, error: 'Invalid number' }
  }
  
  if (min !== undefined && num < min) {
    return { valid: false, error: `Number must be at least ${min}` }
  }
  
  if (max !== undefined && num > max) {
    return { valid: false, error: `Number must be at most ${max}` }
  }
  
  return { valid: true, value: num }
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(text: string): string {
  if (!text || typeof text !== 'string') {
    return ''
  }
  
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  
  return text.replace(/[&<>"']/g, (char) => map[char])
}

