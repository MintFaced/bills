/**
 * Generate a random sprint ID for share cards
 * Format: 6 random alphanumeric characters (uppercase)
 * Example: "A3B7K9"
 */
export function generateSprintId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Format currency in NZD
 */
export function formatNZD(cents: number): string {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

/**
 * Format currency in NZD with decimals
 */
export function formatNZDWithCents(cents: number): string {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

/**
 * Calculate deposit amount based on LinkedIn discount
 */
export function getDepositAmount(hasLinkedInDiscount: boolean): number {
  return hasLinkedInDiscount
    ? parseInt(process.env.NEXT_PUBLIC_DEPOSIT_DISCOUNTED || '4900')
    : parseInt(process.env.NEXT_PUBLIC_DEPOSIT_FULL || '9900')
}

/**
 * Calculate success fee (10% of confirmed savings)
 */
export function calculateSuccessFee(confirmedSavingsCents: number): number {
  const feePercentage = parseInt(process.env.NEXT_PUBLIC_SUCCESS_FEE_PERCENTAGE || '10')
  return Math.floor((confirmedSavingsCents * feePercentage) / 100)
}

/**
 * Calculate refund/charge based on deposit and confirmed savings
 */
export function calculateTrueUp(depositCents: number, confirmedSavingsCents: number): {
  fee: number
  refund: number
  charge: number
  action: 'refund' | 'charge' | 'none'
} {
  const fee = calculateSuccessFee(confirmedSavingsCents)

  if (confirmedSavingsCents === 0) {
    // No savings = full refund
    return {
      fee: 0,
      refund: depositCents,
      charge: 0,
      action: 'refund',
    }
  }

  if (fee > depositCents) {
    // Fee exceeds deposit = charge the difference
    return {
      fee,
      refund: 0,
      charge: fee - depositCents,
      action: 'charge',
    }
  }

  if (fee < depositCents) {
    // Fee less than deposit = refund the difference
    return {
      fee,
      refund: depositCents - fee,
      charge: 0,
      action: 'refund',
    }
  }

  // Fee equals deposit = no action needed
  return {
    fee,
    refund: 0,
    charge: 0,
    action: 'none',
  }
}
