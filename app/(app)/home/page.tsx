'use client'

import { useState } from 'react'
import NumberFlow from '@number-flow/react'
import { Eye, EyeOff, ExternalLink, ChevronDown, ChevronUp, Plus, DollarSign } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { toUSD } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

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

function CashDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const accounts = useAppStore((s) => s.accounts)
  const setCashBalance = useAppStore((s) => s.setCashBalance)
  const addCashTransaction = useAppStore((s) => s.addCashTransaction)

  const cashAccount = accounts.find((a) => a.id === 'manual-cash')
  const currentBalance = cashAccount?.balance ?? 0

  const [setAmount, setSetAmount] = useState(String(currentBalance))
  const [txDescription, setTxDescription] = useState('')
  const [txAmount, setTxAmount] = useState('')

  const handleSetBalance = () => {
    const val = parseFloat(setAmount)
    if (isNaN(val) || val < 0) return
    setCashBalance(val)
    toast('Cash balance updated')
    onClose()
  }

  const handleAddTransaction = (sign: 1 | -1) => {
    const val = parseFloat(txAmount)
    if (isNaN(val) || val <= 0) return
    addCashTransaction(txDescription, sign * val)
    toast(sign > 0 ? `+$${val.toFixed(2)} added` : `-$${val.toFixed(2)} recorded`)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Manual Cash</DialogTitle>
          <DialogDescription>Add a transaction or set your current cash balance</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="transaction" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="transaction" className="flex-1 cursor-pointer">Add transaction</TabsTrigger>
            <TabsTrigger value="set" className="flex-1 cursor-pointer">Set balance</TabsTrigger>
          </TabsList>

          <TabsContent value="transaction" className="flex flex-col gap-4 pt-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Description (optional)</Label>
              <Input
                placeholder="e.g. Coffee, lunch, ATM"
                value={txDescription}
                onChange={(e) => setTxDescription(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Amount (USD)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={txAmount}
                onChange={(e) => setTxAmount(e.target.value)}
                className="rounded-xl tabular-nums"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleAddTransaction(1)}
                className="flex-1 cursor-pointer rounded-xl bg-positive text-background hover:bg-positive/90"
              >
                <Plus className="h-4 w-4" />
                Received
              </Button>
              <Button
                onClick={() => handleAddTransaction(-1)}
                variant="outline"
                className="flex-1 cursor-pointer rounded-xl border-negative/30 text-negative hover:bg-negative/5"
              >
                Spent
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="set" className="flex flex-col gap-4 pt-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">
                Current balance: {formatBalance(currentBalance, 'USD')}
              </Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={setAmount}
                onChange={(e) => setSetAmount(e.target.value)}
                className="rounded-xl tabular-nums"
              />
            </div>
            <Button
              onClick={handleSetBalance}
              className="w-full cursor-pointer rounded-xl"
            >
              <DollarSign className="h-4 w-4" />
              Set balance
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export default function HomePage() {
  const accounts = useAppStore((s) => s.accounts)
  const toggleIncluded = useAppStore((s) => s.toggleIncluded)
  const totalLiquidityUSD = useAppStore((s) => s.totalLiquidityUSD)
  const [accountsOpen, setAccountsOpen] = useState(false)
  const [cashDialogOpen, setCashDialogOpen] = useState(false)

  const total = totalLiquidityUSD()

  const handleAccountTap = (account: (typeof accounts)[0]) => {
    if (account.id === 'manual-cash') {
      setCashDialogOpen(true)
      return
    }
    if (account.deepLink) {
      toast(`Opening ${account.name}...`, { duration: 2000 })
      setTimeout(() => window.open(account.deepLink, '_blank', 'noopener,noreferrer'), 300)
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
    <div className="flex flex-col">
      {/* Hero */}
      <div className="flex flex-col gap-1 px-6 pb-10 pt-16">
        <div className="flex items-end gap-0">
          <span className="mt-1 self-start pt-3 text-3xl font-light text-muted-foreground">$</span>
          <NumberFlow
            value={Math.round(total)}
            format={{ notation: 'standard', maximumFractionDigits: 0 }}
            className="text-[3.5rem] font-bold leading-none tracking-tight text-foreground tabular-nums"
          />
        </div>
      </div>

      {/* Divider */}
      <div className="mx-6 h-px bg-border" />

      {/* Collapsible accounts section */}
      <div className="flex flex-col">
        <button
          onClick={() => setAccountsOpen((v) => !v)}
          className="flex cursor-pointer items-center justify-between px-6 py-4 transition-colors hover:bg-muted/50"
        >
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Accounts
          </span>
          {accountsOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {accountsOpen && (
          <div className="flex flex-col">
            {accounts.map((account, i) => {
              const usdValue = toUSD(account.balance, account.currency)
              const percent =
                includedTotal > 0 && account.included
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
                    'flex cursor-pointer items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/50 active:bg-muted',
                    i !== accounts.length - 1 && 'border-b border-border'
                  )}
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
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
                          'tabular-nums text-xs transition-colors',
                          account.included ? 'text-muted-foreground' : 'text-muted-foreground/50'
                        )}
                      >
                        {formatBalance(account.balance, account.currency)}
                      </span>
                      {account.included && percent > 0 && (
                        <>
                          <span className="text-xs text-muted-foreground/30">·</span>
                          <span className="tabular-nums text-xs text-muted-foreground/70">
                            {formatPercent(percent)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    {account.deepLink && account.id !== 'manual-cash' && (
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/30" />
                    )}
                    <button
                      onClick={(e) => handleToggle(e, account.id)}
                      aria-label={account.included ? 'Exclude from total' : 'Include in total'}
                      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-muted active:bg-muted"
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
        )}
      </div>

      <CashDialog open={cashDialogOpen} onClose={() => setCashDialogOpen(false)} />
    </div>
  )
}
