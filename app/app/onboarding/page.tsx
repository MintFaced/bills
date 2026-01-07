'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { generateSprintId } from '@/lib/utils/sprint'

type Category = 'marketing' | 'software' | 'telco' | 'payments'
type PaymentFrequency = 'mostly_monthly' | 'mix' | 'mostly_annual' | 'not_sure'
type Aggressiveness = 'conservative' | 'balanced' | 'aggressive'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Form state
  const [category, setCategory] = useState<Category>('marketing')
  const [marketingTools, setMarketingTools] = useState<string[]>([])
  const [paymentFrequency, setPaymentFrequency] = useState<PaymentFrequency>('mix')
  const [retentionPriority, setRetentionPriority] = useState(true)
  const [aggressiveness, setAggressiveness] = useState<Aggressiveness>('balanced')
  const [includeItMobile, setIncludeItMobile] = useState(false)
  const [hasMicrosoft365, setHasMicrosoft365] = useState(false)
  const [hasGoogleWorkspace, setHasGoogleWorkspace] = useState(false)
  const [hasCloudStorage, setHasCloudStorage] = useState(false)

  const marketingToolOptions = [
    'Email marketing',
    'SEO tools',
    'Design tools',
    'Meetings/sales calls',
    'Other',
  ]

  const toggleMarketingTool = (tool: string) => {
    setMarketingTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    )
  }

  const handleNext = () => {
    if (step === 5 && includeItMobile) {
      setStep(6) // Go to IT/Mobile questions
    } else if (step === 5 || step === 7) {
      // Skip to CSV upload
      handleCreateSprint()
    } else {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleCreateSprint = async () => {
    setLoading(true)

    const supabase = createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/')
      return
    }

    // Create sprint
    const { data: sprint, error } = await supabase
      .from('sprints')
      .insert({
        user_id: user.id,
        sprint_id: generateSprintId(),
        primary_category: category,
        marketing_tools: marketingTools,
        payment_frequency: paymentFrequency,
        retention_priority: retentionPriority,
        aggressiveness,
        include_it_mobile: includeItMobile,
        has_microsoft365: hasMicrosoft365,
        has_google_workspace: hasGoogleWorkspace,
        has_cloud_storage: hasCloudStorage,
        deposit_amount: 9900, // Default to $99, will update if LinkedIn discount applied
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating sprint:', error)
      setLoading(false)
      return
    }

    // Redirect to CSV upload
    router.push(`/app/scan?sprint=${sprint.id}`)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-sm text-khaki-500">
            <span>Question {step} of {includeItMobile && step > 5 ? '7' : '5'}</span>
            <span>{Math.round((step / (includeItMobile && step > 5 ? 7 : 5)) * 100)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-army-green-900">
            <div
              className="h-full bg-lime-500 transition-all duration-300"
              style={{ width: `${(step / (includeItMobile && step > 5 ? 7 : 5)) * 100}%` }}
            />
          </div>
        </div>

        {/* Question 1: Category */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-foreground">Which category do you want to cut first?</h2>
            <p className="text-khaki-400">We'll focus here to get you results faster.</p>

            <div className="grid gap-4">
              {[
                { value: 'marketing', label: 'Marketing', desc: 'Email, SEO, design, ads' },
                { value: 'software', label: 'Software', desc: 'SaaS tools, subscriptions' },
                { value: 'telco', label: 'Telco', desc: 'Mobile, internet, phones' },
                { value: 'payments', label: 'Payments', desc: 'Payment processors, fees' },
              ].map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value as Category)}
                  className={`rounded-lg border-2 p-4 text-left transition-all ${
                    category === cat.value
                      ? 'border-lime-500 bg-army-green-900'
                      : 'border-army-green-800 bg-army-green-950 hover:border-army-green-600'
                  }`}
                >
                  <div className="text-lg font-semibold text-foreground">{cat.label}</div>
                  <div className="text-sm text-khaki-400">{cat.desc}</div>
                </button>
              ))}
            </div>

            <button
              onClick={handleNext}
              className="w-full rounded-lg bg-lime-600 px-8 py-4 text-lg font-semibold text-army-green-950 transition-all hover:bg-lime-500"
            >
              Next
            </button>
          </div>
        )}

        {/* Question 2: Marketing Tools */}
        {step === 2 && category === 'marketing' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-foreground">Which marketing tools do you pay for?</h2>
            <p className="text-khaki-400">Select all that apply. This helps us detect duplicates.</p>

            <div className="grid gap-3">
              {marketingToolOptions.map((tool) => (
                <button
                  key={tool}
                  onClick={() => toggleMarketingTool(tool)}
                  className={`rounded-lg border-2 p-4 text-left transition-all ${
                    marketingTools.includes(tool)
                      ? 'border-lime-500 bg-army-green-900'
                      : 'border-army-green-800 bg-army-green-950 hover:border-army-green-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg text-foreground">{tool}</span>
                    {marketingTools.includes(tool) && (
                      <span className="text-lime-500">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleBack}
                className="flex-1 rounded-lg border-2 border-army-green-700 px-8 py-4 text-lg font-semibold text-foreground transition-all hover:border-army-green-500"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="flex-1 rounded-lg bg-lime-600 px-8 py-4 text-lg font-semibold text-army-green-950 transition-all hover:bg-lime-500"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Question 3: Payment Frequency */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-foreground">Are you mostly paying monthly or annual?</h2>
            <p className="text-khaki-400">This helps us spot monthly→annual switch opportunities.</p>

            <div className="grid gap-4">
              {[
                { value: 'mostly_monthly', label: 'Mostly monthly' },
                { value: 'mix', label: 'Mix of both' },
                { value: 'mostly_annual', label: 'Mostly annual' },
                { value: 'not_sure', label: 'Not sure' },
              ].map((freq) => (
                <button
                  key={freq.value}
                  onClick={() => setPaymentFrequency(freq.value as PaymentFrequency)}
                  className={`rounded-lg border-2 p-4 text-left transition-all ${
                    paymentFrequency === freq.value
                      ? 'border-lime-500 bg-army-green-900'
                      : 'border-army-green-800 bg-army-green-950 hover:border-army-green-600'
                  }`}
                >
                  <div className="text-lg text-foreground">{freq.label}</div>
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleBack}
                className="flex-1 rounded-lg border-2 border-army-green-700 px-8 py-4 text-lg font-semibold text-foreground transition-all hover:border-army-green-500"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="flex-1 rounded-lg bg-lime-600 px-8 py-4 text-lg font-semibold text-army-green-950 transition-all hover:bg-lime-500"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Question 4: Retention Discount Priority */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-foreground">Prioritise retention-discount tactics?</h2>
            <p className="text-khaki-400">
              We'll show you scripts to trigger retention offers before cancelling.
            </p>

            <div className="grid gap-4">
              {[
                { value: true, label: 'Yes', desc: 'Try to negotiate first (recommended)' },
                { value: false, label: 'No', desc: 'Just focus on cancelling' },
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setRetentionPriority(opt.value)}
                  className={`rounded-lg border-2 p-4 text-left transition-all ${
                    retentionPriority === opt.value
                      ? 'border-lime-500 bg-army-green-900'
                      : 'border-army-green-800 bg-army-green-950 hover:border-army-green-600'
                  }`}
                >
                  <div className="text-lg font-semibold text-foreground">{opt.label}</div>
                  <div className="text-sm text-khaki-400">{opt.desc}</div>
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleBack}
                className="flex-1 rounded-lg border-2 border-army-green-700 px-8 py-4 text-lg font-semibold text-foreground transition-all hover:border-army-green-500"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="flex-1 rounded-lg bg-lime-600 px-8 py-4 text-lg font-semibold text-army-green-950 transition-all hover:bg-lime-500"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Question 5: Aggressiveness + IT/Mobile Gate */}
        {step === 5 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-foreground">How hard do we go?</h2>
            <p className="text-khaki-400">This adjusts how optimistic our savings estimates are.</p>

            <div className="grid gap-4">
              {[
                {
                  value: 'conservative',
                  label: 'Conservative',
                  desc: 'Lower estimates, safer assumptions',
                },
                { value: 'balanced', label: 'Balanced', desc: 'Realistic middle ground (recommended)' },
                { value: 'aggressive', label: 'Aggressive', desc: 'Higher estimates, best-case scenarios' },
              ].map((agg) => (
                <button
                  key={agg.value}
                  onClick={() => setAggressiveness(agg.value as Aggressiveness)}
                  className={`rounded-lg border-2 p-4 text-left transition-all ${
                    aggressiveness === agg.value
                      ? 'border-lime-500 bg-army-green-900'
                      : 'border-army-green-800 bg-army-green-950 hover:border-army-green-600'
                  }`}
                >
                  <div className="text-lg font-semibold text-foreground">{agg.label}</div>
                  <div className="text-sm text-khaki-400">{agg.desc}</div>
                </button>
              ))}
            </div>

            {/* IT/Mobile Gate */}
            <div className="rounded-lg border border-army-green-800 bg-army-green-950 p-6">
              <div className="mb-3 text-lg font-semibold text-foreground">
                Also scan IT/cloud/mobile spend?
              </div>
              <p className="mb-4 text-sm text-khaki-400">
                Optional. We'll ask 3 quick questions about Microsoft/Google/cloud storage.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIncludeItMobile(false)}
                  className={`flex-1 rounded-lg border-2 p-3 transition-all ${
                    !includeItMobile
                      ? 'border-lime-500 bg-army-green-900'
                      : 'border-army-green-700 hover:border-army-green-600'
                  }`}
                >
                  <span className="text-foreground">No, skip</span>
                </button>
                <button
                  onClick={() => setIncludeItMobile(true)}
                  className={`flex-1 rounded-lg border-2 p-3 transition-all ${
                    includeItMobile
                      ? 'border-lime-500 bg-army-green-900'
                      : 'border-army-green-700 hover:border-army-green-600'
                  }`}
                >
                  <span className="text-foreground">Yes, scan IT too</span>
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleBack}
                className="flex-1 rounded-lg border-2 border-army-green-700 px-8 py-4 text-lg font-semibold text-foreground transition-all hover:border-army-green-500"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="flex-1 rounded-lg bg-lime-600 px-8 py-4 text-lg font-semibold text-army-green-950 transition-all hover:bg-lime-500"
              >
                {includeItMobile ? 'Next' : 'Upload CSV'}
              </button>
            </div>
          </div>
        )}

        {/* Question 6: IT/Mobile Questions */}
        {step === 6 && includeItMobile && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-foreground">Quick IT/cloud questions</h2>
            <p className="text-khaki-400">This helps us detect duplicate cloud/storage tools.</p>

            <div className="space-y-4">
              <div className="rounded-lg border border-army-green-800 bg-army-green-950 p-4">
                <div className="mb-2 text-lg text-foreground">Do you pay for Microsoft 365?</div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setHasMicrosoft365(true)}
                    className={`flex-1 rounded-lg border-2 p-3 transition-all ${
                      hasMicrosoft365
                        ? 'border-lime-500 bg-army-green-900'
                        : 'border-army-green-700 hover:border-army-green-600'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setHasMicrosoft365(false)}
                    className={`flex-1 rounded-lg border-2 p-3 transition-all ${
                      !hasMicrosoft365
                        ? 'border-lime-500 bg-army-green-900'
                        : 'border-army-green-700 hover:border-army-green-600'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              <div className="rounded-lg border border-army-green-800 bg-army-green-950 p-4">
                <div className="mb-2 text-lg text-foreground">Do you pay for Google Workspace?</div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setHasGoogleWorkspace(true)}
                    className={`flex-1 rounded-lg border-2 p-3 transition-all ${
                      hasGoogleWorkspace
                        ? 'border-lime-500 bg-army-green-900'
                        : 'border-army-green-700 hover:border-army-green-600'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setHasGoogleWorkspace(false)}
                    className={`flex-1 rounded-lg border-2 p-3 transition-all ${
                      !hasGoogleWorkspace
                        ? 'border-lime-500 bg-army-green-900'
                        : 'border-army-green-700 hover:border-army-green-600'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              <div className="rounded-lg border border-army-green-800 bg-army-green-950 p-4">
                <div className="mb-2 text-lg text-foreground">
                  Do you pay for Dropbox, iCloud+, or other cloud storage?
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setHasCloudStorage(true)}
                    className={`flex-1 rounded-lg border-2 p-3 transition-all ${
                      hasCloudStorage
                        ? 'border-lime-500 bg-army-green-900'
                        : 'border-army-green-700 hover:border-army-green-600'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setHasCloudStorage(false)}
                    className={`flex-1 rounded-lg border-2 p-3 transition-all ${
                      !hasCloudStorage
                        ? 'border-lime-500 bg-army-green-900'
                        : 'border-army-green-700 hover:border-army-green-600'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleBack}
                className="flex-1 rounded-lg border-2 border-army-green-700 px-8 py-4 text-lg font-semibold text-foreground transition-all hover:border-army-green-500"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={loading}
                className="flex-1 rounded-lg bg-lime-600 px-8 py-4 text-lg font-semibold text-army-green-950 transition-all hover:bg-lime-500 disabled:opacity-50"
              >
                {loading ? 'Creating sprint...' : 'Upload CSV'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
