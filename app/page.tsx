'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export default function ArtistMomentsHome() {
  const router = useRouter()
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile)
      }
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)

    // Parse CSV and navigate to timeline
    // For now, we'll just simulate upload and redirect
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Store file in sessionStorage for timeline page to process
    const reader = new FileReader()
    reader.onload = (e) => {
      const csvData = e.target?.result as string
      sessionStorage.setItem('etherscan-csv', csvData)
      router.push('/timeline')
    }
    reader.readAsText(file)
  }

  return (
    <div className="scanlines flex min-h-screen flex-col items-center justify-center bg-background px-4">
      {/* Retro Grid Background */}
      <div className="fixed inset-0 opacity-20" style={{
        backgroundImage: `
          linear-gradient(var(--purple-600) 1px, transparent 1px),
          linear-gradient(90deg, var(--purple-600) 1px, transparent 1px)
        `,
        backgroundSize: '30px 30px',
      }} />

      <main className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Hero Title */}
        <h1 className="retro-glow mb-4 font-mono text-5xl font-bold tracking-wider text-foreground md:text-6xl lg:text-7xl">
          ARTIST
        </h1>
        <h1 className="retro-glow mb-8 font-mono text-5xl font-bold tracking-wider text-pink-500 md:text-6xl lg:text-7xl">
          MOMENTS
        </h1>

        <p className="mb-4 font-mono text-xl text-purple-300 md:text-2xl">
          Your Ethereum Journey in 80s Atari Style
        </p>

        <p className="mx-auto mb-16 max-w-2xl font-mono text-sm text-purple-400">
          Upload your Etherscan CSV to transform your blockchain history into a pixel-perfect visual timeline.
          Watch your Genesis Mint, contract deployments, and epic sales come alive in retro glory.
        </p>

        {/* Upload Zone */}
        <div className="game-screen mx-auto max-w-2xl rounded-lg p-8">
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`pixel-border relative rounded-lg p-12 transition-all ${
              dragActive ? 'border-pink-500 bg-pink-500/10' : 'border-purple-600 bg-purple-900/30'
            }`}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="absolute inset-0 cursor-pointer opacity-0"
              id="csv-upload"
            />

            <div className="pointer-events-none">
              {file ? (
                <div className="space-y-4">
                  <div className="text-6xl">📊</div>
                  <p className="font-mono text-lg font-bold text-cyan-400">{file.name}</p>
                  <p className="font-mono text-sm text-purple-300">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-6xl">⬆️</div>
                  <p className="font-mono text-lg font-bold text-foreground">
                    DROP ETHERSCAN CSV HERE
                  </p>
                  <p className="font-mono text-sm text-purple-400">or click to browse</p>
                </div>
              )}
            </div>
          </div>

          {file && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="pixel-button mt-8 w-full bg-gradient-to-r from-pink-600 to-purple-600 py-4 font-mono text-xl font-bold text-white hover:from-pink-500 hover:to-purple-500 disabled:opacity-50"
            >
              {uploading ? '⏳ LOADING...' : '▶ GENERATE TIMELINE'}
            </button>
          )}
        </div>

        {/* Info Cards */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          <div className="game-screen pixel-border rounded-lg border-purple-600 p-6">
            <div className="mb-3 font-mono text-4xl">🎮</div>
            <div className="font-mono text-xs uppercase text-purple-300">Genesis Mint</div>
            <div className="mt-2 font-mono text-sm text-purple-400">Your first NFT drop immortalized</div>
          </div>

          <div className="game-screen pixel-border rounded-lg border-pink-600 p-6">
            <div className="mb-3 font-mono text-4xl">💰</div>
            <div className="font-mono text-xs uppercase text-pink-300">Epic Sales</div>
            <div className="mt-2 font-mono text-sm text-pink-400">Major milestones highlighted</div>
          </div>

          <div className="game-screen pixel-border rounded-lg border-cyan-600 p-6">
            <div className="mb-3 font-mono text-4xl">🚀</div>
            <div className="font-mono text-xs uppercase text-cyan-300">Contract Deploy</div>
            <div className="mt-2 font-mono text-sm text-cyan-400">Birth of your collections</div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 border-t border-purple-800 pt-8">
          <p className="font-mono text-xs text-purple-600">
            ARTIST MOMENTS © 2026 - POWERED BY ETHERSCAN & RETRO VIBES
          </p>
        </footer>
      </main>
    </div>
  )
}
