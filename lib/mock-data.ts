export type AccountType = 'bank' | 'crypto' | 'investment' | 'cash'
export type Currency = 'USD' | 'ARS' | 'EUR'

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
  // Pre-selected — most popular first
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
    id: 'mercadopago',
    name: 'Mercado Pago',
    type: 'bank',
    currency: 'ARS',
    balance: 1_450_000,
    included: true,
    deepLink: 'https://mercadopago.com.ar',
    color: '#8a8a8a',
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
    id: 'uala',
    name: 'Ualá',
    type: 'bank',
    currency: 'ARS',
    balance: 980_000,
    included: true,
    deepLink: 'https://uala.com.ar',
    color: '#9a9a9a',
  },
  {
    id: 'fidelity',
    name: 'Fidelity',
    type: 'investment',
    currency: 'USD',
    balance: 18750.0,
    included: true,
    deepLink: 'https://fidelity.com',
    color: '#eeeeee',
  },
  {
    id: 'iol',
    name: 'IOL (InvertirOnline)',
    type: 'investment',
    currency: 'ARS',
    balance: 5_800_000,
    included: true,
    deepLink: 'https://invertironline.com',
    color: '#a5a5a5',
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
  // Rest
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
    id: 'naranjax',
    name: 'Naranja X',
    type: 'bank',
    currency: 'ARS',
    balance: 620_000,
    included: true,
    deepLink: 'https://naranjax.com',
    color: '#aaaaaa',
  },
  {
    id: 'revolut',
    name: 'Revolut',
    type: 'bank',
    currency: 'USD',
    balance: 3150.0,
    included: true,
    deepLink: 'https://revolut.com',
    color: '#bababa',
  },
  {
    id: 'paypal',
    name: 'PayPal',
    type: 'bank',
    currency: 'USD',
    balance: 1540.25,
    included: true,
    deepLink: 'https://paypal.com',
    color: '#cacaca',
  },
  {
    id: 'galicia',
    name: 'Banco Galicia',
    type: 'bank',
    currency: 'ARS',
    balance: 3_200_000,
    included: true,
    deepLink: 'https://bancogalicia.com.ar',
    color: '#8e8e8e',
  },
  {
    id: 'santander',
    name: 'Santander',
    type: 'bank',
    currency: 'ARS',
    balance: 1_750_000,
    included: true,
    deepLink: 'https://santander.com.ar',
    color: '#9e9e9e',
  },
  {
    id: 'bbva',
    name: 'BBVA',
    type: 'bank',
    currency: 'ARS',
    balance: 2_100_000,
    included: true,
    deepLink: 'https://bbva.com.ar',
    color: '#aeaeae',
  },
  {
    id: 'coinbase',
    name: 'Coinbase',
    type: 'crypto',
    currency: 'USD',
    balance: 4320.0,
    included: true,
    deepLink: 'https://coinbase.com',
    color: '#bebebe',
  },
  {
    id: 'kraken',
    name: 'Kraken',
    type: 'crypto',
    currency: 'USD',
    balance: 2890.0,
    included: true,
    deepLink: 'https://kraken.com',
    color: '#cecece',
  },
  {
    id: 'schwab',
    name: 'Charles Schwab',
    type: 'investment',
    currency: 'USD',
    balance: 22500.0,
    included: true,
    deepLink: 'https://schwab.com',
    color: '#dedede',
  },
]

// IDs of the default accounts pre-selected during onboarding
export const DEFAULT_ACCOUNT_IDS = [
  'mercadopago', 'uala', 'wise', 'binance', 'manual-cash', 'iol', 'fidelity',
]

// Convert any balance to USD
export function toUSD(balance: number, currency: Currency): number {
  if (currency === 'USD') return balance
  return balance / FX_ARS_USD
}

