'use client'

import { useState, useMemo } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { useAppStore } from '@/lib/store'
import { getHistoricalData, getAIExplanation, Transaction, toUSD } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const RANGES = ['1W', '1M', '3M', '6M', '1Y', 'ALL'] as const
type Range = (typeof RANGES)[number]

// Only show transactions that represent real cash flows (not internal trades/transfers)
type TxFilter = 'All' | 'Income' | 'Expenses'
const TX_FILTERS: TxFilter[] = ['All', 'Income', 'Expenses']

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
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(abs)
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(abs)
}

function formatTimestamp(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / 86_400_000)
  if (diffDays === 0)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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

// Transactions that represent real external cash flows
const INCOME_TYPES = new Set<Transaction['type']>(['deposit', 'sell'])
const EXPENSE_TYPES = new Set<Transaction['type']>(['payment', 'fee', 'withdrawal'])

function isRealFlow(tx: Transaction): boolean {
  return INCOME_TYPES.has(tx.type) || EXPENSE_TYPES.has(tx.type)
}

export default function AnalysisPage() {
  const [range, setRange] = useState<Range>('1M')
  const [txFilter, setTxFilter] = useState<TxFilter>('All')
  const accounts = useAppStore((s) => s.accounts)
  const transactions = useAppStore((s) => s.transactions)
  const totalLiquidityUSD = useAppStore((s) => s.totalLiquidityUSD)
  const total = totalLiquidityUSD()

  console.log('[v0] transactions in store:', transactions.length)
  console.log('[v0] first tx:', transactions[0])
  console.log('[v0] accounts in store:', accounts.length, accounts.map((a) => a.id))

  const historicalData = useMemo(() => getHistoricalData(accounts, range), [accounts, range])

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
    const count = range === '1W' ? 7 : range === '1M' ? 5 : 4
    const step = Math.max(1, Math.floor(chartData.length / count))
    return chartData.filter((_, i) => i % step === 0).map((d) => d.label)
  }, [chartData, range])

  const activeAccountIds = useMemo(() => new Set(accounts.map((a) => a.id)), [accounts])

  const filteredTxs = useMemo(() => {
    return transactions.filter((tx) => {
      if (!activeAccountIds.has(tx.accountId)) return false
      if (!isRealFlow(tx)) return false
      if (txFilter === 'Income') return INCOME_TYPES.has(tx.type)
      if (txFilter === 'Expenses') return EXPENSE_TYPES.has(tx.type)
      return true
    })
  }, [transactions, activeAccountIds, txFilter])

  const handleTxTap = (tx: Transaction) => {
    const account = accounts.find((a) => a.id === tx.accountId)
    if (account?.deepLink) {
      toast(`Opening ${tx.accountName}...`, { duration: 2000 })
      setTimeout(() => window.open(account.deepLink, '_blank', 'noopener,noreferrer'), 300)
    }
  }

  const TYPE_LABEL: Record<Transaction['type'], string> = {
    deposit: 'Deposit',
    withdrawal: 'Withdrawal',
    transfer: 'Transfer',
    trade: 'Trade',
    fee: 'Fee',
    payment: 'Payment',
    buy: 'Buy',
    sell: 'Sell',
  }

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
                : 'text-muted-foreground hover:text-foreground active:bg-muted'
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

      {/* Analysis text */}
      <div className="mx-6 mt-4 h-px bg-border" />
      <div className="flex flex-col gap-3 px-6 pt-5">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Analysis
        </p>
        <p className="text-pretty text-sm leading-relaxed text-foreground">{aiText}</p>
      </div>

      {/* Transactions */}
      <div className="mx-6 mt-6 h-px bg-border" />
      <div className="flex flex-col gap-0 pt-5">
        <div className="flex items-center justify-between px-6 pb-4">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Transactions
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto px-5 pb-4 no-scrollbar">
          {TX_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setTxFilter(f)}
              className={cn(
                'shrink-0 cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold transition-all',
                txFilter === f
                  ? 'bg-foreground text-background'
                  : 'bg-card text-muted-foreground hover:bg-muted active:bg-muted'
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {filteredTxs.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-12">
            <p className="text-sm text-muted-foreground">No transactions</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {filteredTxs.map((tx, i) => {
              const isPositive = tx.amount > 0
              return (
                <button
                  key={tx.id}
                  onClick={() => handleTxTap(tx)}
                  className={cn(
                    'flex cursor-pointer items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-muted/50 active:bg-muted',
                    i !== filteredTxs.length - 1 && 'border-b border-border'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold uppercase',
                      isPositive ? 'bg-positive/10 text-positive' : 'bg-negative/10 text-negative'
                    )}
                  >
                    {tx.type.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="truncate text-sm font-medium text-foreground">
                        {tx.description}
                      </span>
                      <span
                        className={cn(
                          'shrink-0 tabular-nums text-sm font-semibold',
                          isPositive ? 'text-positive' : 'text-negative'
                        )}
                      >
                        {isPositive ? '+' : '-'}
                        {formatAmount(tx.amount, tx.currency)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">{tx.accountName}</span>
                      <span className="text-xs text-muted-foreground/30">·</span>
                      <span className="text-xs text-muted-foreground/60">{TYPE_LABEL[tx.type]}</span>
                      <span className="text-xs text-muted-foreground/30">·</span>
                      <span className="text-xs text-muted-foreground/50">
                        {formatTimestamp(tx.timestamp)}
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
