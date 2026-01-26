'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { parseEtherscanCSV } from '@/lib/utils/etherscan-parser'
import { detectMoments, getMomentIcon, getMomentColor, type ArtistMoment } from '@/lib/utils/moment-detector'

export default function TimelinePage() {
  const router = useRouter()
  const [moments, setMoments] = useState<ArtistMoment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMoment, setSelectedMoment] = useState<ArtistMoment | null>(null)

  useEffect(() => {
    const csvData = sessionStorage.getItem('etherscan-csv')
    if (!csvData) {
      router.push('/')
      return
    }

    try {
      const { data, errors } = parseEtherscanCSV(csvData)

      if (errors.length > 0) {
        setError(errors[0])
        setLoading(false)
        return
      }

      if (data.length === 0) {
        setError('No transactions found in CSV')
        setLoading(false)
        return
      }

      const detectedMoments = detectMoments(data)
      setMoments(detectedMoments)
      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process CSV')
      setLoading(false)
    }
  }, [router])

  if (loading) {
    return (
      <div className="scanlines flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="retro-glow mb-4 font-mono text-4xl">⏳</div>
          <p className="font-mono text-xl text-purple-400">PROCESSING TIMELINE...</p>
          <div className="mt-4 flex justify-center gap-1">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-2 w-2 animate-pulse bg-pink-500"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="scanlines flex min-h-screen items-center justify-center bg-background px-4">
        <div className="game-screen pixel-border max-w-lg rounded-lg border-pink-600 p-8 text-center">
          <div className="mb-4 text-6xl">⚠️</div>
          <h2 className="mb-4 font-mono text-2xl font-bold text-pink-500">ERROR</h2>
          <p className="mb-6 font-mono text-sm text-purple-300">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="pixel-button bg-purple-600 px-6 py-3 font-mono font-bold text-white hover:bg-purple-500"
          >
            ← BACK TO START
          </button>
        </div>
      </div>
    )
  }

  if (moments.length === 0) {
    return (
      <div className="scanlines flex min-h-screen items-center justify-center bg-background px-4">
        <div className="game-screen pixel-border max-w-lg rounded-lg border-cyan-600 p-8 text-center">
          <div className="mb-4 text-6xl">📭</div>
          <h2 className="mb-4 font-mono text-2xl font-bold text-cyan-400">NO MOMENTS FOUND</h2>
          <p className="mb-6 font-mono text-sm text-purple-300">
            We couldn't detect any key moments in your Etherscan data. Make sure your CSV contains contract deployments, mints, or sales.
          </p>
          <button
            onClick={() => router.push('/')}
            className="pixel-button bg-purple-600 px-6 py-3 font-mono font-bold text-white hover:bg-purple-500"
          >
            ← TRY AGAIN
          </button>
        </div>
      </div>
    )
  }

  const getColorClass = (color: string) => {
    const colorMap: Record<string, { bg: string; border: string; text: string }> = {
      purple: { bg: 'bg-purple-600', border: 'border-purple-500', text: 'text-purple-400' },
      pink: { bg: 'bg-pink-600', border: 'border-pink-500', text: 'text-pink-400' },
      cyan: { bg: 'bg-cyan-600', border: 'border-cyan-500', text: 'text-cyan-400' },
    }
    return colorMap[color] || colorMap.purple
  }

  return (
    <div className="scanlines min-h-screen bg-background px-4 py-12">
      {/* Retro Grid Background */}
      <div className="fixed inset-0 opacity-10" style={{
        backgroundImage: `
          linear-gradient(var(--purple-600) 1px, transparent 1px),
          linear-gradient(90deg, var(--purple-600) 1px, transparent 1px)
        `,
        backgroundSize: '30px 30px',
      }} />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="retro-glow mb-4 font-mono text-4xl font-bold text-foreground md:text-5xl">
            YOUR ARTIST JOURNEY
          </h1>
          <p className="font-mono text-lg text-purple-400">
            {moments.length} Moments Detected
          </p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 font-mono text-sm text-purple-500 hover:text-pink-500"
          >
            ← Upload Different CSV
          </button>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-600 via-pink-600 to-cyan-600 md:left-1/2 md:-ml-0.5" />

          {/* Moments */}
          <div className="space-y-12">
            {moments.map((moment, index) => {
              const color = getMomentColor(moment.type)
              const colors = getColorClass(color)
              const isLeft = index % 2 === 0

              return (
                <div
                  key={moment.id}
                  className={`relative flex items-center ${
                    isLeft ? 'md:justify-start' : 'md:justify-end'
                  }`}
                >
                  {/* Timeline dot */}
                  <div
                    className={`absolute left-8 z-10 h-6 w-6 rounded-sm ${colors.bg} border-2 border-background shadow-lg md:left-1/2 md:-ml-3`}
                  />

                  {/* Moment card */}
                  <div
                    className={`ml-20 w-full cursor-pointer transition-all hover:scale-105 md:ml-0 md:w-5/12 ${
                      isLeft ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8'
                    }`}
                    onClick={() => setSelectedMoment(moment)}
                  >
                    <div className={`game-screen pixel-border rounded-lg ${colors.border} p-6`}>
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-3xl">{getMomentIcon(moment.type)}</span>
                        <span className={`font-mono text-xs ${colors.text}`}>
                          {new Date(moment.timestamp * 1000).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="mb-2 font-mono text-lg font-bold text-foreground">
                        {moment.title}
                      </h3>
                      <p className="font-mono text-sm text-purple-300">{moment.description}</p>
                      {moment.value && (
                        <div className={`mt-3 font-mono text-xl font-bold ${colors.text}`}>
                          {moment.value.toFixed(4)} ETH
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="mt-16 grid gap-6 md:grid-cols-4">
          <div className="game-screen pixel-border rounded-lg border-purple-600 p-6 text-center">
            <div className="mb-2 font-mono text-3xl font-bold text-purple-400">
              {moments.filter(m => m.type === 'CONTRACT_DEPLOY').length}
            </div>
            <div className="font-mono text-xs text-purple-300">Contracts</div>
          </div>
          <div className="game-screen pixel-border rounded-lg border-pink-600 p-6 text-center">
            <div className="mb-2 font-mono text-3xl font-bold text-pink-400">
              {moments.filter(m => m.type === 'GENESIS_MINT').length}
            </div>
            <div className="font-mono text-xs text-pink-300">Genesis Mints</div>
          </div>
          <div className="game-screen pixel-border rounded-lg border-cyan-600 p-6 text-center">
            <div className="mb-2 font-mono text-3xl font-bold text-cyan-400">
              {moments.filter(m => m.type === 'BIGGEST_SALE' || m.type === 'FIRST_SALE').length}
            </div>
            <div className="font-mono text-xs text-cyan-300">Major Sales</div>
          </div>
          <div className="game-screen pixel-border rounded-lg border-purple-600 p-6 text-center">
            <div className="mb-2 font-mono text-3xl font-bold text-purple-400">
              {moments.filter(m => m.type === 'VOLUME_MILESTONE' || m.type === 'MINT_MILESTONE').length}
            </div>
            <div className="font-mono text-xs text-purple-300">Milestones</div>
          </div>
        </div>
      </div>

      {/* Moment Detail Modal */}
      {selectedMoment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedMoment(null)}
        >
          <div
            className="game-screen pixel-border max-w-lg rounded-lg border-pink-600 p-8"
            onClick={e => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-5xl">{getMomentIcon(selectedMoment.type)}</span>
              <button
                onClick={() => setSelectedMoment(null)}
                className="font-mono text-2xl text-purple-500 hover:text-pink-500"
              >
                ✕
              </button>
            </div>
            <h2 className="mb-2 font-mono text-2xl font-bold text-foreground">
              {selectedMoment.title}
            </h2>
            <p className="mb-4 font-mono text-sm text-purple-300">
              {selectedMoment.description}
            </p>
            <div className="space-y-2 border-t border-purple-700 pt-4 font-mono text-xs text-purple-400">
              <div>
                <span className="text-purple-500">Date:</span> {selectedMoment.date}
              </div>
              <div className="break-all">
                <span className="text-purple-500">TX Hash:</span>{' '}
                <a
                  href={`https://etherscan.io/tx/${selectedMoment.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300"
                >
                  {selectedMoment.txHash}
                </a>
              </div>
              {selectedMoment.contractAddress && (
                <div className="break-all">
                  <span className="text-purple-500">Contract:</span> {selectedMoment.contractAddress}
                </div>
              )}
              {selectedMoment.value && (
                <div>
                  <span className="text-purple-500">Value:</span> {selectedMoment.value.toFixed(4)} ETH
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
