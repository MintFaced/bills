import { differenceInDays } from 'date-fns'

export interface RecurringCharge {
  merchantCandidate: string
  transactions: Array<{
    id: string
    date: Date
    amount: number
    description: string
  }>
  frequencyType: 'weekly' | 'fortnightly' | 'monthly' | 'annual' | 'irregular'
  frequencyDays: number
  baselineMonthly: number
  confidenceScore: number
  lastChargeDate: Date
}

/**
 * Detect recurring charges from normalized transactions
 */
export function detectRecurringCharges(
  transactions: Array<{
    id: string
    date: Date
    amount: number
    merchantCandidate: string
    description: string
  }>
): RecurringCharge[] {
  // Group by merchant
  const grouped = new Map<string, typeof transactions>()

  for (const transaction of transactions) {
    const merchant = transaction.merchantCandidate
    if (!grouped.has(merchant)) {
      grouped.set(merchant, [])
    }
    grouped.get(merchant)!.push(transaction)
  }

  const recurring: RecurringCharge[] = []

  // Analyze each merchant's transactions
  for (const [merchant, txns] of grouped.entries()) {
    // Need at least 2 transactions to detect recurrence
    if (txns.length < 2) continue

    // Sort by date
    const sorted = [...txns].sort((a, b) => a.date.getTime() - b.date.getTime())

    // Calculate intervals between transactions
    const intervals: number[] = []
    for (let i = 1; i < sorted.length; i++) {
      intervals.push(differenceInDays(sorted[i].date, sorted[i - 1].date))
    }

    // Calculate average interval
    const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length

    // Calculate standard deviation to measure regularity
    const variance = intervals.reduce((sum, val) => sum + Math.pow(val - avgInterval, 2), 0) / intervals.length
    const stdDev = Math.sqrt(variance)

    // Determine frequency type
    let frequencyType: RecurringCharge['frequencyType'] = 'irregular'
    if (avgInterval >= 7 - 2 && avgInterval <= 7 + 2) {
      frequencyType = 'weekly'
    } else if (avgInterval >= 14 - 3 && avgInterval <= 14 + 3) {
      frequencyType = 'fortnightly'
    } else if (avgInterval >= 28 && avgInterval <= 35) {
      frequencyType = 'monthly'
    } else if (avgInterval >= 330 && avgInterval <= 400) {
      frequencyType = 'annual'
    }

    // Calculate baseline monthly cost
    const recentTransactions = sorted.slice(-3) // Last 3 transactions
    const avgAmount = recentTransactions.reduce((sum, t) => sum + t.amount, 0) / recentTransactions.length

    let baselineMonthly = avgAmount
    if (frequencyType === 'weekly') {
      baselineMonthly = avgAmount * 4.33 // ~4.33 weeks per month
    } else if (frequencyType === 'fortnightly') {
      baselineMonthly = avgAmount * 2.17 // ~2.17 fortnights per month
    } else if (frequencyType === 'annual') {
      baselineMonthly = avgAmount / 12
    }

    // Calculate confidence score (0.0 to 1.0)
    let confidenceScore = 0

    // Factor 1: Regularity (lower stdDev = higher confidence)
    const regularityScore = Math.max(0, 1 - stdDev / avgInterval)
    confidenceScore += regularityScore * 0.4

    // Factor 2: Number of occurrences (more = higher confidence)
    const occurrenceScore = Math.min(1, sorted.length / 6) // Max out at 6 occurrences
    confidenceScore += occurrenceScore * 0.3

    // Factor 3: Amount consistency
    const amounts = sorted.map((t) => t.amount)
    const amountAvg = amounts.reduce((sum, val) => sum + val, 0) / amounts.length
    const amountVariance = amounts.reduce((sum, val) => sum + Math.pow(val - amountAvg, 2), 0) / amounts.length
    const amountStdDev = Math.sqrt(amountVariance)
    const amountConsistency = Math.max(0, 1 - amountStdDev / amountAvg)
    confidenceScore += amountConsistency * 0.3

    // Only include if confidence > 0.3 and frequency is not irregular
    if (confidenceScore > 0.3 && frequencyType !== 'irregular') {
      recurring.push({
        merchantCandidate: merchant,
        transactions: sorted.map((t) => ({
          id: t.id,
          date: t.date,
          amount: t.amount,
          description: t.description,
        })),
        frequencyType,
        frequencyDays: Math.round(avgInterval),
        baselineMonthly: Math.round(baselineMonthly * 100) / 100,
        confidenceScore: Math.round(confidenceScore * 100) / 100,
        lastChargeDate: sorted[sorted.length - 1].date,
      })
    }
  }

  // Sort by baseline monthly cost (highest first)
  return recurring.sort((a, b) => b.baselineMonthly - a.baselineMonthly)
}

/**
 * Detect duplicate/redundant subscriptions
 */
export function detectDuplicates(
  charges: RecurringCharge[],
  categoryMap: Map<string, string>
): Array<{ charge: RecurringCharge; duplicateOf: RecurringCharge; reason: string }> {
  const duplicates: Array<{ charge: RecurringCharge; duplicateOf: RecurringCharge; reason: string }> = []

  // Group by category
  const byCategory = new Map<string, RecurringCharge[]>()
  for (const charge of charges) {
    const category = categoryMap.get(charge.merchantCandidate) || 'other'
    if (!byCategory.has(category)) {
      byCategory.set(category, [])
    }
    byCategory.get(category)!.push(charge)
  }

  // Check for duplicates within each category
  for (const [category, categoryCharges] of byCategory.entries()) {
    if (categoryCharges.length < 2) continue

    // Known duplicate patterns
    const duplicatePatterns = [
      { tools: ['DROPBOX', 'ICLOUD', 'ONEDRIVE', 'GOOGLE DRIVE'], category: 'storage' },
      { tools: ['ZOOM', 'TEAMS', 'GOOGLE MEET', 'SKYPE'], category: 'meetings' },
      { tools: ['MAILCHIMP', 'SENDGRID', 'CONSTANTCONTACT'], category: 'email_marketing' },
      { tools: ['CANVA', 'ADOBE', 'FIGMA'], category: 'design' },
    ]

    for (const pattern of duplicatePatterns) {
      const matches = categoryCharges.filter((c) =>
        pattern.tools.some((tool) => c.merchantCandidate.includes(tool))
      )

      if (matches.length > 1) {
        // Sort by cost (highest first)
        matches.sort((a, b) => b.baselineMonthly - a.baselineMonthly)

        // Mark all but the first as duplicates
        for (let i = 1; i < matches.length; i++) {
          duplicates.push({
            charge: matches[i],
            duplicateOf: matches[0],
            reason: `Likely duplicate ${pattern.category} tool`,
          })
        }
      }
    }
  }

  return duplicates
}
