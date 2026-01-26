import { EtherscanTransaction } from './etherscan-parser'

export type MomentType =
  | 'CONTRACT_DEPLOY'
  | 'GENESIS_MINT'
  | 'FIRST_SALE'
  | 'BIGGEST_SALE'
  | 'VOLUME_MILESTONE'
  | 'MINT_MILESTONE'

export interface ArtistMoment {
  id: string
  type: MomentType
  title: string
  description: string
  timestamp: number
  date: string
  txHash: string
  value?: number
  contractAddress?: string
  metadata?: Record<string, unknown>
}

export function detectMoments(transactions: EtherscanTransaction[]): ArtistMoment[] {
  const moments: ArtistMoment[] = []

  // Sort transactions by timestamp
  const sortedTxs = [...transactions].sort(
    (a, b) => parseInt(a.unixTimestamp) - parseInt(b.unixTimestamp)
  )

  // Detect Contract Deployments
  const contractDeployments = sortedTxs.filter(
    tx => tx.contractAddress && tx.contractAddress !== ''
  )
  contractDeployments.forEach((tx, index) => {
    moments.push({
      id: `contract-${tx.txhash}`,
      type: 'CONTRACT_DEPLOY',
      title: index === 0 ? 'First Contract Deployed' : `Contract Deployed #${index + 1}`,
      description: `Smart contract created at ${tx.contractAddress?.slice(0, 10)}...`,
      timestamp: parseInt(tx.unixTimestamp),
      date: tx.datetime,
      txHash: tx.txhash,
      contractAddress: tx.contractAddress,
    })
  })

  // Detect Genesis Mint (first mint transaction)
  const mintTxs = sortedTxs.filter(
    tx =>
      tx.method &&
      (tx.method.toLowerCase().includes('mint') ||
        tx.method.toLowerCase().includes('claim') ||
        tx.method === 'Mint' ||
        tx.method === 'safeMint')
  )

  if (mintTxs.length > 0) {
    const genesisMint = mintTxs[0]
    moments.push({
      id: `genesis-${genesisMint.txhash}`,
      type: 'GENESIS_MINT',
      title: 'Genesis Mint',
      description: 'Your first NFT drop - the beginning of your collection',
      timestamp: parseInt(genesisMint.unixTimestamp),
      date: genesisMint.datetime,
      txHash: genesisMint.txhash,
      value: parseFloat(genesisMint.value || '0'),
    })
  }

  // Detect First Sale
  const saleTxs = sortedTxs.filter(tx => {
    const value = parseFloat(tx.value || '0')
    return value > 0 && tx.method && !tx.method.toLowerCase().includes('mint')
  })

  if (saleTxs.length > 0) {
    const firstSale = saleTxs[0]
    moments.push({
      id: `first-sale-${firstSale.txhash}`,
      type: 'FIRST_SALE',
      title: 'First Sale',
      description: `Sold for ${parseFloat(firstSale.value).toFixed(4)} ETH`,
      timestamp: parseInt(firstSale.unixTimestamp),
      date: firstSale.datetime,
      txHash: firstSale.txhash,
      value: parseFloat(firstSale.value),
    })
  }

  // Detect Biggest Sale
  if (saleTxs.length > 0) {
    const biggestSale = saleTxs.reduce((max, tx) => {
      const currentValue = parseFloat(tx.value || '0')
      const maxValue = parseFloat(max.value || '0')
      return currentValue > maxValue ? tx : max
    })

    if (parseFloat(biggestSale.value) > 0) {
      moments.push({
        id: `biggest-sale-${biggestSale.txhash}`,
        type: 'BIGGEST_SALE',
        title: 'Biggest Sale',
        description: `Epic sale for ${parseFloat(biggestSale.value).toFixed(4)} ETH`,
        timestamp: parseInt(biggestSale.unixTimestamp),
        date: biggestSale.datetime,
        txHash: biggestSale.txhash,
        value: parseFloat(biggestSale.value),
      })
    }
  }

  // Detect Mint Milestones (100th, 500th, 1000th mint)
  const milestones = [100, 500, 1000, 5000, 10000]
  milestones.forEach(milestone => {
    if (mintTxs.length >= milestone) {
      const milestoneMint = mintTxs[milestone - 1]
      moments.push({
        id: `mint-${milestone}-${milestoneMint.txhash}`,
        type: 'MINT_MILESTONE',
        title: `${milestone}th Mint Milestone`,
        description: `Reached ${milestone} mints - your collection is growing!`,
        timestamp: parseInt(milestoneMint.unixTimestamp),
        date: milestoneMint.datetime,
        txHash: milestoneMint.txhash,
        metadata: { mintCount: milestone },
      })
    }
  })

  // Calculate volume milestones (1 ETH, 10 ETH, 100 ETH, etc.)
  let cumulativeVolume = 0
  const volumeMilestones = [1, 10, 50, 100, 500, 1000]
  const achievedVolumeMilestones = new Set<number>()

  sortedTxs.forEach(tx => {
    const value = parseFloat(tx.value || '0')
    cumulativeVolume += value

    volumeMilestones.forEach(milestone => {
      if (cumulativeVolume >= milestone && !achievedVolumeMilestones.has(milestone)) {
        achievedVolumeMilestones.add(milestone)
        moments.push({
          id: `volume-${milestone}-${tx.txhash}`,
          type: 'VOLUME_MILESTONE',
          title: `${milestone} ETH Volume Milestone`,
          description: `Total trading volume reached ${milestone} ETH`,
          timestamp: parseInt(tx.unixTimestamp),
          date: tx.datetime,
          txHash: tx.txhash,
          value: milestone,
          metadata: { totalVolume: cumulativeVolume },
        })
      }
    })
  })

  // Sort moments chronologically
  return moments.sort((a, b) => a.timestamp - b.timestamp)
}

export function getMomentIcon(type: MomentType): string {
  const icons: Record<MomentType, string> = {
    CONTRACT_DEPLOY: '🚀',
    GENESIS_MINT: '🎨',
    FIRST_SALE: '💵',
    BIGGEST_SALE: '💰',
    VOLUME_MILESTONE: '📊',
    MINT_MILESTONE: '🎮',
  }
  return icons[type]
}

export function getMomentColor(type: MomentType): string {
  const colors: Record<MomentType, string> = {
    CONTRACT_DEPLOY: 'purple',
    GENESIS_MINT: 'pink',
    FIRST_SALE: 'cyan',
    BIGGEST_SALE: 'pink',
    VOLUME_MILESTONE: 'purple',
    MINT_MILESTONE: 'cyan',
  }
  return colors[type]
}
