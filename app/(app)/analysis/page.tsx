'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useAppStore } from '@/lib/store'
import { getHistoricalData, getAIExplanation, Transaction, toUSD } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const RANGES = ['1W', '1M', '3M', '6M', '1Y', 'ALL'] as const
type Range = (typeof RANGES)[number]

function startOfDay(date: Date): Date {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

function getRangeStart(range: Range): Date | null {
  if (range === 'ALL') return null

  const days: Record<Exclude<Range, 'ALL'>, number> = {
    '1W': 7,
    '1M': 30,
    '3M': 90,
    '6M': 180,
    '1Y': 365,
  }

  const now = startOfDay(new Date())
  now.setDate(now.getDate() - days[range])
  return now
}

function formatPeriodLabel(range: Range): string {
  if (range === '1W') return 'Last 7 days'
  if (range === '1M') return 'Last 30 days'
  if (range === '3M') return 'Last 3 months'
  if (range === '6M') return 'Last 6 months'
  if (range === '1Y') return 'Last 12 months'
  return 'All time'
}

function formatDateLabel(date: Date, range: Range): string {
  if (range === '1W') return date.toLocaleDateString('en-US', { weekday: 'short' })
  if (range === '1M') return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

function formatUSD(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}k`
  return `$${value.toFixed(0)}`
}

function formatAmount(amount: number, currency: string): string {
  const abs = Math.abs(amount)
  if (currency === 'ARS') {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(abs)
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(abs)
}

function formatTimestamp(date: Date): string {
  if (!(date instanceof Date)) date = new Date(date)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86_400_000)
  if (diffDays === 0) return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const TYPE_LABEL: Record<Transaction['type'], string> = {
  inflow: 'Money in',
  outflow: 'Money out',
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl bg-foreground px-3 py-2 shadow-lg">
      <p className="tabular-nums text-xs font-semibold text-background">
        {new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0,
        }).format(payload[0].value)}
      </p>
    </div>
  )
}

// TypewriterText: reveals text character-by-character.
// The invisible ghost span locks the container height from the start,
// preventing layout reflow while the overlay animates.
// Uses only <span> elements so it is valid inside any parent.
function TypewriterText({ text, speed = 10 }: { text: string; speed?: number }) {
  const [count, setCount] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    setCount(0)
    setDone(false)
    if (!text) return
    let i = 0
    const id = setInterval(() => {
      i++
      setCount(i)
      if (i >= text.length) {
        clearInterval(id)
        setDone(true)
      }
    }, speed)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text])

  return (
    <span className="relative block">
      {/* invisible full text holds the correct container height */}
      <span aria-hidden className="invisible select-none">{text}</span>
      {/* revealed text overlaid — does not affect layout */}
      <span className="absolute inset-0">
        {text.slice(0, count)}
        {!done && (
          <span className="ml-px inline-block h-3.5 w-0.5 animate-pulse bg-foreground/60 align-middle" />
        )}
      </span>
    </span>
  )
}

export default function AnalysisPage() {
  const [range, setRange] = useState<Range>('1M')
  const accounts = useAppStore((s) => s.accounts)
  const transactions = useAppStore((s) => s.transactions)
  const totalLiquidityUSD = useAppStore((s) => s.totalLiquidityUSD)
  const total = totalLiquidityUSD()
  const rangeStart = useMemo(() => getRangeStart(range), [range])

  const historicalData = useMemo(
    () => getHistoricalData(accounts, range),
    [accounts, range]
  )

  const chartData = useMemo(() => {
    const maxPoints = 60
    const step = Math.max(1, Math.floor(historicalData.length / maxPoints))
    return historicalData
      .filter((_, i) => i % step === 0)
      .map((p) => ({
        date: p.date,
        label: formatDateLabel(p.date, range),
        value: Math.round(p.value),
      }))
  }, [historicalData, range])

  const minValue = Math.min(...chartData.map((d) => d.value)) * 0.97
  const maxValue = Math.max(...chartData.map((d) => d.value)) * 1.02

  const aiText = useMemo(() => getAIExplanation(range, total), [range, total])

  const xTicks = useMemo(() => {
    const tickCount = range === '1W' ? 7 : range === '1M' ? 5 : 4
    const step = Math.max(1, Math.floor(chartData.length / tickCount))
    return chartData.filter((_, i) => i % step === 0).map((d) => d.label)
  }, [chartData, range])

  const recentTransactions = useMemo(
    () => [...transactions].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 3),
    [transactions]
  )

  const periodTransactions = useMemo(
    () => transactions.filter((tx) => !rangeStart || new Date(tx.timestamp) >= rangeStart),
    [transactions, rangeStart]
  )

  const moneyIn = useMemo(
    () => periodTransactions.reduce((sum, tx) => sum + (tx.type === 'inflow' ? Math.abs(toUSD(tx.amount, tx.currency)) : 0), 0),
    [periodTransactions]
  )

  const moneyOut = useMemo(
    () => periodTransactions.reduce((sum, tx) => sum + (tx.type === 'outflow' ? Math.abs(toUSD(tx.amount, tx.currency)) : 0), 0),
    [periodTransactions]
  )

  const moneyDiff = moneyIn - moneyOut

  return (
    <div className="flex flex-col pb-24 pt-12">
      {/* Range selector */}
      <div className="flex items-center px-4 pb-6">
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={cn(
              'flex-1 cursor-pointer rounded-xl py-2 text-xs font-semibold transition-all',
              range === r
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted'
            )}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="px-2">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid
              strokeDasharray="0"
              stroke="var(--border)"
              strokeOpacity={0.5}
              vertical={false}
            />
            <XAxis
              dataKey="label"
              ticks={xTicks}
              tick={{ fontSize: 10, fill: 'var(--muted-foreground)', dy: 6 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[minValue, maxValue]}
              tickFormatter={formatUSD}
              tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
              axisLine={false}
              tickLine={false}
              width={46}
              tickCount={4}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--foreground)"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3, fill: 'var(--foreground)', strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="px-6 pt-4">
        <div className="mb-3 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          {formatPeriodLabel(range)}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-positive/8 px-3 py-3">
            <div className="text-[11px] font-medium uppercase tracking-widest text-positive/80">Money in</div>
            <div className="mt-1 text-sm font-semibold tabular-nums text-positive">
              {formatAmount(moneyIn, 'USD')}
            </div>
          </div>
          <div className="rounded-2xl bg-negative/8 px-3 py-3">
            <div className="text-[11px] font-medium uppercase tracking-widest text-negative/80">Money out</div>
            <div className="mt-1 text-sm font-semibold tabular-nums text-negative">
              -{formatAmount(moneyOut, 'USD')}
            </div>
          </div>
          <div
            className={cn(
              'rounded-2xl px-3 py-3',
              moneyDiff > 0
                ? 'bg-positive/8'
                : moneyDiff < 0
                  ? 'bg-negative/8'
                  : 'bg-muted'
            )}
          >
            <div
              className={cn(
                'text-[11px] font-medium uppercase tracking-widest',
                moneyDiff > 0
                  ? 'text-positive/80'
                  : moneyDiff < 0
                    ? 'text-negative/80'
                    : 'text-muted-foreground'
              )}
            >
              Diff
            </div>
            <div
              className={cn(
                'mt-1 text-sm font-semibold tabular-nums',
                moneyDiff > 0
                  ? 'text-positive'
                  : moneyDiff < 0
                    ? 'text-negative'
                    : 'text-foreground'
              )}
            >
              {moneyDiff > 0 ? '+' : ''}
              {formatAmount(moneyDiff, 'USD')}
            </div>
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="mx-6 mt-4 h-px bg-border" />
      <div className="flex flex-col gap-3 px-6 py-3">
        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Transactions
        </span>

        {recentTransactions.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card px-4 py-5 text-sm text-muted-foreground">
            No transactions yet.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            {recentTransactions.map((tx, index) => {
              const isPositive = tx.amount > 0

              return (
                <div
                  key={tx.id}
                  className={cn(
                    'flex items-start justify-between gap-3 px-4 py-3',
                    index !== recentTransactions.length - 1 && 'border-b border-border'
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-foreground">{tx.description}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                      <span>{tx.accountName}</span>
                      <span className="text-muted-foreground/30">·</span>
                      <span>{TYPE_LABEL[tx.type]}</span>
                      <span className="text-muted-foreground/30">·</span>
                      <span>{formatTimestamp(tx.timestamp)}</span>
                    </div>
                  </div>

                  <span className={cn('shrink-0 tabular-nums text-sm font-semibold', isPositive ? 'text-positive' : 'text-negative')}>
                    {isPositive ? '+' : '-'}{formatAmount(tx.amount, tx.currency)}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        <Link
          href="/transactions"
          className="flex cursor-pointer items-center justify-between rounded-2xl border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
        >
          <span>See more</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      </div>

      {/* Analysis */}
      <div className="mx-6 h-px bg-border" />
      <div className="flex flex-col gap-3 px-6 pb-4 pt-5">
        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Analysis
        </span>
        <span className="text-pretty text-sm leading-relaxed text-foreground">
          <TypewriterText text={aiText} speed={10} />
        </span>
      </div>
    </div>
  )
}
