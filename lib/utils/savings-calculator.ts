import type { RecurringCharge } from './recurring-detector'

export type Aggressiveness = 'conservative' | 'balanced' | 'aggressive'

export interface SavingsOpportunity {
  vendorCharge: RecurringCharge
  category: string
  opportunities: {
    monthlyToAnnual?: {
      enabled: boolean
      savingsPercent: number
      annualSavings: number
    }
    retentionDiscount?: {
      enabled: boolean
      savingsPercent: number
      annualSavings: number
    }
    duplicate?: {
      enabled: boolean
      savingsPercent: number
      annualSavings: number
      duplicateOf: string
    }
  }
  totalAnnualSavings: number
}

/**
 * Calculate potential savings for a recurring charge
 */
export function calculatePotentialSavings(
  charge: RecurringCharge,
  category: string,
  aggressiveness: Aggressiveness,
  isDuplicate: boolean = false,
  duplicateOf?: string
): SavingsOpportunity {
  const baseAnnualCost = charge.baselineMonthly * 12

  // Aggressiveness multipliers
  const multipliers = {
    conservative: 0.7,
    balanced: 1.0,
    aggressive: 1.3,
  }

  const multiplier = multipliers[aggressiveness]

  const opportunities: SavingsOpportunity['opportunities'] = {}
  let totalSavings = 0

  // Monthly to Annual switch (10-20% savings)
  if (charge.frequencyType === 'monthly' && category !== 'telco' && category !== 'payments') {
    const savingsPercent = Math.min(20, 10 * multiplier)
    const annualSavings = baseAnnualCost * (savingsPercent / 100)

    opportunities.monthlyToAnnual = {
      enabled: true,
      savingsPercent: Math.round(savingsPercent),
      annualSavings: Math.round(annualSavings * 100) / 100,
    }

    totalSavings += annualSavings
  }

  // Retention discount (10-25% savings depending on category)
  if (category === 'marketing' || category === 'software') {
    let baseSavingsPercent = 15

    // Adjust based on category likelihood
    if (category === 'marketing') {
      baseSavingsPercent = 20 // Marketing tools often have retention offers
    }

    const savingsPercent = Math.min(25, baseSavingsPercent * multiplier)
    const annualSavings = baseAnnualCost * (savingsPercent / 100)

    opportunities.retentionDiscount = {
      enabled: true,
      savingsPercent: Math.round(savingsPercent),
      annualSavings: Math.round(annualSavings * 100) / 100,
    }

    totalSavings += annualSavings
  }

  // Duplicate tool (30-50% of one tool cost)
  if (isDuplicate && duplicateOf) {
    const savingsPercent = Math.min(50, 30 * multiplier)
    const annualSavings = baseAnnualCost * (savingsPercent / 100)

    opportunities.duplicate = {
      enabled: true,
      savingsPercent: Math.round(savingsPercent),
      annualSavings: Math.round(annualSavings * 100) / 100,
      duplicateOf,
    }

    totalSavings += annualSavings
  }

  return {
    vendorCharge: charge,
    category,
    opportunities,
    totalAnnualSavings: Math.round(totalSavings * 100) / 100,
  }
}

/**
 * Calculate total potential savings for all charges
 */
export function calculateTotalPotentialSavings(
  opportunities: SavingsOpportunity[]
): {
  totalAnnual: number
  totalMonthly: number
  breakdown: {
    monthlyToAnnual: number
    retentionDiscounts: number
    duplicates: number
  }
} {
  let totalAnnual = 0
  let monthlyToAnnual = 0
  let retentionDiscounts = 0
  let duplicates = 0

  for (const opp of opportunities) {
    totalAnnual += opp.totalAnnualSavings

    if (opp.opportunities.monthlyToAnnual) {
      monthlyToAnnual += opp.opportunities.monthlyToAnnual.annualSavings
    }

    if (opp.opportunities.retentionDiscount) {
      retentionDiscounts += opp.opportunities.retentionDiscount.annualSavings
    }

    if (opp.opportunities.duplicate) {
      duplicates += opp.opportunities.duplicate.annualSavings
    }
  }

  return {
    totalAnnual: Math.round(totalAnnual * 100) / 100,
    totalMonthly: Math.round((totalAnnual / 12) * 100) / 100,
    breakdown: {
      monthlyToAnnual: Math.round(monthlyToAnnual * 100) / 100,
      retentionDiscounts: Math.round(retentionDiscounts * 100) / 100,
      duplicates: Math.round(duplicates * 100) / 100,
    },
  }
}

