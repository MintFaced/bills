'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const supabase = createClient()

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/app/onboarding`,
      },
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Check your email for the magic link!')
    }

    setLoading(false)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      {/* Hero Section */}
      <main className="mx-auto max-w-4xl text-center">
        <h1 className="mb-6 text-6xl font-bold tracking-tight text-foreground md:text-7xl lg:text-8xl">
          Sub<span className="text-lime-500">Sucker</span>
        </h1>

        <p className="mb-4 text-xl text-khaki-300 md:text-2xl lg:text-3xl">
          Stop bleeding cash on subscriptions you forgot about
        </p>

        <p className="mx-auto mb-12 max-w-2xl text-lg text-khaki-400">
          Upload a bank CSV, we'll find subscription creep and overpay, give you the exact scripts to
          cancel/negotiate, then verify savings at Day 31 and Day 90. Built for NZ manufacturers (2–25 staff).
        </p>

        {/* Sign In Form */}
        <div className="mx-auto max-w-md">
          <form onSubmit={handleSignIn} className="space-y-4">
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border-2 border-army-green-600 bg-background px-6 py-4 text-lg text-foreground placeholder-khaki-600 focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-500/50"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-lime-600 px-8 py-4 text-lg font-semibold text-army-green-950 transition-all hover:bg-lime-500 disabled:opacity-50"
            >
              {loading ? 'Sending magic link...' : 'Get Started Free'}
            </button>

            {message && (
              <p
                className={`text-sm ${message.includes('Check') ? 'text-lime-400' : 'text-red-400'}`}
              >
                {message}
              </p>
            )}
          </form>

          <p className="mt-6 text-sm text-khaki-500">
            No credit card. Upload your CSV, see your potential savings for free.
          </p>
        </div>

        {/* Value Props */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          <div className="rounded-lg border border-army-green-800 bg-army-green-950 p-6">
            <div className="mb-3 text-4xl font-bold text-lime-500">$0</div>
            <div className="text-sm text-khaki-300">Free scan & hero number</div>
          </div>

          <div className="rounded-lg border border-army-green-800 bg-army-green-950 p-6">
            <div className="mb-3 text-4xl font-bold text-lime-500">10%</div>
            <div className="text-sm text-khaki-300">Success fee on confirmed savings only</div>
          </div>

          <div className="rounded-lg border border-army-green-800 bg-army-green-950 p-6">
            <div className="mb-3 text-4xl font-bold text-lime-500">31 days</div>
            <div className="text-sm text-khaki-300">Action sprint with scripts & reminders</div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-20 text-left">
          <h2 className="mb-8 text-center text-3xl font-bold text-foreground">How It Works</h2>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime-600 text-lg font-bold text-army-green-950">
                1
              </div>
              <div>
                <h3 className="mb-1 text-lg font-semibold text-foreground">Upload Bank CSV</h3>
                <p className="text-khaki-400">
                  Works with ANZ, BNZ, SBS, and most NZ banks. We auto-detect recurring charges.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime-600 text-lg font-bold text-army-green-950">
                2
              </div>
              <div>
                <h3 className="mb-1 text-lg font-semibold text-foreground">See Your Savings Number</h3>
                <p className="text-khaki-400">
                  We show potential annual savings from duplicates, retention discounts, and monthly→annual
                  switches. Free.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime-600 text-lg font-bold text-army-green-950">
                3
              </div>
              <div>
                <h3 className="mb-1 text-lg font-semibold text-foreground">
                  Unlock Full Playbook ($99 or $49)
                </h3>
                <p className="text-khaki-400">
                  Pay a refundable deposit ($99, or $49 if you share on LinkedIn). Get cancel scripts,
                  negotiation templates, and a 31-day action plan.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime-600 text-lg font-bold text-army-green-950">
                4
              </div>
              <div>
                <h3 className="mb-1 text-lg font-semibold text-foreground">We Verify & True-Up</h3>
                <p className="text-khaki-400">
                  At Day 90, re-upload your CSV. We verify actual savings, charge our 10% fee (capped), and
                  refund the difference. If $0 savings, full refund.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 border-t border-army-green-800 pt-8">
          <div className="flex flex-col items-center gap-4 text-sm text-khaki-600 md:flex-row md:justify-between">
            <div>© 2026 SubSucker. Built for NZ businesses.</div>
            <div className="flex gap-6">
              <a href="/leaderboard" className="hover:text-lime-500">
                Leaderboard
              </a>
              <a href="/privacy" className="hover:text-lime-500">
                Privacy
              </a>
              <a href="/terms" className="hover:text-lime-500">
                Terms
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
