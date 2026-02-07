'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { DEMO_ARTIST, DEMO_TIMELINE_EVENTS } from '@/lib/data/demo-timeline'
import type { TimelineEvent, TimelineEventType, ArtistProfile, TimelineFilters } from '@/lib/types/artist-timeline'
import { EVENT_TYPE_CONFIG } from '@/lib/types/artist-timeline'

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function formatDate(timestamp: string): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatDateTime(timestamp: string): string {
  return new Date(timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getYear(timestamp: string): number {
  return new Date(timestamp).getFullYear()
}

// --- Sub-components ---

function ArtistProfileCard({ profile }: { profile: ArtistProfile }) {
  return (
    <div className="rounded-xl border border-army-green-800 bg-army-green-950 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {profile.ensName ?? shortenAddress(profile.walletAddress)}
          </h2>
          <p className="mt-1 font-mono text-sm text-khaki-500">
            {profile.walletAddress}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {profile.chains.map((chain) => (
              <span
                key={chain}
                className="rounded-full bg-army-green-800 px-3 py-0.5 text-xs font-medium capitalize text-khaki-300"
              >
                {chain}
              </span>
            ))}
          </div>
        </div>
        <div className="text-sm text-khaki-400">
          Active since {formatDate(profile.firstActivity)}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatBox label="Total Mints" value={profile.totalMints.toLocaleString()} />
        <StatBox label="Total Sales" value={profile.totalSales.toLocaleString()} />
        <StatBox label="Volume" value={`${profile.totalVolume.toLocaleString()} ETH`} />
        <StatBox label="Contracts" value={profile.contractsDeployed.toLocaleString()} />
      </div>
    </div>
  )
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-army-green-800 bg-background p-3 text-center">
      <div className="text-xl font-bold text-lime-500">{value}</div>
      <div className="mt-1 text-xs text-khaki-500">{label}</div>
    </div>
  )
}

function FilterBar({
  filters,
  onFiltersChange,
  availableChains,
}: {
  filters: TimelineFilters
  onFiltersChange: (filters: TimelineFilters) => void
  availableChains: string[]
}) {
  const allTypes: TimelineEventType[] = [
    'mint', 'sale', 'contract_deploy', 'transfer', 'listing', 'collection_launch', 'airdrop',
  ]

  function toggleEventType(type: TimelineEventType) {
    const current = filters.eventTypes
    const next = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type]
    onFiltersChange({ ...filters, eventTypes: next })
  }

  function toggleChain(chain: string) {
    const current = filters.chains
    const next = current.includes(chain)
      ? current.filter((c) => c !== chain)
      : [...current, chain]
    onFiltersChange({ ...filters, chains: next })
  }

  return (
    <div className="rounded-xl border border-army-green-800 bg-army-green-950 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-8">
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-khaki-500">
            Event Types
          </div>
          <div className="flex flex-wrap gap-2">
            {allTypes.map((type) => {
              const config = EVENT_TYPE_CONFIG[type]
              const active = filters.eventTypes.length === 0 || filters.eventTypes.includes(type)
              return (
                <button
                  key={type}
                  onClick={() => toggleEventType(type)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                    active
                      ? `${config.bgColor} ${config.borderColor} ${config.color}`
                      : 'border-army-green-700 text-khaki-600 opacity-50'
                  }`}
                >
                  {config.label}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-khaki-500">
            Chains
          </div>
          <div className="flex flex-wrap gap-2">
            {availableChains.map((chain) => {
              const active = filters.chains.length === 0 || filters.chains.includes(chain)
              return (
                <button
                  key={chain}
                  onClick={() => toggleChain(chain)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium capitalize transition-all ${
                    active
                      ? 'border-lime-500/30 bg-lime-500/10 text-lime-400'
                      : 'border-army-green-700 text-khaki-600 opacity-50'
                  }`}
                >
                  {chain}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function TimelineEventCard({ event }: { event: TimelineEvent }) {
  const config = EVENT_TYPE_CONFIG[event.type]
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="group relative flex gap-4 pb-8 last:pb-0">
      {/* Timeline line */}
      <div className="relative flex flex-col items-center">
        <div
          className={`z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${config.borderColor} ${config.bgColor}`}
        >
          <EventIcon type={event.type} />
        </div>
        <div className="absolute top-10 h-full w-px bg-army-green-700 group-last:hidden" />
      </div>

      {/* Event content */}
      <div
        className={`flex-1 rounded-lg border ${config.borderColor} ${config.bgColor} p-4 transition-all hover:border-opacity-60`}
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <span
              className={`inline-block rounded-full ${config.bgColor} border ${config.borderColor} px-2 py-0.5 text-xs font-medium ${config.color}`}
            >
              {config.label}
            </span>
            <span className="ml-2 rounded-full bg-army-green-800 px-2 py-0.5 text-xs capitalize text-khaki-400">
              {event.chain}
            </span>
          </div>
          <time className="text-xs text-khaki-500">{formatDateTime(event.timestamp)}</time>
        </div>

        <h3 className="mt-2 text-lg font-semibold text-foreground">{event.title}</h3>
        <p className="mt-1 text-sm text-khaki-400">{event.description}</p>

        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-xs text-lime-500 hover:text-lime-400"
        >
          {expanded ? 'Hide details' : 'Show details'}
        </button>

        {expanded && (
          <div className="mt-3 rounded-lg border border-army-green-700 bg-background/50 p-3">
            <EventDetails event={event} />
          </div>
        )}
      </div>
    </div>
  )
}

function EventIcon({ type }: { type: TimelineEventType }) {
  const iconClass = `h-5 w-5 ${EVENT_TYPE_CONFIG[type].color}`

  switch (type) {
    case 'mint':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
        </svg>
      )
    case 'sale':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      )
    case 'contract_deploy':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
        </svg>
      )
    case 'transfer':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
        </svg>
      )
    case 'listing':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
        </svg>
      )
    case 'collection_launch':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
        </svg>
      )
    case 'airdrop':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
        </svg>
      )
  }
}

