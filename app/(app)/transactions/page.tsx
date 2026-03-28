'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, X, SlidersHorizontal } from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts'
import { useAppStore } from '@/lib/store'
import { Transaction, toUSD } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'

const TYPE_LABEL: Record<Transaction['type'], string> = {
  inflow: 'Money in',
  outflow: 'Money out',
}

const RANGES = ['1W', '1M', '3M', '6M', '1Y', 'ALL'] as const
type Range = (typeof RANGES)[number]

function formatCompactUSD(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `$${(value / 1_000).toFixed(0)}k`
  return `$${value.toFixed(0)}`
}

function formatUSD(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function startOfDay(date: Date): Date {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

function startOfWeek(date: Date): Date {
  const next = startOfDay(date)
  const day = next.getDay()
  const diff = day === 0 ? -6 : 1 - day
  next.setDate(next.getDate() + diff)
  return next
}

function startOfMonth(date: Date): Date {
  const next = startOfDay(date)
  next.setDate(1)
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

function getBucketStart(date: Date, range: Range): Date {
  if (range === '1W' || range === '1M') return startOfDay(date)
  if (range === '3M' || range === '6M') return startOfWeek(date)
  return startOfMonth(date)
}

function formatBucketLabel(date: Date, range: Range): string {
  if (range === '1W') return date.toLocaleDateString('en-US', { weekday: 'short' })
  if (range === '1M') return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  if (range === '3M' || range === '6M') return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

function formatRangeCaption(range: Range): string {
  if (range === '1W') return 'last 7 days'
  if (range === '1M') return 'last 30 days'
  if (range === '3M') return 'last 3 months'
  if (range === '6M') return 'last 6 months'
  if (range === '1Y') return 'last 12 months'
  return 'all time'
}

interface CashflowTooltipProps {
  active?: boolean
  payload?: Array<{
    dataKey?: string
    value?: number
    color?: string
    payload?: { label: string }
  }>
}

function CashflowTooltip({ active, payload }: CashflowTooltipProps) {
  if (!active || !payload?.length) return null

  const label = payload[0]?.payload?.label
  const inflow = payload.find((item) => item.dataKey === 'inflow')?.value ?? 0
  const outflow = payload.find((item) => item.dataKey === 'outflow')?.value ?? 0

  return (
    <div className="rounded-xl border border-border bg-background px-3 py-2 shadow-xl">
      <p className="text-xs font-medium text-foreground">{label}</p>
      <div className="mt-2 space-y-1 text-xs tabular-nums">
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Money in</span>
          <span className="font-semibold text-positive">{formatUSD(inflow)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Money out</span>
          <span className="font-semibold text-negative">-{formatUSD(outflow)}</span>
        </div>
      </div>
    </div>
  )
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

function EditCashTxDialog({ tx, onClose }: { tx: Transaction | null; onClose: () => void }) {
  const updateCashTransaction = useAppStore((s) => s.updateCashTransaction)
  const [description, setDescription] = useState(tx?.description ?? '')
  const [amount, setAmount] = useState(tx ? String(Math.abs(tx.amount)) : '')
  const sign = tx && tx.amount < 0 ? -1 : 1
  if (!tx) return null
  const handleSave = () => {
    const val = parseFloat(amount)
    if (isNaN(val) || val <= 0) return
    updateCashTransaction(tx.id, description, sign * val)
    toast('Transaction updated')
    onClose()
  }
  return (
    <Dialog open={!!tx} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Edit Transaction</DialogTitle>
          <DialogDescription>Update this cash transaction</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-1">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Description</Label>
            <Input placeholder="e.g. Coffee, ATM" value={description} onChange={(e) => setDescription(e.target.value)} className="rounded-xl" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Amount (USD) — {sign > 0 ? 'received' : 'spent'}</Label>
            <Input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="rounded-xl tabular-nums" />
          </div>
          <Button onClick={handleSave} className="w-full cursor-pointer rounded-xl">Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function TransactionsPage() {
  const accounts = useAppStore((s) => s.accounts)
  const transactions = useAppStore((s) => s.transactions)

  const [range, setRange] = useState<Range>('1M')
  const [search, setSearch] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<Set<Transaction['type']>>(new Set())
  const [selectedAccountIds, setSelectedAccountIds] = useState<Set<string>>(new Set())
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)

  const activeAccountIds = useMemo(() => new Set(accounts.map((a) => a.id)), [accounts])
  const rangeStart = useMemo(() => getRangeStart(range), [range])

  const filteredTxs = useMemo(() => {
    const q = search.toLowerCase().trim()
    const min = parseFloat(minAmount)
    const max = parseFloat(maxAmount)

    return transactions.filter((tx) => {
      if (!activeAccountIds.has(tx.accountId)) return false
      const txDate = tx.timestamp instanceof Date ? tx.timestamp : new Date(tx.timestamp)
      if (rangeStart && txDate < rangeStart) return false
      // Search
      if (q && !tx.description.toLowerCase().includes(q) && !tx.accountName.toLowerCase().includes(q)) return false
      // Types
      if (selectedTypes.size > 0 && !selectedTypes.has(tx.type)) return false
      // Accounts
      if (selectedAccountIds.size > 0 && !selectedAccountIds.has(tx.accountId)) return false
      // Amount range (USD)
      const absUsd = Math.abs(toUSD(tx.amount, tx.currency))
      if (!isNaN(min) && absUsd < min) return false
      if (!isNaN(max) && absUsd > max) return false
      return true
    })
  }, [transactions, activeAccountIds, rangeStart, search, selectedTypes, selectedAccountIds, minAmount, maxAmount])

  const cashflowData = useMemo(() => {
    const buckets = new Map<string, { date: Date; label: string; inflow: number; outflow: number }>()

    for (const tx of filteredTxs) {
      const txDate = tx.timestamp instanceof Date ? tx.timestamp : new Date(tx.timestamp)
      const bucketDate = getBucketStart(txDate, range)
      const key = bucketDate.toISOString()
      const usdAmount = Math.abs(toUSD(tx.amount, tx.currency))
      const existing = buckets.get(key) ?? {
        date: bucketDate,
        label: formatBucketLabel(bucketDate, range),
        inflow: 0,
        outflow: 0,
      }

      if (tx.type === 'inflow') {
        existing.inflow += usdAmount
      } else {
        existing.outflow += usdAmount
      }

      buckets.set(key, existing)
    }

    return [...buckets.values()]
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map((bucket) => ({
        ...bucket,
        net: bucket.inflow - bucket.outflow,
      }))
  }, [filteredTxs, range])

  const moneyIn = useMemo(
    () => filteredTxs.reduce((sum, tx) => sum + (tx.type === 'inflow' ? Math.abs(toUSD(tx.amount, tx.currency)) : 0), 0),
    [filteredTxs]
  )

  const moneyOut = useMemo(
    () => filteredTxs.reduce((sum, tx) => sum + (tx.type === 'outflow' ? Math.abs(toUSD(tx.amount, tx.currency)) : 0), 0),
    [filteredTxs]
  )

  const chartTicks = useMemo(() => {
    const tickCount = range === '1W' ? 7 : range === '1M' ? 5 : 4
    const step = Math.max(1, Math.floor(cashflowData.length / tickCount))
    return cashflowData.filter((_, index) => index % step === 0).map((item) => item.label)
  }, [cashflowData, range])

  const handleTxTap = (tx: Transaction) => {
    if (tx.accountId === 'manual-cash') { setEditingTx(tx); return }
    const account = accounts.find((a) => a.id === tx.accountId)
    if (account?.deepLink) {
      toast(`Opening ${tx.accountName}...`, { duration: 2000 })
      setTimeout(() => window.open(account.deepLink, '_blank', 'noopener,noreferrer'), 300)
    }
  }

  const toggleType = (t: Transaction['type']) => {
    setSelectedTypes((prev) => {
      if (prev.has(t)) return new Set()
      return new Set([t])
    })
  }

  const toggleAccount = (id: string) => {
    setSelectedAccountIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const activeFilterCount = selectedTypes.size + selectedAccountIds.size + (minAmount ? 1 : 0) + (maxAmount ? 1 : 0)

  const clearFilters = () => {
    setSelectedTypes(new Set())
    setSelectedAccountIds(new Set())
    setMinAmount('')
    setMaxAmount('')
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background animate-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 pt-4 pb-3">
        <Link
          href="/analysis"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-muted"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </Link>
        <span className="text-base font-semibold text-foreground">Transactions</span>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setFiltersOpen(true)}
            className={cn(
              'flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors',
              activeFilterCount > 0
                ? 'bg-foreground text-background'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
            {activeFilterCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-background/20 text-[10px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="border-b border-border px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl pl-9 pr-9 text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="border-b border-border px-4 py-4">
        <div className="flex items-center gap-1 rounded-2xl bg-muted p-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                'flex-1 cursor-pointer rounded-xl py-2 text-[11px] font-semibold transition-all',
                range === r
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="mt-4 overflow-hidden rounded-3xl border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Cash flow</div>
            <div className="mt-1 text-sm text-muted-foreground">Money in vs money out for the {formatRangeCaption(range)}</div>
          </div>

          {cashflowData.length === 0 ? (
            <div className="flex h-[220px] items-center justify-center px-6 text-center text-sm text-muted-foreground">
              No transactions in this period.
            </div>
          ) : (
            <>
              <div className="px-2 pt-3">
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={cashflowData} margin={{ top: 8, right: 6, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="0" stroke="var(--border)" strokeOpacity={0.45} vertical={false} />
                    <XAxis
                      dataKey="label"
                      ticks={chartTicks}
                      tick={{ fontSize: 10, fill: 'var(--muted-foreground)', dy: 6 }}
                      axisLine={false}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tickFormatter={formatCompactUSD}
                      tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                      axisLine={false}
                      tickLine={false}
                      width={46}
                    />
                    <ReferenceLine y={0} stroke="var(--border)" strokeOpacity={0.75} />
                    <Tooltip content={<CashflowTooltip />} cursor={{ fill: 'var(--muted)', fillOpacity: 0.2 }} />
                    <Bar dataKey="inflow" fill="var(--color-positive)" radius={[6, 6, 0, 0]} maxBarSize={24} />
                    <Bar dataKey="outflow" fill="var(--color-negative)" radius={[6, 6, 0, 0]} maxBarSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-border px-4 py-4">
                <div className="rounded-2xl bg-positive/8 px-4 py-3">
                  <div className="text-[11px] font-medium uppercase tracking-widest text-positive/80">Money in</div>
                  <div className="mt-1 text-lg font-semibold tabular-nums text-positive">{formatUSD(moneyIn)}</div>
                </div>
                <div className="rounded-2xl bg-negative/8 px-4 py-3">
                  <div className="text-[11px] font-medium uppercase tracking-widest text-negative/80">Money out</div>
                  <div className="mt-1 text-lg font-semibold tabular-nums text-negative">-{formatUSD(moneyOut)}</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Results count */}
      <div className="px-6 py-3">
        <span className="text-xs text-muted-foreground tabular-nums">{filteredTxs.length} transaction{filteredTxs.length !== 1 ? 's' : ''}</span>
      </div>

      {/* List */}
      <div className="flex flex-1 flex-col">
        {filteredTxs.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 py-20">
            <p className="text-sm text-muted-foreground">No transactions match your filters</p>
            {(activeFilterCount > 0 || search) && (
              <button onClick={clearFilters} className="cursor-pointer text-xs text-foreground underline underline-offset-2">
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          filteredTxs.map((tx, i) => {
            const isPositive = tx.amount > 0
            const account = accounts.find((a) => a.id === tx.accountId)
            const accountInitial = account?.name.charAt(0).toUpperCase() ?? 'A'
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
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold uppercase"
                  style={{ backgroundColor: (account?.color ?? '#666') + '33', color: account?.color ?? '#666' }}
                >
                  {accountInitial}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="truncate text-sm font-medium text-foreground">{tx.description}</span>
                    <span className={cn('shrink-0 tabular-nums text-sm font-semibold', isPositive ? 'text-positive' : 'text-negative')}>
                      {isPositive ? '+' : '-'}{formatAmount(tx.amount, tx.currency)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">{tx.accountName}</span>
                    <span className="text-xs text-muted-foreground/30">·</span>
                    <span className="text-xs text-muted-foreground/60">{TYPE_LABEL[tx.type]}</span>
                    <span className="text-xs text-muted-foreground/30">·</span>
                    <span className="text-xs text-muted-foreground/50">{formatTimestamp(tx.timestamp)}</span>
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>

      {/* Filter sheet */}
      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent side="bottom" className="max-h-[80dvh] rounded-t-2xl px-0 pb-safe overflow-y-auto">
          <SheetHeader className="px-6 pb-4">
            <SheetTitle className="text-base font-semibold">Filters</SheetTitle>
            <SheetDescription className="sr-only">Filter transactions by type, account, and amount</SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-6 px-6 pb-6">
            {/* Amount range */}
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Amount (USD)</p>
              <div className="flex items-center gap-3">
                <Input type="number" min="0" placeholder="Min" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} className="rounded-xl tabular-nums" />
                <span className="text-muted-foreground">–</span>
                <Input type="number" min="0" placeholder="Max" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} className="rounded-xl tabular-nums" />
              </div>
            </div>

            {/* Transaction types */}
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Type</p>
              <div className="flex flex-wrap gap-2">
                {(['inflow', 'outflow'] as Transaction['type'][]).map((t) => (
                  <button
                    key={t}
                    onClick={() => toggleType(t)}
                    className={cn(
                      'cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold transition-all',
                      selectedTypes.has(t)
                        ? 'bg-foreground text-background'
                        : 'bg-muted text-muted-foreground hover:bg-muted/60'
                    )}
                  >
                    {TYPE_LABEL[t]}
                  </button>
                ))}
              </div>
            </div>

            {/* Accounts */}
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Account</p>
              <div className="flex flex-wrap gap-2">
                {accounts.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => toggleAccount(a.id)}
                    className={cn(
                      'cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold transition-all',
                      selectedAccountIds.has(a.id)
                        ? 'bg-foreground text-background'
                        : 'bg-muted text-muted-foreground hover:bg-muted/60'
                    )}
                  >
                    {a.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {activeFilterCount > 0 && (
                <Button variant="outline" onClick={clearFilters} className="flex-1 cursor-pointer rounded-xl">
                  Clear all
                </Button>
              )}
              <Button onClick={() => setFiltersOpen(false)} className="flex-1 cursor-pointer rounded-xl">
                Show {filteredTxs.length} result{filteredTxs.length !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <EditCashTxDialog tx={editingTx} onClose={() => setEditingTx(null)} />
    </div>
  )
}