// Build historical balance data from actual transactions.
// Starts from current balances and walks backwards, subtracting each transaction's
// effect to reconstruct what the total was on each day.
export function getHistoricalData(
  accounts: Account[],
  range: string,
  transactions: Transaction[]
): HistoricalPoint[] {
  const RANGE_DAYS: Record<string, number> = {
    '1W': 7,
    '1M': 30,
    '3M': 90,
    '6M': 180,
    '1Y': 365,
    ALL: 730,
  }

  const days = RANGE_DAYS[range] ?? 30
  const now = new Date()
  const includedIds = new Set(accounts.filter((a) => a.included).map((a) => a.id))

  // Current total in USD
  const currentTotal = accounts
    .filter((a) => a.included)
    .reduce((sum, a) => sum + toUSD(a.balance, a.currency), 0)

  // Filter transactions to included accounts, sorted newest first
  const relevantTxs = transactions
    .filter((tx) => includedIds.has(tx.accountId))
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  // Build daily balances walking backwards from today
  const points: HistoricalPoint[] = []
  let runningTotal = currentTotal
  let txIndex = 0

  for (let i = 0; i <= days; i++) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    date.setHours(23, 59, 59, 999)

    // Subtract transactions that happened on this day (reverse their effect)
    while (txIndex < relevantTxs.length) {
      const tx = relevantTxs[txIndex]
      if (tx.timestamp > date) {
        // This transaction is after this date — reverse it
        runningTotal -= toUSD(tx.amount, tx.currency)
        txIndex++
      } else {
        break
      }
    }

    points.push({ date, value: Math.max(0, runningTotal) })
  }

  // Return in chronological order (oldest first)
  return points.reverse()
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
  mercadopago: [
    { description: 'QR payment', type: 'outflow', sign: -1 },
    { description: 'Transfer received', type: 'inflow', sign: 1 },
    { description: 'Online purchase', type: 'outflow', sign: -1 },
    { description: 'Money request received', type: 'inflow', sign: 1 },
    { description: 'Bill payment', type: 'outflow', sign: -1 },
    { description: 'Refund', type: 'inflow', sign: 1 },
  ],
  uala: [
    { description: 'Card purchase', type: 'outflow', sign: -1 },
    { description: 'Transfer received', type: 'inflow', sign: 1 },
    { description: 'Salary deposit', type: 'inflow', sign: 1 },
    { description: 'Subscription payment', type: 'outflow', sign: -1 },
    { description: 'ATM withdrawal', type: 'outflow', sign: -1 },
  ],
  naranjax: [
    { description: 'Card purchase', type: 'outflow', sign: -1 },
    { description: 'Transfer received', type: 'inflow', sign: 1 },
    { description: 'Bill payment', type: 'outflow', sign: -1 },
    { description: 'Cashback received', type: 'inflow', sign: 1 },
  ],
  revolut: [
    { description: 'Card payment', type: 'outflow', sign: -1 },
    { description: 'Transfer received', type: 'inflow', sign: 1 },
    { description: 'Currency exchange', type: 'outflow', sign: -1 },
    { description: 'Salary deposit', type: 'inflow', sign: 1 },
    { description: 'Subscription', type: 'outflow', sign: -1 },
  ],
  paypal: [
    { description: 'Payment received', type: 'inflow', sign: 1 },
    { description: 'Online purchase', type: 'outflow', sign: -1 },
    { description: 'Freelance payment', type: 'inflow', sign: 1 },
    { description: 'Subscription payment', type: 'outflow', sign: -1 },
    { description: 'Refund received', type: 'inflow', sign: 1 },
  ],
  galicia: [
    { description: 'Salary deposit', type: 'inflow', sign: 1 },
    { description: 'Debit card purchase', type: 'outflow', sign: -1 },
    { description: 'Transfer received', type: 'inflow', sign: 1 },
    { description: 'Utility bill', type: 'outflow', sign: -1 },
    { description: 'ATM withdrawal', type: 'outflow', sign: -1 },
    { description: 'Wire transfer', type: 'outflow', sign: -1 },
  ],
  santander: [
    { description: 'Salary credit', type: 'inflow', sign: 1 },
    { description: 'Debit purchase', type: 'outflow', sign: -1 },
    { description: 'Transfer received', type: 'inflow', sign: 1 },
    { description: 'Insurance payment', type: 'outflow', sign: -1 },
    { description: 'Loan payment', type: 'outflow', sign: -1 },
  ],
  bbva: [
    { description: 'Salary deposit', type: 'inflow', sign: 1 },
    { description: 'Card purchase', type: 'outflow', sign: -1 },
    { description: 'Transfer received', type: 'inflow', sign: 1 },
    { description: 'Service payment', type: 'outflow', sign: -1 },
    { description: 'ATM withdrawal', type: 'outflow', sign: -1 },
  ],
  coinbase: [
    { description: 'BTC purchase', type: 'outflow', sign: -1 },
    { description: 'ETH sell', type: 'inflow', sign: 1 },
    { description: 'USDC deposit', type: 'inflow', sign: 1 },
    { description: 'Trading fee', type: 'outflow', sign: -1 },
    { description: 'SOL purchase', type: 'outflow', sign: -1 },
    { description: 'BTC sell', type: 'inflow', sign: 1 },
  ],
  kraken: [
    { description: 'BTC purchase', type: 'outflow', sign: -1 },
    { description: 'ETH sell', type: 'inflow', sign: 1 },
    { description: 'USD deposit', type: 'inflow', sign: 1 },
    { description: 'Trading fee', type: 'outflow', sign: -1 },
    { description: 'ADA purchase', type: 'outflow', sign: -1 },
    { description: 'Withdrawal', type: 'outflow', sign: -1 },
  ],
  schwab: [
    { description: 'Stock purchase', type: 'outflow', sign: -1 },
    { description: 'Dividend received', type: 'inflow', sign: 1 },
    { description: 'ETF purchase', type: 'outflow', sign: -1 },
    { description: 'Stock sale', type: 'inflow', sign: 1 },
    { description: 'Account fee', type: 'outflow', sign: -1 },
  ],
  fidelity: [
    { description: 'Mutual fund purchase', type: 'outflow', sign: -1 },
    { description: 'Dividend received', type: 'inflow', sign: 1 },
    { description: 'Bond purchase', type: 'outflow', sign: -1 },
    { description: 'Stock sale', type: 'inflow', sign: 1 },
    { description: '401k contribution', type: 'outflow', sign: -1 },
  ],
  iol: [
    { description: 'CEDEAR purchase', type: 'outflow', sign: -1 },
    { description: 'Bond coupon received', type: 'inflow', sign: 1 },
    { description: 'FCI subscription', type: 'outflow', sign: -1 },
    { description: 'Stock sale', type: 'inflow', sign: 1 },
    { description: 'Commission fee', type: 'outflow', sign: -1 },
  ],
}

