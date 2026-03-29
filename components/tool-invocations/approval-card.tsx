'use client'

import { cn } from '@/lib/utils'

const TOOL_LABELS: Record<string, string> = {
  executeTrade: 'Trade',
  internalTransfer: 'Transfer',
  roboadvisorDeposit: 'Robo Advisor Deposit',
  roboadvisorWithdraw: 'Robo Advisor Withdrawal',
  updateCardStatus: 'Card Update',
}

function formatParamValue(value: unknown): string {
  if (typeof value === 'number') {
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  return String(value)
}

const DISPLAY_PARAMS: Record<string, Record<string, string>> = {
  executeTrade: { symbol: 'Symbol', direction: 'Direction', order_type: 'Order Type', amount_usd: 'Amount (USD)', shares: 'Shares', limit_price: 'Limit Price', stop_price: 'Stop Price', time_in_force: 'Time in Force' },
  internalTransfer: { from: 'From', to: 'To', amount: 'Amount (USD)' },
  roboadvisorDeposit: { robo_advisor_id: 'Portfolio ID', amount: 'Amount (USD)', from: 'Source' },
  roboadvisorWithdraw: { robo_advisor_id: 'Portfolio ID', amount: 'Amount (USD)', to: 'Destination' },
  updateCardStatus: { cardUuid: 'Card', status: 'New Status' },
}

interface ApprovalCardProps {
  toolName: string
  input: Record<string, unknown>
  onApprove: () => void
  onDeny: () => void
  disabled?: boolean
}

export function ApprovalCard({ toolName, input, onApprove, onDeny, disabled }: ApprovalCardProps) {
  const label = TOOL_LABELS[toolName] || toolName
  const paramLabels = DISPLAY_PARAMS[toolName] || {}

  const displayEntries = Object.entries(input).filter(
    ([key, value]) => value !== undefined && value !== null && key in paramLabels,
  )

  return (
    <div className="my-2 overflow-hidden rounded-xl border border-border bg-background p-3">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        Confirm {label}
      </p>
      <div className="mb-3 space-y-1">
        {displayEntries.map(([key, value]) => (
          <div key={key} className="flex items-center justify-between gap-2 text-xs">
            <span className="text-muted-foreground">{paramLabels[key] || key}</span>
            <span className="font-medium tabular-nums">{formatParamValue(value)}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={onDeny}
          disabled={disabled}
          className={cn(
            'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
            'text-muted-foreground hover:bg-muted',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          Cancel
        </button>
        <button
          onClick={onApprove}
          disabled={disabled}
          className={cn(
            'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
            'bg-foreground text-background hover:opacity-80',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          Confirm
        </button>
      </div>
    </div>
  )
}
