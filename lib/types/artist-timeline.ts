export type TimelineEventType =
  | 'mint'
  | 'sale'
  | 'contract_deploy'
  | 'transfer'
  | 'listing'
  | 'collection_launch'
  | 'airdrop'

export interface TimelineEvent {
  id: string
  type: TimelineEventType
  timestamp: string
  chain: string
  transactionHash: string
  title: string
  description: string
  details: MintEvent | SaleEvent | ContractDeployEvent | TransferEvent | ListingEvent | AirdropEvent
}

export interface MintEvent {
  tokenId: string
  contractAddress: string
  collectionName: string | null
  tokenName: string | null
  imageUrl: string | null
  quantity: number
}

export interface SaleEvent {
  tokenId: string
  contractAddress: string
  collectionName: string | null
  tokenName: string | null
  imageUrl: string | null
  priceEth: number
  priceUsd: number | null
  marketplace: string | null
  buyer: string
  seller: string
}

export interface ContractDeployEvent {
  contractAddress: string
  contractName: string | null
  contractType: string | null
  standard: string | null
}

export interface TransferEvent {
  tokenId: string
  contractAddress: string
  collectionName: string | null
  from: string
  to: string
}

export interface ListingEvent {
  tokenId: string
  contractAddress: string
  collectionName: string | null
  priceEth: number
  marketplace: string | null
}

export interface AirdropEvent {
  tokenId: string
  contractAddress: string
  collectionName: string | null
  recipients: number
}

export interface ArtistProfile {
  walletAddress: string
  ensName: string | null
  totalMints: number
  totalSales: number
  totalVolume: number
  contractsDeployed: number
  firstActivity: string
  lastActivity: string
  chains: string[]
}

export interface TimelineFilters {
  eventTypes: TimelineEventType[]
  chains: string[]
  dateRange: { start: string | null; end: string | null }
}

export const EVENT_TYPE_CONFIG: Record<TimelineEventType, { label: string; color: string; bgColor: string; borderColor: string }> = {
  mint: { label: 'Mint', color: 'text-lime-400', bgColor: 'bg-lime-500/10', borderColor: 'border-lime-500/30' },
  sale: { label: 'Sale', color: 'text-khaki-300', bgColor: 'bg-khaki-500/10', borderColor: 'border-khaki-500/30' },
  contract_deploy: { label: 'Contract Deploy', color: 'text-purple-400', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/30' },
  transfer: { label: 'Transfer', color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30' },
  listing: { label: 'Listing', color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30' },
  collection_launch: { label: 'Collection Launch', color: 'text-pink-400', bgColor: 'bg-pink-500/10', borderColor: 'border-pink-500/30' },
  airdrop: { label: 'Airdrop', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/30' },
}