/** Seed-based PRNG so synthetic data is stable across renders */
function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

export function generateTransactions(accounts: Account[]): Transaction[] {
  const txs: Transaction[] = []
  const rand = seededRandom(42)

  accounts.forEach((account) => {
    const templates = ACCOUNT_TX_TEMPLATES[account.id] ?? [
      { description: 'Transaction', type: 'inflow' as const, sign: 1 as const },
    ]

    // ~3-5 transactions per account per month over 24 months (back to March 2024)
    const perMonth = account.type === 'crypto' ? 5 : account.type === 'investment' ? 3 : 4
    const months = 24

    for (let m = 0; m < months; m++) {
      const count = perMonth + Math.floor(rand() * 3) - 1 // slight variation
      for (let i = 0; i < count; i++) {
        const daysAgo = m * 30 + Math.floor(rand() * 30)
        const date = new Date()
        date.setDate(date.getDate() - daysAgo)
        date.setHours(
          Math.floor(rand() * 14) + 8,
          Math.floor(rand() * 60),
          0,
          0
        )

        const template = templates[Math.floor(rand() * templates.length)]
        const baseAmount =
          account.currency === 'ARS'
            ? Math.floor(rand() * 500_000) + 5_000
            : Math.floor(rand() * 2_500) + 25
        const amount = template.sign * baseAmount

        txs.push({
          id: `${account.id}-${m}-${i}-${daysAgo}`,
          accountId: account.id,
          accountName: account.name,
          description: template.description,
          amount,
          currency: account.currency,
          type: template.type,
          timestamp: date,
        })
      }
    }
  })

  return txs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}
