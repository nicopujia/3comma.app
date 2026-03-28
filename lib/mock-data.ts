export type AccountType = 'bank' | 'crypto' | 'investment' | 'cash'
export type Currency = 'USD' | 'ARS'

export interface Account {
  id: string
  name: string
  type: AccountType
  currency: Currency
  balance: number
  included: boolean
  deepLink: string
  color: string
}

export interface Transaction {
  id: string
  accountId: string
  accountName: string
  description: string
  amount: number
  currency: Currency
  type: 'inflow' | 'outflow'
  timestamp: Date
}

export interface HistoricalPoint {
  date: Date
  value: number
}

// FX rate: ARS per USD
export const FX_ARS_USD = 1025

export const ALL_ACCOUNTS: Account[] = [
  {
    id: 'wallbit',
    name: 'Wallbit',
    type: 'bank',
    currency: 'USD',
    balance: 12480.5,
    included: true,
    deepLink: 'https://wallbit.io',
    color: '#1a1a1a',
  },
  {
    id: 'grabrfi',
    name: 'GrabrFi',
    type: 'bank',
    currency: 'USD',
    balance: 8330.0,
    included: true,
    deepLink: 'https://grabrfi.com',
    color: '#2d2d2d',
  },
  {
    id: 'wise',
    name: 'Wise',
    type: 'bank',
    currency: 'USD',
    balance: 4210.75,
    included: true,
    deepLink: 'https://wise.com',
    color: '#3a3a3a',
  },
  {
    id: 'brubank',
    name: 'Brubank',
    type: 'bank',
    currency: 'ARS',
    balance: 2_800_000,
    included: true,
    deepLink: 'https://brubank.com',
    color: '#4a4a4a',
  },
  {
    id: 'binance',
    name: 'Binance',
    type: 'crypto',
    currency: 'USD',
    balance: 6750.0,
    included: true,
    deepLink: 'https://binance.com',
    color: '#5a5a5a',
  },
  {
    id: 'ibkr',
    name: 'IBKR',
    type: 'investment',
    currency: 'USD',
    balance: 38200.0,
    included: false,
    deepLink: 'https://ibkr.com',
    color: '#6a6a6a',
  },
  {
    id: 'manual-cash',
    name: 'Cash',
    type: 'cash',
    currency: 'USD',
    balance: 1200.0,
    included: true,
    deepLink: '',
    color: '#7a7a7a',
  },
]

// Convert any balance to USD
export function toUSD(balance: number, currency: Currency): number {
  if (currency === 'USD') return balance
  return balance / FX_ARS_USD
}

// Generate historical data for an account subset
export function generateHistoricalData(
  accounts: Account[],
  days: number
): HistoricalPoint[] {
  const now = new Date()
  const points: HistoricalPoint[] = []

  const baseTotal = accounts
    .filter((a) => a.included)
    .reduce((sum, a) => sum + toUSD(a.balance, a.currency), 0)

  for (let i = days; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    const progress = (days - i) / days
    const trend = 1 - progress * 0.08
    const noise = (Math.random() - 0.5) * 0.04
    const cryptoSwing = Math.sin(i * 0.3) * 0.02
    const value = baseTotal * (trend + noise + cryptoSwing)

    points.push({ date, value: Math.max(0, value) })
  }

  return points
}

const RANGE_DAYS: Record<string, number> = {
  '1W': 7,
  '1M': 30,
  '3M': 90,
  '6M': 180,
  '1Y': 365,
  ALL: 730,
}

export function getHistoricalData(
  accounts: Account[],
  range: string
): HistoricalPoint[] {
  const days = RANGE_DAYS[range] ?? 30
  return generateHistoricalData(accounts, days)
}

export function getAIExplanation(range: string, total: number): string {
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(n)

  const explanations: Record<string, string> = {
    '1W': `Your total stayed close to ${fmt(total)} this week. Crypto prices caused small ups and downs, while your bank accounts stayed flat. A small payment came in to GrabrFi mid-week.`,
    '1M': `Your balance dipped about 6% this month before bouncing back. The main reason was a drop in crypto value, but a payment into Wallbit helped offset it. Your Argentine peso account lost a little value against the dollar.`,
    '3M': `The last 3 months show a slow upward trend. Your dollar accounts (Wallbit, Wise, GrabrFi) kept things steady. Crypto went up and down but ended roughly where it started.`,
    '6M': `Over 6 months, your total grew about 12%, mostly from regular income into your bank accounts and crypto gains. Two bigger payments caused brief dips, but things recovered quickly.`,
    '1Y': `The past year shows steady growth from regular deposits, with some bumps from crypto price swings. Your best point was around late summer. Overall, you finished the year in better shape than you started.`,
    ALL: `Looking at the full history, your total has grown a lot. Early on, you had fewer accounts and smaller balances. Crypto added some volatility but also contributed to growth. Your bank accounts have been the most stable part of the picture.`,
  }

  return explanations[range] ?? explanations['1M']
}

