'use client'

import { Loader2, X } from 'lucide-react'
import { ApprovalCard } from './approval-card'
import {
  BalanceCard,
  PortfolioCard,
  TransactionListCard,
  TradeConfirmationCard,
  TransferConfirmationCard,
  AccountDetailsCard,
  WalletsCard,
  AssetCard,
  AssetListCard,
  RoboadvisorCard,
  RoboadvisorTxCard,
  CardsListCard,
  CardStatusCard,
} from './tool-result-cards'

const TOOL_LOADING_LABELS: Record<string, string> = {
  getCheckingBalance: 'Checking balance…',
  getStockPortfolio: 'Loading portfolio…',
  getWallbitTransactions: 'Fetching transactions…',
  getAccountDetails: 'Getting account details…',
  getWallets: 'Loading wallets…',
  getAssetInfo: 'Looking up asset…',
  searchAssets: 'Searching assets…',
  getRoboadvisorBalance: 'Loading robo advisor…',
  getCards: 'Fetching cards…',
  executeTrade: 'Executing trade…',
  internalTransfer: 'Processing transfer…',
  roboadvisorDeposit: 'Processing deposit…',
  roboadvisorWithdraw: 'Processing withdrawal…',
  updateCardStatus: 'Updating card…',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderOutput(toolName: string, output: any) {
  switch (toolName) {
    case 'getCheckingBalance':
      return <BalanceCard balances={output.balances} />
    case 'getStockPortfolio':
      return <PortfolioCard positions={output.positions} />
    case 'getWallbitTransactions':
      return <TransactionListCard data={output.data} count={output.count} current_page={output.current_page} pages={output.pages} />
    case 'executeTrade':
      return <TradeConfirmationCard trade={output.trade} />
    case 'internalTransfer':
      return <TransferConfirmationCard transaction={output.transaction} />
    case 'getAccountDetails':
      return <AccountDetailsCard details={output.details} />
    case 'getWallets':
      return <WalletsCard wallets={output.wallets} />
    case 'getAssetInfo':
      return <AssetCard asset={output.asset} />
    case 'searchAssets':
      return <AssetListCard data={output.data} count={output.count} />
    case 'getRoboadvisorBalance':
      return <RoboadvisorCard portfolios={output.portfolios} />
    case 'roboadvisorDeposit':
    case 'roboadvisorWithdraw':
      return <RoboadvisorTxCard transaction={output.transaction} />
    case 'getCards':
      return <CardsListCard cards={output.cards} />
    case 'updateCardStatus':
      return <CardStatusCard card={output.card} />
    default:
      return <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(output, null, 2)}</pre>
  }
}

interface ToolInvocationProps {
  toolName: string
  state: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  input?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  output?: any
  errorText?: string
  approval?: { id: string; approved?: boolean }
  onApprove?: (id: string) => void
  onDeny?: (id: string) => void
  isStreaming?: boolean
}

export function ToolInvocation({
  toolName,
  state,
  input,
  output,
  errorText,
  approval,
  onApprove,
  onDeny,
  isStreaming,
}: ToolInvocationProps) {
  // Loading states
  if (state === 'input-streaming' || state === 'input-available') {
    return (
      <div className="my-1.5 flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        {TOOL_LOADING_LABELS[toolName] || 'Working…'}
      </div>
    )
  }

  // Approval requested
  if (state === 'approval-requested' && approval) {
    return (
      <ApprovalCard
        toolName={toolName}
        input={input || {}}
        onApprove={() => onApprove?.(approval.id)}
        onDeny={() => onDeny?.(approval.id)}
        disabled={isStreaming}
      />
    )
  }

  // Approval responded but not yet executed (waiting for server)
  if (state === 'approval-responded') {
    return (
      <div className="my-1.5 flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        {TOOL_LOADING_LABELS[toolName] || 'Processing…'}
      </div>
    )
  }

  // Output available
  if (state === 'output-available' && output) {
    return (
      <div className="my-2 overflow-hidden rounded-xl border border-border/50 bg-background p-3">
        {renderOutput(toolName, output)}
      </div>
    )
  }

  // Denied
  if (state === 'output-denied') {
    return (
      <div className="my-1.5 flex items-center gap-2 text-xs text-muted-foreground">
        <X className="h-3 w-3" />
        Action cancelled.
      </div>
    )
  }

  // Error
  if (state === 'output-error') {
    return (
      <div className="my-1.5 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
        {errorText || 'Something went wrong.'}
      </div>
    )
  }

  return null
}