function EventDetails({ event }: { event: TimelineEvent }) {
  const details = event.details

  const rows: { label: string; value: string }[] = []

  if ('contractAddress' in details) {
    rows.push({ label: 'Contract', value: shortenAddress(details.contractAddress) })
  }
  if ('contractName' in details && details.contractName) {
    rows.push({ label: 'Contract Name', value: details.contractName })
  }
  if ('contractType' in details && details.contractType) {
    rows.push({ label: 'Type', value: details.contractType })
  }
  if ('collectionName' in details && details.collectionName) {
    rows.push({ label: 'Collection', value: details.collectionName })
  }
  if ('tokenName' in details && details.tokenName) {
    rows.push({ label: 'Token', value: details.tokenName })
  }
  if ('tokenId' in details) {
    rows.push({ label: 'Token ID', value: details.tokenId })
  }
  if ('quantity' in details) {
    rows.push({ label: 'Quantity', value: details.quantity.toLocaleString() })
  }
  if ('priceEth' in details) {
    rows.push({ label: 'Price', value: `${details.priceEth} ETH` })
  }
  if ('priceUsd' in details && details.priceUsd) {
    rows.push({ label: 'USD Value', value: `$${details.priceUsd.toLocaleString()}` })
  }
  if ('marketplace' in details && details.marketplace) {
    rows.push({ label: 'Marketplace', value: details.marketplace })
  }
  if ('buyer' in details) {
    rows.push({ label: 'Buyer', value: shortenAddress(details.buyer) })
  }
  if ('seller' in details) {
    rows.push({ label: 'Seller', value: shortenAddress(details.seller) })
  }
  if ('from' in details) {
    rows.push({ label: 'From', value: shortenAddress(details.from) })
  }
  if ('to' in details) {
    rows.push({ label: 'To', value: shortenAddress(details.to) })
  }
  if ('recipients' in details) {
    rows.push({ label: 'Recipients', value: details.recipients.toLocaleString() })
  }

  rows.push({ label: 'Tx Hash', value: shortenAddress(event.transactionHash) })

  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
      {rows.map((row) => (
        <div key={row.label} className="contents">
          <dt className="text-khaki-500">{row.label}</dt>
          <dd className="font-mono text-khaki-300">{row.value}</dd>
        </div>
      ))}
    </dl>
  )
}

function YearMarker({ year }: { year: number }) {
  return (
    <div className="relative flex items-center gap-4 pb-6 pt-2">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center">
        <div className="h-3 w-3 rounded-full bg-lime-500" />
      </div>
      <div className="flex-1 border-t border-army-green-700" />
      <span className="text-lg font-bold text-lime-500">{year}</span>
      <div className="flex-1 border-t border-army-green-700" />
    </div>
  )
}

// --- Main Page ---

