'use client'


import NumberFlow from '@number-flow/react'
import { Eye, EyeOff, ExternalLink } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { toUSD } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const ACCOUNT_TYPE_LABEL: Record<string, string> = {
  bank: 'Bank',
  crypto: 'Crypto',
  investment: 'Investment',
  cash: 'Cash',
}

function formatBalance(amount: number, currency: string): string {
  if (currency === 'ARS') {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(amount)
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

function formatPercent(value: number): string {
  return value.toFixed(1) + '%'
}

function formatLastUpdated(): string {
  return new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export function HomeView() {
  const accounts = useAppStore((s) => s.accounts)
  const toggleIncluded = useAppStore((s) => s.toggleIncluded)
  const totalLiquidityUSD = useAppStore((s) => s.totalLiquidityUSD)

  const total = totalLiquidityUSD()

  const handleAccountTap = (account: (typeof accounts)[0]) => {
    if (account.deepLink) {
      toast(`Opening ${account.name}...`, {
        description: 'Launching external app',
        duration: 2000,
      })
      // Attempt deep link
      setTimeout(() => {
        window.open(account.deepLink, '_blank', 'noopener,noreferrer')
      }, 300)
    }
  }

  const handleToggle = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    toggleIncluded(id)
  }

  const includedTotal = accounts
    .filter((a) => a.included)
    .reduce((sum, a) => sum + toUSD(a.balance, a.currency), 0)

  return (
    <div className="flex flex-col pb-24">
      {/* Hero section */}
      <div className="flex flex-col gap-2 px-6 pb-8 pt-16">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Deployable now
        </p>
        <div className="flex items-end gap-0">
          <span className="mt-1 text-3xl font-light text-muted-foreground self-start pt-3">
            $
          </span>
          <NumberFlow
            value={Math.round(total)}
            format={{ notation: 'standard', maximumFractionDigits: 0 }}
            className="text-[3.5rem] font-bold leading-none tracking-tight text-foreground tabular-nums"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Updated {formatLastUpdated()}
        </p>
      </div>

      {/* Divider */}
      <div className="h-px bg-border mx-6" />

      {/* Account breakdown */}
      <div className="flex flex-col gap-0 px-0 pt-4">
        <p className="px-6 pb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Accounts
        </p>
        <div className="flex flex-col">
          {accounts.map((account, i) => {
            const usdValue = toUSD(account.balance, account.currency)
            const percent = includedTotal > 0 && account.included
              ? (usdValue / includedTotal) * 100
              : 0

            return (
              <div
                key={account.id}
                role="button"
                tabIndex={0}
                onClick={() => handleAccountTap(account)}
                onKeyDown={(e) => e.key === 'Enter' && handleAccountTap(account)}
                className={cn(
                  'flex cursor-pointer items-center gap-4 px-6 py-4 text-left transition-colors active:bg-muted',
                  i !== accounts.length - 1 && 'border-b border-border'
                )}
              >
                {/* Account info */}
                <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'text-sm font-medium transition-colors',
                        account.included ? 'text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      {account.name}
                    </span>
                    <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/60">
                      {ACCOUNT_TYPE_LABEL[account.type]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'text-xs tabular-nums transition-colors',
                        account.included ? 'text-muted-foreground' : 'text-muted-foreground/50'
                      )}
                    >
                      {formatBalance(account.balance, account.currency)}
                    </span>
                    {account.included && percent > 0 && (
                      <>
                        <span className="text-muted-foreground/30 text-xs">·</span>
                        <span className="text-xs text-muted-foreground/70 tabular-nums">
                          {formatPercent(percent)}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-3 shrink-0">
                  {account.deepLink && (
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/30" />
                  )}
                  <button
                    onClick={(e) => handleToggle(e, account.id)}
                    aria-label={account.included ? 'Exclude from total' : 'Include in total'}
                    className="flex h-9 w-9 items-center justify-center rounded-full transition-colors active:bg-muted"
                  >
                    {account.included ? (
                      <Eye className="h-5 w-5 text-foreground" />
                    ) : (
                      <EyeOff className="h-5 w-5 text-muted-foreground/40" />
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
