'use client'

import { useState } from 'react'
import { ALL_ACCOUNTS } from '@/lib/mock-data'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

type Step = 0 | 1 | 2 | 3

export function Onboarding() {
  const [step, setStep] = useState<Step>(0)
  const [selected, setSelected] = useState<Set<string>>(
    new Set(ALL_ACCOUNTS.map((a) => a.id))
  )
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('yearly')
  const [loading, setLoading] = useState(false)
  const completeOnboarding = useAppStore((s) => s.completeOnboarding)

  const toggleAccount = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        if (next.size > 1) next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleFinish = () => {
    setLoading(true)
    setTimeout(() => {
      completeOnboarding(Array.from(selected))
    }, 1800)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      {/* Step indicator */}
      {step < 3 && (
        <div className="flex justify-center gap-1.5 pt-14">
          {([0, 1, 2] as const).map((i) => (
            <div
              key={i}
              className={cn(
                'h-1 rounded-full transition-all duration-500',
                step === i
                  ? 'w-6 bg-foreground'
                  : step > i
                  ? 'w-6 bg-foreground/40'
                  : 'w-2 bg-foreground/15'
              )}
            />
          ))}
        </div>
      )}

      <div className="flex flex-1 flex-col">
        {/* Step 0 — Welcome */}
        {step === 0 && (
          <div className="flex flex-1 flex-col justify-between px-6 pb-12 pt-16">
            <div className="flex flex-col gap-5">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Your money, at a glance
              </p>
              <h1 className="text-[2.75rem] font-semibold leading-tight tracking-tight text-foreground text-balance">
                Know exactly what you can deploy right now.
              </h1>
              <p className="text-base leading-relaxed text-muted-foreground text-pretty">
                One number. Every account. No noise. Open the app and know instantly how much liquidity you have available — across banks, crypto, and cash.
              </p>
            </div>
            <button
              onClick={() => setStep(1)}
              className="w-full rounded-2xl bg-foreground py-4 text-base font-semibold text-background transition-opacity active:opacity-70"
            >
              Get started
            </button>
          </div>
        )}

        {/* Step 1 — Account selection */}
        {step === 1 && (
          <div className="flex flex-1 flex-col justify-between px-6 pb-12 pt-12">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  Select your accounts
                </h2>
                <p className="text-sm text-muted-foreground">
                  Choose which accounts to track. You can add or hide them anytime.
                </p>
              </div>
              <div className="flex flex-col divide-y divide-border rounded-2xl bg-card overflow-hidden">
                {ALL_ACCOUNTS.map((account) => {
                  const isSelected = selected.has(account.id)
                  return (
                    <button
                      key={account.id}
                      onClick={() => toggleAccount(account.id)}
                      className="flex items-center gap-4 px-5 py-4 text-left transition-colors active:bg-muted"
                    >
                      <div
                        className={cn(
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all',
                          isSelected
                            ? 'border-foreground bg-foreground'
                            : 'border-border bg-transparent'
                        )}
                      >
                        {isSelected && (
                          <Check className="h-3 w-3 text-background" strokeWidth={3} />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col">
                        <span className="text-sm font-medium text-foreground">
                          {account.name}
                        </span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {account.type}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={selected.size === 0}
              className="mt-6 w-full rounded-2xl bg-foreground py-4 text-base font-semibold text-background transition-opacity disabled:opacity-30 active:opacity-70"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2 — Paywall */}
        {step === 2 && (
          <div className="flex flex-1 flex-col justify-between px-6 pb-12 pt-12">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  Choose a plan
                </h2>
                <p className="text-sm text-muted-foreground">
                  Full access to all accounts and features. Cancel anytime.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                {/* Yearly */}
                <button
                  onClick={() => setPlan('yearly')}
                  className={cn(
                    'relative flex flex-col gap-1 rounded-2xl border-2 p-5 text-left transition-all',
                    plan === 'yearly'
                      ? 'border-foreground bg-foreground/5'
                      : 'border-border bg-card'
                  )}
                >
                  <div className="absolute right-4 top-4">
                    <span className="rounded-full bg-foreground px-2.5 py-0.5 text-xs font-semibold text-background">
                      Best value
                    </span>
                  </div>
                  <span className="text-base font-semibold text-foreground">
                    $333 / year
                  </span>
                  <span className="text-sm text-muted-foreground">
                    $27.75 per month — save 16%
                  </span>
                  {plan === 'yearly' && (
                    <div className="absolute right-4 bottom-4">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground">
                        <Check className="h-3 w-3 text-background" strokeWidth={3} />
                      </div>
                    </div>
                  )}
                </button>
                {/* Monthly */}
                <button
                  onClick={() => setPlan('monthly')}
                  className={cn(
                    'flex flex-col gap-1 rounded-2xl border-2 p-5 text-left transition-all',
                    plan === 'monthly'
                      ? 'border-foreground bg-foreground/5'
                      : 'border-border bg-card'
                  )}
                >
                  <span className="text-base font-semibold text-foreground">
                    $33 / month
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Billed monthly, no commitment
                  </span>
                  {plan === 'monthly' && (
                    <div className="absolute right-4 bottom-4">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground">
                        <Check className="h-3 w-3 text-background" strokeWidth={3} />
                      </div>
                    </div>
                  )}
                </button>
              </div>
              <p className="text-center text-xs text-muted-foreground">
                Secure payment. Cancel anytime. No hidden fees.
              </p>
            </div>
            <button
              onClick={() => setStep(3)}
              className="mt-6 w-full rounded-2xl bg-foreground py-4 text-base font-semibold text-background transition-opacity active:opacity-70"
            >
              Continue with {plan === 'yearly' ? '$333/yr' : '$33/mo'}
            </button>
          </div>
        )}

        {/* Step 3 — Finish */}
        {step === 3 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 pb-12">
            {loading ? (
              <div className="flex flex-col items-center gap-5">
                <div className="relative flex h-16 w-16 items-center justify-center">
                  <div className="absolute inset-0 animate-spin rounded-full border-2 border-border border-t-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Setting up your accounts...</p>
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-foreground/10">
                    <Check className="h-8 w-8 text-foreground" strokeWidth={2} />
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                    You&apos;re all set
                  </h2>
                  <p className="text-sm text-muted-foreground text-balance">
                    {selected.size} account{selected.size !== 1 ? 's' : ''} selected. Open the app anytime to see your real-time liquidity.
                  </p>
                </div>
                <button
                  onClick={handleFinish}
                  className="w-full rounded-2xl bg-foreground py-4 text-base font-semibold text-background transition-opacity active:opacity-70"
                >
                  Enter the app
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
