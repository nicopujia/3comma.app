'use client'

import type {
  CheckingBalance,
  StockPosition,
  WallbitTransaction,
  Trade,
  AccountDetails,
  Wallet,
  Asset,
  RoboAdvisorPortfolio,
  RoboAdvisorTransaction,
  Card,
} from '@/lib/wallbit/types'

function formatUSD(value: number): string {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  )
}

export function BalanceCard({ balances }: { balances: CheckingBalance[] }) {
  if (!balances.length) return <p className="text-xs text-muted-foreground">No balances found.</p>
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Checking Balance</p>
      {balances.map((b) => (
        <Row key={b.currency} label={b.currency} value={formatUSD(b.balance)} />
      ))}
    </div>
  )
}

export function PortfolioCard({ positions }: { positions: StockPosition[] }) {
  if (!positions.length) return <p className="text-xs text-muted-foreground">Portfolio is empty.</p>
  const stocks = positions.filter((p) => p.symbol !== 'USD')
  const cash = positions.find((p) => p.symbol === 'USD')
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Investment Portfolio</p>
      {cash && <Row label="Cash (USD)" value={formatUSD(cash.shares)} />}
      {stocks.map((p) => (
        <Row key={p.symbol} label={p.symbol} value={`${p.shares.toLocaleString('en-US', { maximumFractionDigits: 4 })} shares`} />
      ))}
    </div>
  )
}

export function TransactionListCard({ data, count, current_page, pages }: { data: WallbitTransaction[]; count: number; current_page: number; pages: number }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        Transactions ({count} total, page {current_page}/{pages})
      </p>
      {data.slice(0, 10).map((tx) => (
        <div key={tx.uuid} className="flex items-center justify-between gap-2 text-xs">
          <div className="min-w-0 flex-1">
            <span className="truncate text-foreground">{tx.external_address || tx.type_id}</span>
            <span className="ml-1.5 text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</span>
          </div>
          <div className="shrink-0 tabular-nums font-medium">
            {formatUSD(tx.dest_amount)} {tx.dest_currency.code}
          </div>
        </div>
      ))}
    </div>
  )
}

export function TradeConfirmationCard({ trade }: { trade: Trade }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Trade Executed</p>
      <Row label="Symbol" value={trade.symbol} />
      <Row label="Direction" value={trade.direction} />
      <Row label="Order Type" value={trade.order_type} />
      {trade.amount > 0 && <Row label="Amount" value={formatUSD(trade.amount)} />}
      {trade.shares > 0 && <Row label="Shares" value={trade.shares.toLocaleString('en-US', { maximumFractionDigits: 7 })} />}
      <Row label="Status" value={trade.status} />
    </div>
  )
}

export function TransferConfirmationCard({ transaction }: { transaction: WallbitTransaction }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Transfer Complete</p>
      <Row label="Amount" value={`${formatUSD(transaction.source_amount)} ${transaction.source_currency.code}`} />
      <Row label="Status" value={transaction.status} />
    </div>
  )
}

export function AccountDetailsCard({ details }: { details: AccountDetails }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Bank Account Details</p>
      <Row label="Bank" value={details.bank_name} />
      <Row label="Holder" value={details.holder_name} />
      <Row label="Currency" value={details.currency} />
      {details.account_number && <Row label="Account #" value={details.account_number} />}
      {details.routing_number && <Row label="Routing #" value={details.routing_number} />}
      {details.iban && <Row label="IBAN" value={details.iban} />}
      {details.swift_code && <Row label="SWIFT" value={details.swift_code} />}
    </div>
  )
}

export function WalletsCard({ wallets }: { wallets: Wallet[] }) {
  if (!wallets.length) return <p className="text-xs text-muted-foreground">No wallets found.</p>
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Crypto Wallets</p>
      {wallets.map((w, i) => (
        <div key={i} className="text-xs">
          <span className="font-medium">{w.currency_code}</span>
          <span className="ml-1 text-muted-foreground">({w.network})</span>
          <p className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">{w.address}</p>
        </div>
      ))}
    </div>
  )
}

export function AssetCard({ asset }: { asset: Asset }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{asset.name} ({asset.symbol})</p>
      <Row label="Price" value={formatUSD(asset.price)} />
      {asset.sector && <Row label="Sector" value={asset.sector} />}
      {asset.exchange && <Row label="Exchange" value={asset.exchange} />}
      {asset.market_cap_m && <Row label="Market Cap" value={`$${(Number(asset.market_cap_m) / 1000).toFixed(0)}B`} />}
      {asset.dividend?.yield != null && <Row label="Dividend Yield" value={`${asset.dividend.yield.toFixed(2)}%`} />}
    </div>
  )
}

export function AssetListCard({ data, count }: { data: Asset[]; count: number }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Assets ({count} found)</p>
      {data.slice(0, 10).map((a) => (
        <div key={a.symbol} className="flex items-center justify-between gap-2 text-xs">
          <span className="font-medium">{a.symbol}</span>
          <span className="text-muted-foreground">{a.name}</span>
          <span className="ml-auto shrink-0 tabular-nums font-medium">{formatUSD(a.price)}</span>
        </div>
      ))}
    </div>
  )
}

export function RoboadvisorCard({ portfolios }: { portfolios: RoboAdvisorPortfolio[] }) {
  if (!portfolios.length) return <p className="text-xs text-muted-foreground">No robo advisor portfolios.</p>
  return (
    <div className="space-y-3">
      {portfolios.map((p) => (
        <div key={p.id} className="space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {p.label || p.portfolio_type} {p.category ? `(${p.category})` : ''}
          </p>
          <Row label="Balance" value={formatUSD(p.balance)} />
          <Row label="Securities" value={formatUSD(p.portfolio_value)} />
          <Row label="Cash" value={formatUSD(p.cash)} />
          {p.risk_profile && <Row label="Risk" value={p.risk_profile.name} />}
          <Row label="Net Profit" value={formatUSD(p.performance.net_profits)} />
          {p.assets.slice(0, 5).map((a) => (
            <Row key={a.symbol} label={`  ${a.symbol}`} value={`${a.weight.toFixed(0)}% — ${formatUSD(a.market_value)}`} />
          ))}
        </div>
      ))}
    </div>
  )
}

export function RoboadvisorTxCard({ transaction }: { transaction: RoboAdvisorTransaction }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {transaction.type === 'ROBOADVISOR_DEPOSIT' ? 'Deposit' : 'Withdrawal'} Initiated
      </p>
      <Row label="Amount" value={formatUSD(transaction.amount)} />
      <Row label="Status" value={transaction.status} />
    </div>
  )
}

export function CardsListCard({ cards }: { cards: Card[] }) {
  if (!cards.length) return <p className="text-xs text-muted-foreground">No cards found.</p>
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Cards</p>
      {cards.map((c) => (
        <div key={c.uuid} className="flex items-center justify-between gap-2 text-xs">
          <span className="font-medium">{c.card_network} •••• {c.card_last4}</span>
          <span className="text-muted-foreground">{c.card_type}</span>
          <span className={`ml-auto shrink-0 text-[10px] font-semibold uppercase ${c.status === 'ACTIVE' ? 'text-green-500' : 'text-red-400'}`}>
            {c.status}
          </span>
        </div>
      ))}
    </div>
  )
}

export function CardStatusCard({ card }: { card: { uuid: string; status: string } }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Card Updated</p>
      <Row label="Status" value={card.status} />
    </div>
  )
}
