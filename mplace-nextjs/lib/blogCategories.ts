// Shared category keywords and matching logic for blogs
// Keywords are matched in title and excerpt (always), and content (only for multi-word phrases)
// Expanded keywords to match more relevant blogs
export const categoryKeywords: Record<string, string[]> = {
  "Wordpress": ["wordpress", "wp plugin", "wordpress plugin", "wordpress theme", "wp"],
  "Support Center": [
    "customer support", "support center", "help center", "support guide", 
    "support best practices", "support tutorial", "support", "help", "faq"
  ],
  "General Topics": [
    "general topic", "general guide", "general tips", "general advice",
    "web design", "design", "marketing", "e-commerce", "ecommerce", 
    "marketplace", "business", "online business"
  ],
  "Pre-Sales": [
    "pre-sale", "presale", "before purchase", "pre-purchase", "pre sale",
    "before buying", "pre sale"
  ],
  "Purchases": [
    "purchase process", "buying guide", "how to buy", "order process", 
    "purchase guide", "purchase", "buying", "checkout", "order"
  ],
  "Billing": [
    "billing system", "invoice", "payment processing", "refund policy", 
    "billing guide", "billing", "payment", "payment gateway", "refund", 
    "transaction", "invoice"
  ],
  "Testimonials": [
    "testimonial", "customer review", "user feedback", "client testimonial", 
    "user review", "review", "feedback", "rating", "testimonials"
  ],
}

/**
 * Check if a blog matches a category using the same logic for counting and searching
 */
export function blogMatchesCategory(
  title: string,
  excerpt: string,
  content: string,
  categoryName: string
): boolean {
  const keywords = categoryKeywords[categoryName] || []
  if (keywords.length === 0) return false

  const titleLower = title.toLowerCase()
  const excerptLower = excerpt.toLowerCase()
  const contentLower = content.toLowerCase()

  // Check if any keyword matches
  return keywords.some((keyword) => {
    const lowerKeyword = keyword.toLowerCase()
    
    // Check title and excerpt first (more reliable)
    const titleMatch = titleLower.includes(lowerKeyword)
    const excerptMatch = excerptLower.includes(lowerKeyword)
    
    if (titleMatch || excerptMatch) {
      return true
    }
    
    // For content, only match if it's a multi-word phrase (more specific)
    if (keyword.split(' ').length > 1 && contentLower.includes(lowerKeyword)) {
      return true
    }
    
    return false
  })
}

/**
 * Build Prisma where clause for category search
 * This must match the exact logic of blogMatchesCategory
 */
export function buildCategoryWhereClause(categoryName: string) {
  const keywords = categoryKeywords[categoryName] || []
  if (keywords.length === 0) {
    return {}
  }

  // Build OR conditions for each keyword
  // Each keyword should match: (title OR excerpt) OR (content if multi-word)
  // This matches the exact logic in blogMatchesCategory
  const orConditions: Array<{ title?: { contains: string; mode: "insensitive" }; excerpt?: { contains: string; mode: "insensitive" }; content?: { contains: string; mode: "insensitive" } }> = []
  
  keywords.forEach((keyword) => {
    const isMultiWord = keyword.split(' ').length > 1
    
    // For each keyword, create conditions that match blogMatchesCategory logic:
    // 1. Title match
    orConditions.push({ title: { contains: keyword, mode: "insensitive" as const } })
    
    // 2. Excerpt match
    orConditions.push({ excerpt: { contains: keyword, mode: "insensitive" as const } })
    
    // 3. Content match (only if multi-word)
    if (isMultiWord) {
      orConditions.push({ content: { contains: keyword, mode: "insensitive" as const } })
    }
  })

  // Return OR of all conditions: any keyword can match in title/excerpt/content (if multi-word)
  return { OR: orConditions }
}