export default function ArtistTimelinePage() {
  const [walletInput, setWalletInput] = useState('')
  const [artist, setArtist] = useState<ArtistProfile | null>(null)
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<TimelineFilters>({
    eventTypes: [],
    chains: [],
    dateRange: { start: null, end: null },
  })

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    // Simulate loading with demo data
    setTimeout(() => {
      setArtist(DEMO_ARTIST)
      setEvents(DEMO_TIMELINE_EVENTS)
      setLoading(false)
    }, 1200)
  }

  function loadDemo() {
    setWalletInput(DEMO_ARTIST.walletAddress)
    setLoading(true)
    setTimeout(() => {
      setArtist(DEMO_ARTIST)
      setEvents(DEMO_TIMELINE_EVENTS)
      setLoading(false)
    }, 800)
  }

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (filters.eventTypes.length > 0 && !filters.eventTypes.includes(event.type)) {
        return false
      }
      if (filters.chains.length > 0 && !filters.chains.includes(event.chain)) {
        return false
      }
      return true
    })
  }, [events, filters])

  const availableChains = useMemo(() => {
    return [...new Set(events.map((e) => e.chain))]
  }, [events])

  // Group events by year for year markers
  const eventsWithYearMarkers = useMemo(() => {
    const result: { type: 'year'; year: number }[] | { type: 'event'; event: TimelineEvent }[] = []
    let lastYear: number | null = null

    for (const event of filteredEvents) {
      const year = getYear(event.timestamp)
      if (year !== lastYear) {
        ;(result as { type: 'year'; year: number }[]).push({ type: 'year', year })
        lastYear = year
      }
      ;(result as { type: 'event'; event: TimelineEvent }[]).push({ type: 'event', event })
    }

    return result as ({ type: 'year'; year: number } | { type: 'event'; event: TimelineEvent })[]
  }, [filteredEvents])

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <header className="mb-8 text-center">
          <Link href="/" className="mb-4 inline-block text-sm text-khaki-500 hover:text-lime-500">
            &larr; Back to SubSucker
          </Link>
          <h1 className="text-4xl font-bold text-foreground md:text-5xl">
            Artist <span className="text-lime-500">Timeline</span>
          </h1>
          <p className="mt-2 text-khaki-400">
            Visual history of an artist&apos;s blockchain journey — mints, sales, contracts, and milestones
          </p>
          <p className="mt-1 text-xs text-khaki-600">
            Powered by Allium blockchain data infrastructure
          </p>
        </header>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-3">
            <input
              type="text"
              value={walletInput}
              onChange={(e) => setWalletInput(e.target.value)}
              placeholder="Enter wallet address or ENS name..."
              className="flex-1 rounded-lg border-2 border-army-green-600 bg-background px-4 py-3 font-mono text-sm text-foreground placeholder-khaki-600 focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-500/50"
            />
            <button
              type="submit"
              disabled={loading || !walletInput.trim()}
              className="rounded-lg bg-lime-600 px-6 py-3 text-sm font-semibold text-army-green-950 transition-all hover:bg-lime-500 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Search'}
            </button>
          </div>
          {!artist && (
            <button
              type="button"
              onClick={loadDemo}
              className="mt-3 text-sm text-khaki-500 underline decoration-khaki-700 hover:text-lime-500"
            >
              Load demo artist (nftartist.eth)
            </button>
          )}
        </form>

        {/* Loading State */}
        {loading && (
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-army-green-700 border-t-lime-500" />
            <p className="text-khaki-400">Querying blockchain data across 150+ chains...</p>
          </div>
        )}

        {/* Results */}
        {artist && !loading && (
          <div className="space-y-6">
            <ArtistProfileCard profile={artist} />

            <FilterBar
              filters={filters}
              onFiltersChange={setFilters}
              availableChains={availableChains}
            />

            {/* Event count */}
            <div className="text-sm text-khaki-500">
              Showing {filteredEvents.length} of {events.length} events
            </div>

            {/* Timeline */}
            <div className="relative">
              {eventsWithYearMarkers.map((item) => {
                if (item.type === 'year') {
                  return <YearMarker key={`year-${item.year}`} year={item.year} />
                }
                return <TimelineEventCard key={item.event.id} event={item.event} />
              })}

              {filteredEvents.length === 0 && (
                <div className="py-12 text-center text-khaki-500">
                  No events match the current filters.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!artist && !loading && (
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 text-6xl text-army-green-700">&#9830;</div>
            <p className="text-lg text-khaki-400">
              Enter a wallet address or ENS name to explore an artist&apos;s blockchain timeline
            </p>
            <p className="mt-2 text-sm text-khaki-600">
              Tracks mints, sales, contract deployments, airdrops, and more across 150+ chains
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 border-t border-army-green-800 pt-6 text-center text-xs text-khaki-600">
          Data sourced from Allium &middot; Supports EVM, Solana, Bitcoin, and 150+ chains
        </footer>
      </div>
    </div>
  )
}
