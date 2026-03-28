'use client'

import { useState, useMemo } from 'react'
import { useAppStore } from '@/lib/store'
import { Transaction, toUSD } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type Filter = 'All' | 'Income' | 'Expense' | 'Transfer' | 'Trade'

const FILTERS: Filter[] = ['All', 'Income', 'Expense', 'Transfer', 'Trade']

const TYPE_TO_FILTER: Record<Transaction['type'], Filter> = {
  deposit: 'Income',
  withdrawal: 'Expense',
  payment: 'Expense',
  fee: 'Expense',
  transfer: 'Transfer',
  trade: 'Trade',
  buy: 'Trade',
  sell: 'Trade',
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

  if (diffDays === 0) {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function TransactionsView() {
  const [filter, setFilter] = useState<Filter>('All')
  const transactions = useAppStore((s) => s.transactions)
  const accounts = useAppStore((s) => s.accounts)

  const activeAccountIds = useMemo(() => new Set(accounts.map((a) => a.id)), [accounts])

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (!activeAccountIds.has(tx.accountId)) return false
      if (filter === 'All') return true
      return TYPE_TO_FILTER[tx.type] === filter
    })
  }, [transactions, activeAccountIds, filter])

  const handleTxTap = (tx: Transaction) => {
    const account = accounts.find((a) => a.id === tx.accountId)
    if (account?.deepLink) {
      toast(`Opening transaction in ${tx.accountName}...`, {
        duration: 2000,
      })
      setTimeout(() => {
        window.open(account.deepLink, '_blank', 'noopener,noreferrer')
      }, 300)
    }
  }

  return (
    <div className="flex flex-col pb-24 pt-12">
      {/* Filter bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto px-5 pb-5 no-scrollbar">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all',
              filter === f
                ? 'bg-foreground text-background'
                : 'bg-card text-muted-foreground active:bg-muted'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Transaction list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-6 py-16">
          <p className="text-sm text-muted-foreground">No transactions</p>
        </div>
      ) : (
        <div className="flex flex-col">
          {filtered.map((tx, i) => {
            const isPositive = tx.amount > 0
            return (
              <button
                key={tx.id}
                onClick={() => handleTxTap(tx)}
                className={cn(
                  'flex items-center gap-4 px-6 py-4 text-left transition-colors active:bg-muted',
                  i !== filtered.length - 1 && 'border-b border-border'
                )}
              >
                {/* Type indicator */}
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold uppercase',
                    isPositive
                      ? 'bg-positive/10 text-positive'
                      : 'bg-negative/10 text-negative'
                  )}
                >
                  {tx.type.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium text-foreground truncate">
                      {tx.description}
                    </span>
                    <span
                      className={cn(
                        'shrink-0 text-sm font-semibold tabular-nums',
                        isPositive ? 'text-positive' : 'text-negative'
                      )}
                    >
                      {isPositive ? '+' : '-'}
                      {formatAmount(tx.amount, tx.currency)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">{tx.accountName}</span>
                    <span className="text-muted-foreground/30 text-xs">·</span>
                    <span className="text-xs text-muted-foreground/60">
                      {TYPE_LABEL[tx.type]}
                    </span>
                    <span className="text-muted-foreground/30 text-xs">·</span>
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
  )
}
