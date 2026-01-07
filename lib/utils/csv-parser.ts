import Papa from 'papaparse'

export interface CSVRow {
  [key: string]: string
}

export interface ParsedTransaction {
  date: Date | null
  description: string
  amount: number
  balance?: number
  transactionType?: 'debit' | 'credit'
}

export interface ColumnMapping {
  date: string
  description: string
  amount?: string
  debit?: string
  credit?: string
  balance?: string
}

export interface DetectedBank {
  name: string
  confidence: number
  suggestedMapping: ColumnMapping
}

/**
 * Parse CSV file and return rows
 */
export async function parseCSVFile(file: File): Promise<CSVRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`CSV parsing failed: ${results.errors[0].message}`))
        } else {
          resolve(results.data)
        }
      },
      error: (error) => {
        reject(error)
      },
    })
  })
}

/**
 * Detect bank from CSV headers and data
 */
export function detectBank(headers: string[], rows: CSVRow[]): DetectedBank {
  const headerLower = headers.map((h) => h.toLowerCase().trim())

  // ANZ Bank detection
  if (
    headerLower.some((h) => h.includes('transaction date') || h === 'date') &&
    headerLower.some((h) => h.includes('payee') || h.includes('particulars'))
  ) {
    return {
      name: 'ANZ',
      confidence: 0.9,
      suggestedMapping: {
        date: headers.find((h) => h.toLowerCase().includes('date')) || headers[0],
        description:
          headers.find((h) => h.toLowerCase().includes('payee') || h.toLowerCase().includes('particulars')) ||
          headers[1],
        debit: headers.find((h) => h.toLowerCase().includes('debit')),
        credit: headers.find((h) => h.toLowerCase().includes('credit')),
        balance: headers.find((h) => h.toLowerCase().includes('balance')),
      },
    }
  }

  // BNZ Bank detection
  if (
    headerLower.some((h) => h.includes('date')) &&
    (headerLower.some((h) => h.includes('merchant') || h.includes('narrative')) ||
      headerLower.some((h) => h.includes('memo')))
  ) {
    return {
      name: 'BNZ',
      confidence: 0.9,
      suggestedMapping: {
        date: headers.find((h) => h.toLowerCase().includes('date')) || headers[0],
        description:
          headers.find(
            (h) =>
              h.toLowerCase().includes('merchant') ||
              h.toLowerCase().includes('narrative') ||
              h.toLowerCase().includes('memo')
          ) || headers[1],
        debit: headers.find((h) => h.toLowerCase().includes('debit') || h.toLowerCase().includes('withdrawal')),
        credit: headers.find((h) => h.toLowerCase().includes('credit') || h.toLowerCase().includes('deposit')),
        balance: headers.find((h) => h.toLowerCase().includes('balance')),
      },
    }
  }

  // SBS Bank detection
  if (headerLower.some((h) => h.includes('date')) && headerLower.some((h) => h.includes('description'))) {
    return {
      name: 'SBS',
      confidence: 0.85,
      suggestedMapping: {
        date: headers.find((h) => h.toLowerCase().includes('date')) || headers[0],
        description: headers.find((h) => h.toLowerCase().includes('description')) || headers[1],
        amount: headers.find((h) => h.toLowerCase().includes('amount') && !h.toLowerCase().includes('balance')),
        balance: headers.find((h) => h.toLowerCase().includes('balance')),
      },
    }
  }

  // Generic fallback
  return {
    name: 'Unknown',
    confidence: 0.5,
    suggestedMapping: {
      date: headers[0],
      description: headers[1],
      amount: headers.find((h) => h.toLowerCase().includes('amount')),
      debit: headers.find((h) => h.toLowerCase().includes('debit')),
      credit: headers.find((h) => h.toLowerCase().includes('credit')),
      balance: headers.find((h) => h.toLowerCase().includes('balance')),
    },
  }
}

/**
 * Parse date from various NZ formats
 */
export function parseNZDate(dateStr: string): Date | null {
  if (!dateStr) return null

  // Try ISO format first
  let date = new Date(dateStr)
  if (!isNaN(date.getTime())) return date

  // Try DD/MM/YYYY
  const ddmmyyyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy
    date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    if (!isNaN(date.getTime())) return date
  }

  // Try DD-MM-YYYY
  const ddmmyyyyDash = dateStr.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/)
  if (ddmmyyyyDash) {
    const [, day, month, year] = ddmmyyyyDash
    date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    if (!isNaN(date.getTime())) return date
  }

  return null
}

/**
 * Parse amount from string (handles negative, parentheses, currency symbols)
 */
export function parseAmount(amountStr: string): number {
  if (!amountStr) return 0

  // Remove currency symbols, spaces, commas
  let cleaned = amountStr.replace(/[$,\s]/g, '')

  // Handle parentheses as negative
  if (cleaned.startsWith('(') && cleaned.endsWith(')')) {
    cleaned = '-' + cleaned.slice(1, -1)
  }

  const amount = parseFloat(cleaned)
  return isNaN(amount) ? 0 : Math.abs(amount) // Always return positive for our purposes
}

/**
 * Normalize transactions from CSV rows using column mapping
 */
export function normalizeTransactions(rows: CSVRow[], mapping: ColumnMapping): ParsedTransaction[] {
  return rows
    .map((row) => {
      const date = parseNZDate(row[mapping.date])
      if (!date) return null // Skip rows without valid date

      const description = row[mapping.description] || ''
      if (!description.trim()) return null // Skip rows without description

      let amount = 0
      let transactionType: 'debit' | 'credit' | undefined

      // Handle separate debit/credit columns
      if (mapping.debit && mapping.credit) {
        const debit = parseAmount(row[mapping.debit])
        const credit = parseAmount(row[mapping.credit])

        if (debit > 0) {
          amount = debit
          transactionType = 'debit'
        } else if (credit > 0) {
          amount = credit
          transactionType = 'credit'
        } else {
          return null // Skip rows with no amount
        }
      }
      // Handle single amount column
      else if (mapping.amount) {
        amount = parseAmount(row[mapping.amount])
        if (amount === 0) return null
        // Detect debit/credit by sign (negative = debit in most systems)
        const rawAmount = row[mapping.amount].replace(/[$,\s]/g, '')
        transactionType = rawAmount.startsWith('-') || rawAmount.startsWith('(') ? 'debit' : 'credit'
      } else {
        return null // No amount column found
      }

      const balance = mapping.balance ? parseAmount(row[mapping.balance]) : undefined

      return {
        date,
        description: description.trim(),
        amount,
        balance,
        transactionType,
      }
    })
    .filter((t): t is ParsedTransaction => t !== null)
}

/**
 * Get CSV headers from file
 */
export async function getCSVHeaders(file: File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      preview: 1,
      complete: (results) => {
        if (results.meta.fields) {
          resolve(results.meta.fields)
        } else {
          reject(new Error('No headers found in CSV'))
        }
      },
      error: reject,
    })
  })
}