// Each account only generates transactions that make sense for its type
interface AccountTxTemplate {
  description: string
  type: Transaction['type']
  sign: 1 | -1
}

const ACCOUNT_TX_TEMPLATES: Record<string, AccountTxTemplate[]> = {
  wallbit: [
    { description: 'Salary deposit', type: 'inflow', sign: 1 },
    { description: 'Wire transfer received', type: 'inflow', sign: 1 },
    { description: 'Freelance payment', type: 'inflow', sign: 1 },
    { description: 'Account fee', type: 'outflow', sign: -1 },
    { description: 'Transfer to Wise', type: 'outflow', sign: -1 },
    { description: 'Netflix subscription', type: 'outflow', sign: -1 },
    { description: 'Transfer to GrabrFi', type: 'outflow', sign: -1 },
    { description: 'Freelance invoice', type: 'inflow', sign: 1 },
  ],
  grabrfi: [
    { description: 'Client payment received', type: 'inflow', sign: 1 },
    { description: 'Transfer to Wise', type: 'outflow', sign: -1 },
    { description: 'Monthly subscription', type: 'outflow', sign: -1 },
    { description: 'Inbound wire', type: 'inflow', sign: 1 },
    { description: 'SaaS tool payment', type: 'outflow', sign: -1 },
    { description: 'Consulting fee received', type: 'inflow', sign: 1 },
  ],
  wise: [
    { description: 'International transfer received', type: 'inflow', sign: 1 },
    { description: 'Currency conversion fee', type: 'outflow', sign: -1 },
    { description: 'Invoice received', type: 'inflow', sign: 1 },
    { description: 'Transfer to Brubank', type: 'outflow', sign: -1 },
    { description: 'Contractor payment', type: 'outflow', sign: -1 },
    { description: 'Hosting payment', type: 'outflow', sign: -1 },
  ],
  brubank: [
    { description: 'Grocery payment', type: 'outflow', sign: -1 },
    { description: 'Utility bill', type: 'outflow', sign: -1 },
    { description: 'ATM withdrawal', type: 'outflow', sign: -1 },
    { description: 'Salary credit', type: 'inflow', sign: 1 },
    { description: 'Cafe purchase', type: 'outflow', sign: -1 },
    { description: 'Transfer received', type: 'inflow', sign: 1 },
    { description: 'Fuel payment', type: 'outflow', sign: -1 },
  ],
  binance: [
    { description: 'BTC purchase', type: 'outflow', sign: -1 },
    { description: 'ETH sell', type: 'inflow', sign: 1 },
    { description: 'USDT deposit', type: 'inflow', sign: 1 },
    { description: 'Trading fee', type: 'outflow', sign: -1 },
    { description: 'BTC sell', type: 'inflow', sign: 1 },
    { description: 'SOL buy', type: 'outflow', sign: -1 },
    { description: 'USDT withdrawal', type: 'outflow', sign: -1 },
    { description: 'ETH purchase', type: 'outflow', sign: -1 },
  ],
  ibkr: [
    { description: 'Stock purchase', type: 'outflow', sign: -1 },
    { description: 'Dividend received', type: 'inflow', sign: 1 },
    { description: 'Portfolio rebalance sell', type: 'inflow', sign: 1 },
    { description: 'ETF purchase', type: 'outflow', sign: -1 },
    { description: 'Commission fee', type: 'outflow', sign: -1 },
  ],
  'manual-cash': [
    { description: 'Cash received', type: 'inflow', sign: 1 },
    { description: 'Cash spent', type: 'outflow', sign: -1 },
  ],
}

export function generateTransactions(accounts: Account[]): Transaction[] {
  const txs: Transaction[] = []

  accounts.forEach((account) => {
    const templates = ACCOUNT_TX_TEMPLATES[account.id] ?? [
      { description: 'Transaction', type: 'inflow' as const, sign: 1 as const },
    ]
    const count = account.type === 'crypto' ? 10 : account.type === 'investment' ? 5 : 7

    for (let i = 0; i < count; i++) {
      const daysAgo = Math.floor(Math.random() * 90)
      const date = new Date()
      date.setDate(date.getDate() - daysAgo)
      date.setHours(
        Math.floor(Math.random() * 14) + 8,
        Math.floor(Math.random() * 60),
        0,
        0
      )

      const template = templates[Math.floor(Math.random() * templates.length)]
      const baseAmount =
        account.currency === 'ARS'
          ? Math.floor(Math.random() * 500_000) + 5_000
          : Math.floor(Math.random() * 2_500) + 25
      const amount = template.sign * baseAmount

      txs.push({
        id: `${account.id}-${i}-${date.getTime()}`,
        accountId: account.id,
        accountName: account.name,
        description: template.description,
        amount,
        currency: account.currency,
        type: template.type,
        timestamp: date,
      })
    }
  })

  return txs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}
