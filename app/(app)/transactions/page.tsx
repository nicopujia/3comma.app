'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, X, SlidersHorizontal } from 'lucide-react'
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

  const [search, setSearch] = useState('')
  const [flowFilter] = useState<FlowFilter>('All')
  const [selectedTypes, setSelectedTypes] = useState<Set<Transaction['type']>>(new Set())
  const [selectedAccountIds, setSelectedAccountIds] = useState<Set<string>>(new Set())
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)

  const activeAccountIds = useMemo(() => new Set(accounts.map((a) => a.id)), [accounts])

  const filteredTxs = useMemo(() => {
    const q = search.toLowerCase().trim()
    const min = parseFloat(minAmount)
    const max = parseFloat(maxAmount)

    return transactions.filter((tx) => {
      if (!activeAccountIds.has(tx.accountId)) return false
      // Search
      if (q && !tx.description.toLowerCase().includes(q) && !tx.accountName.toLowerCase().includes(q)) return false
      // Flow
      if (flowFilter === 'Income' && tx.type !== 'inflow') return false
      if (flowFilter === 'Expenses' && tx.type !== 'outflow') return false
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
  }, [transactions, activeAccountIds, search, flowFilter, selectedTypes, selectedAccountIds, minAmount, maxAmount])

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
      const next = new Set(prev)
      next.has(t) ? next.delete(t) : next.add(t)
      return next
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
      <div className="flex items-center gap-3 border-b border-border px-4 pt-12 pb-3">
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

      {/* Results count */}
      <div className="px-6 py-3">
        <span className="text-xs text-muted-foreground tabular-nums">{filteredTxs.length} transaction{filteredTxs.length !== 1 ? 's' : ''}</span>
      </div>

      {/* List */}
      <div className="flex flex-1 flex-col">
        {filteredTxs.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 py-20">
            <p className="text-sm text-muted-foreground">No transactions match your filters</p>
            {(activeFilterCount > 0 || search || flowFilter !== 'All') && (
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