/**
 * Get top N saving opportunities sorted by potential savings
 */
export function getTopOpportunities(opportunities: SavingsOpportunity[], n: number = 3): SavingsOpportunity[] {
  return [...opportunities].sort((a, b) => b.totalAnnualSavings - a.totalAnnualSavings).slice(0, n)
}

/**
 * Calculate confirmed savings from CSV comparison
 * Compare baseline charges with new charges after actions taken
 */
export function calculateConfirmedSavings(
  baselineCharges: RecurringCharge[],
  newCharges: RecurringCharge[],
  actions: Array<{
    merchantCandidate: string
    actionType: 'cancel' | 'negotiate' | 'annual_switch'
    outcome: string
    newPrice?: number
  }>
): {
  confirmedAnnual: number
  breakdown: {
    cancelled: { count: number; savings: number }
    negotiated: { count: number; savings: number }
    annualSwitch: { count: number; savings: number }
  }
} {
  let totalSavings = 0
  const breakdown = {
    cancelled: { count: 0, savings: 0 },
    negotiated: { count: 0, savings: 0 },
    annualSwitch: { count: 0, savings: 0 },
  }

  for (const action of actions) {
    const baselineCharge = baselineCharges.find((c) => c.merchantCandidate === action.merchantCandidate)
    if (!baselineCharge) continue

    const baselineAnnual = baselineCharge.baselineMonthly * 12

    if (action.actionType === 'cancel' && action.outcome === 'cancelled') {
      // Check if vendor is missing from new charges
      const stillExists = newCharges.some((c) => c.merchantCandidate === action.merchantCandidate)
      if (!stillExists) {
        breakdown.cancelled.count++
        breakdown.cancelled.savings += baselineAnnual
        totalSavings += baselineAnnual
      }
    }

    if (action.actionType === 'negotiate' && action.outcome === 'accepted' && action.newPrice) {
      const newCharge = newCharges.find((c) => c.merchantCandidate === action.merchantCandidate)
      if (newCharge && newCharge.baselineMonthly < baselineCharge.baselineMonthly) {
        const savings = (baselineCharge.baselineMonthly - newCharge.baselineMonthly) * 12
        breakdown.negotiated.count++
        breakdown.negotiated.savings += savings
        totalSavings += savings
      }
    }

    if (action.actionType === 'annual_switch') {
      const newCharge = newCharges.find((c) => c.merchantCandidate === action.merchantCandidate)
      if (
        newCharge &&
        newCharge.frequencyType === 'annual' &&
        baselineCharge.frequencyType === 'monthly'
      ) {
        // Estimate 15% savings for annual switch
        const savings = baselineAnnual * 0.15
        breakdown.annualSwitch.count++
        breakdown.annualSwitch.savings += savings
        totalSavings += savings
      }
    }
  }

  return {
    confirmedAnnual: Math.round(totalSavings * 100) / 100,
    breakdown: {
      cancelled: {
        count: breakdown.cancelled.count,
        savings: Math.round(breakdown.cancelled.savings * 100) / 100,
      },
      negotiated: {
        count: breakdown.negotiated.count,
        savings: Math.round(breakdown.negotiated.savings * 100) / 100,
      },
      annualSwitch: {
        count: breakdown.annualSwitch.count,
        savings: Math.round(breakdown.annualSwitch.savings * 100) / 100,
      },
    },
  }
}
