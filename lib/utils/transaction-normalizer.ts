/**
 * Normalize transaction description for matching
 * - Convert to uppercase
 * - Remove special characters
 * - Normalize whitespace
 */
export function normalizeDescription(description: string): string {
  return description
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Extract merchant candidate from transaction description
 * Uses common patterns found in NZ bank statements
 */
export function extractMerchant(description: string): string {
  const normalized = normalizeDescription(description)

  // Remove common prefixes
  const prefixes = [
    'EFTPOS',
    'DEBIT',
    'CREDIT',
    'PAYMENT',
    'DD',
    'DIRECT DEBIT',
    'AUTO PAYMENT',
    'AP',
    'VISA',
    'MASTERCARD',
    'INTERNET BANKING',
    'IB',
    'POS',
  ]

  let cleaned = normalized
  for (const prefix of prefixes) {
    cleaned = cleaned.replace(new RegExp(`^${prefix}\\s+`, 'i'), '')
  }

  // Extract first meaningful token (usually merchant name)
  const tokens = cleaned.split(/\s+/).filter((t) => t.length > 2)

  if (tokens.length === 0) return cleaned

  // For known SaaS patterns, keep first 1-2 tokens
  const firstToken = tokens[0]

  // Known patterns
  if (firstToken.includes('*')) {
    // e.g., "SHOPIFY*STORENAME" -> "SHOPIFY"
    return firstToken.split('*')[0]
  }

  if (tokens.length > 1 && tokens[0].length < 5 && tokens[1].length > 3) {
    // e.g., "WWW SPOTIFY COM" -> "SPOTIFY"
    return tokens[1]
  }

  return firstToken
}

/**
 * Clean and standardize merchant names for better matching
 */
export function standardizeMerchant(merchant: string): string {
  const cleaned = normalizeDescription(merchant)

  // Remove common suffixes
  const suffixes = [
    'NZ',
    'LTD',
    'LIMITED',
    'INC',
    'CORP',
    'CO',
    'COM',
    'NET',
    'ORG',
    'WWW',
    'HTTP',
    'HTTPS',
  ]

  let standardized = cleaned
  for (const suffix of suffixes) {
    standardized = standardized.replace(new RegExp(`\\s${suffix}$`, 'i'), '')
  }

  return standardized.trim()
}
