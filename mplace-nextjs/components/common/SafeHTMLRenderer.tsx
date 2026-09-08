"use client"

import React from 'react'
import { sanitizeHtml } from '@/lib/security'

interface SafeHTMLRendererProps {
  html: string
  className?: string
  allowedTags?: string[]
  allowedAttributes?: string[]
}

/**
 * Safe HTML Renderer Component
 * 
 * Renders HTML content safely by:
 * 1. Sanitizing the HTML to remove dangerous content
 * 2. Parsing and converting HTML to React elements
 * 3. Avoiding dangerouslySetInnerHTML anti-pattern
 * 
 * This component provides a safer alternative to dangerouslySetInnerHTML
 * by parsing HTML and rendering it as React elements.
 */
export default function SafeHTMLRenderer({
  html,
  className,
  allowedTags = ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre'],
  allowedAttributes = ['href', 'src', 'alt', 'title', 'target', 'rel'],
}: SafeHTMLRendererProps) {
  if (!html || typeof html !== 'string') {
    return null
  }

  // Sanitize HTML first
  const sanitized = sanitizeHtml(html)

  // Parse HTML and convert to React elements
  const parseHTML = (htmlString: string): React.ReactNode[] => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlString, 'text/html')
    const body = doc.body

    const parseNode = (node: Node): React.ReactNode | null => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim()
        return text ? text : null
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element
        const tagName = element.tagName.toLowerCase()

        // Only allow safe tags
        if (!allowedTags.includes(tagName)) {
          // Return text content for disallowed tags
          return element.textContent
        }

        const children: React.ReactNode[] = []
        Array.from(element.childNodes).forEach((child) => {
          const parsed = parseNode(child)
          if (parsed !== null) {
            children.push(parsed)
          }
        })

        // Build props for the element
        const props: Record<string, any> = {}
        
        // Only allow safe attributes
        allowedAttributes.forEach((attr) => {
          const value = element.getAttribute(attr)
          if (value) {
            // Special handling for certain attributes
            if (attr === 'target' && value === '_blank') {
              props.target = '_blank'
              props.rel = 'noopener noreferrer'
            } else if (attr === 'href' || attr === 'src') {
              // Validate URLs
              if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')) {
                props[attr] = value
              }
            } else {
              props[attr] = value
            }
          }
        })

        // Handle specific tags
        switch (tagName) {
          case 'p':
            return React.createElement('p', { key: Math.random(), ...props }, ...children)
          case 'br':
            return React.createElement('br', { key: Math.random() })
          case 'strong':
          case 'b':
            return React.createElement('strong', { key: Math.random(), ...props }, ...children)
          case 'em':
          case 'i':
            return React.createElement('em', { key: Math.random(), ...props }, ...children)
          case 'u':
            return React.createElement('u', { key: Math.random(), ...props }, ...children)
          case 'h1':
            return React.createElement('h1', { key: Math.random(), ...props }, ...children)
          case 'h2':
            return React.createElement('h2', { key: Math.random(), ...props }, ...children)
          case 'h3':
            return React.createElement('h3', { key: Math.random(), ...props }, ...children)
          case 'h4':
            return React.createElement('h4', { key: Math.random(), ...props }, ...children)
          case 'h5':
            return React.createElement('h5', { key: Math.random(), ...props }, ...children)
          case 'h6':
            return React.createElement('h6', { key: Math.random(), ...props }, ...children)
          case 'ul':
            return React.createElement('ul', { key: Math.random(), ...props }, ...children)
          case 'ol':
            return React.createElement('ol', { key: Math.random(), ...props }, ...children)
          case 'li':
            return React.createElement('li', { key: Math.random(), ...props }, ...children)
          case 'a':
            return React.createElement('a', { key: Math.random(), ...props }, ...children)
          case 'img':
            return React.createElement('img', { key: Math.random(), ...props })
          case 'blockquote':
            return React.createElement('blockquote', { key: Math.random(), ...props }, ...children)
          case 'code':
            return React.createElement('code', { key: Math.random(), ...props }, ...children)
          case 'pre':
            return React.createElement('pre', { key: Math.random(), ...props }, ...children)
          default:
            // Fallback: return text content
            return element.textContent
        }
      }

      return null
    }

    const result: React.ReactNode[] = []
    Array.from(body.childNodes).forEach((child) => {
      const parsed = parseNode(child)
      if (parsed !== null) {
        result.push(parsed)
      }
    })

    return result
  }

  try {
    const parsedContent = parseHTML(sanitized)
    
    if (!parsedContent || parsedContent.length === 0) {
      return null
    }

    return (
      <div className={className}>
        {parsedContent}
      </div>
    )
  } catch (error) {
    // Fallback: return sanitized text if parsing fails
    console.error('Error parsing HTML:', error)
    return (
      <div className={className}>
        {sanitized.replace(/<[^>]*>/g, '')}
      </div>
    )
  }
}

