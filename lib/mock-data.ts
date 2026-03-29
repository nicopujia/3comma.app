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

export type TransactionCategory =
  | 'food'
  | 'transport'
  | 'housing'
  | 'entertainment'
  | 'health'
  | 'education'
  | 'clothing'
  | 'subscriptions'
  | 'utilities'
  | 'cleaning'
  | 'pets'
  | 'gifts'
  | 'travel'
  | 'insurance'
  | 'taxes'
  | 'salary'
  | 'freelance'
  | 'investments'
  | 'crypto'
  | 'transfers'
  | 'fees'
  | 'refunds'
  | 'other'

export interface Transaction {
  id: string
  accountId: string
  accountName: string
  description: string
  amount: number
  currency: Currency
  type: 'inflow' | 'outflow'
  category: TransactionCategory
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
  category: TransactionCategory
}

const ACCOUNT_TX_TEMPLATES: Record<string, AccountTxTemplate[]> = {
  wallbit: [
    { description: 'Salary deposit', type: 'inflow', sign: 1, category: 'salary' },
    { description: 'Wire transfer received', type: 'inflow', sign: 1, category: 'transfers' },
    { description: 'Freelance payment', type: 'inflow', sign: 1, category: 'freelance' },
    { description: 'Account fee', type: 'outflow', sign: -1, category: 'fees' },
    { description: 'Transfer to Wise', type: 'outflow', sign: -1, category: 'transfers' },
    { description: 'Netflix subscription', type: 'outflow', sign: -1, category: 'subscriptions' },
    { description: 'Transfer to GrabrFi', type: 'outflow', sign: -1, category: 'transfers' },
    { description: 'Freelance invoice', type: 'inflow', sign: 1, category: 'freelance' },
  ],
  grabrfi: [
    { description: 'Client payment received', type: 'inflow', sign: 1, category: 'freelance' },
    { description: 'Transfer to Wise', type: 'outflow', sign: -1, category: 'transfers' },
    { description: 'Monthly subscription', type: 'outflow', sign: -1, category: 'subscriptions' },
    { description: 'Inbound wire', type: 'inflow', sign: 1, category: 'transfers' },
    { description: 'SaaS tool payment', type: 'outflow', sign: -1, category: 'subscriptions' },
    { description: 'Consulting fee received', type: 'inflow', sign: 1, category: 'freelance' },
  ],
  wise: [
    { description: 'International transfer received', type: 'inflow', sign: 1, category: 'transfers' },
    { description: 'Currency conversion fee', type: 'outflow', sign: -1, category: 'fees' },
    { description: 'Invoice received', type: 'inflow', sign: 1, category: 'freelance' },
    { description: 'Transfer to Brubank', type: 'outflow', sign: -1, category: 'transfers' },
    { description: 'Contractor payment', type: 'outflow', sign: -1, category: 'freelance' },
    { description: 'Hosting payment', type: 'outflow', sign: -1, category: 'subscriptions' },
  ],
  brubank: [
    { description: 'Grocery payment', type: 'outflow', sign: -1, category: 'food' },
    { description: 'Utility bill', type: 'outflow', sign: -1, category: 'utilities' },
    { description: 'ATM withdrawal', type: 'outflow', sign: -1, category: 'other' },
    { description: 'Salary credit', type: 'inflow', sign: 1, category: 'salary' },
    { description: 'Cafe purchase', type: 'outflow', sign: -1, category: 'food' },
    { description: 'Transfer received', type: 'inflow', sign: 1, category: 'transfers' },
    { description: 'Fuel payment', type: 'outflow', sign: -1, category: 'transport' },
  ],
  binance: [
    { description: 'BTC purchase', type: 'outflow', sign: -1, category: 'crypto' },
    { description: 'ETH sell', type: 'inflow', sign: 1, category: 'crypto' },
    { description: 'USDT deposit', type: 'inflow', sign: 1, category: 'crypto' },
    { description: 'Trading fee', type: 'outflow', sign: -1, category: 'fees' },
    { description: 'BTC sell', type: 'inflow', sign: 1, category: 'crypto' },
    { description: 'SOL buy', type: 'outflow', sign: -1, category: 'crypto' },
    { description: 'USDT withdrawal', type: 'outflow', sign: -1, category: 'crypto' },
    { description: 'ETH purchase', type: 'outflow', sign: -1, category: 'crypto' },
  ],
  ibkr: [
    { description: 'Stock purchase', type: 'outflow', sign: -1, category: 'investments' },
    { description: 'Dividend received', type: 'inflow', sign: 1, category: 'investments' },
    { description: 'Portfolio rebalance sell', type: 'inflow', sign: 1, category: 'investments' },
    { description: 'ETF purchase', type: 'outflow', sign: -1, category: 'investments' },
    { description: 'Commission fee', type: 'outflow', sign: -1, category: 'fees' },
  ],
  'manual-cash': [
    { description: 'Cash received', type: 'inflow', sign: 1, category: 'other' },
    { description: 'Cash spent', type: 'outflow', sign: -1, category: 'other' },
  ],
  mercadopago: [
    { description: 'QR payment — Supermarket', type: 'outflow', sign: -1, category: 'food' },
    { description: 'Transfer received', type: 'inflow', sign: 1, category: 'transfers' },
    { description: 'Online purchase — MercadoLibre', type: 'outflow', sign: -1, category: 'other' },
    { description: 'Money request received', type: 'inflow', sign: 1, category: 'transfers' },
    { description: 'Bill payment — Electricity', type: 'outflow', sign: -1, category: 'utilities' },
    { description: 'Refund', type: 'inflow', sign: 1, category: 'refunds' },
    { description: 'QR payment — Pharmacy', type: 'outflow', sign: -1, category: 'health' },
    { description: 'QR payment — Pet shop', type: 'outflow', sign: -1, category: 'pets' },
    { description: 'QR payment — Cleaning supplies', type: 'outflow', sign: -1, category: 'cleaning' },
  ],
  uala: [
    { description: 'Card purchase — Restaurant', type: 'outflow', sign: -1, category: 'food' },
    { description: 'Transfer received', type: 'inflow', sign: 1, category: 'transfers' },
    { description: 'Salary deposit', type: 'inflow', sign: 1, category: 'salary' },
    { description: 'Spotify subscription', type: 'outflow', sign: -1, category: 'subscriptions' },
    { description: 'ATM withdrawal', type: 'outflow', sign: -1, category: 'other' },
    { description: 'Card purchase — Clothing store', type: 'outflow', sign: -1, category: 'clothing' },
    { description: 'Card purchase — Uber ride', type: 'outflow', sign: -1, category: 'transport' },
  ],
  naranjax: [
    { description: 'Card purchase — Bakery', type: 'outflow', sign: -1, category: 'food' },
    { description: 'Transfer received', type: 'inflow', sign: 1, category: 'transfers' },
    { description: 'Bill payment — Internet', type: 'outflow', sign: -1, category: 'utilities' },
    { description: 'Cashback received', type: 'inflow', sign: 1, category: 'refunds' },
    { description: 'Card purchase — Bookstore', type: 'outflow', sign: -1, category: 'education' },
  ],
  revolut: [
    { description: 'Card payment — Airline tickets', type: 'outflow', sign: -1, category: 'travel' },
    { description: 'Transfer received', type: 'inflow', sign: 1, category: 'transfers' },
    { description: 'Currency exchange', type: 'outflow', sign: -1, category: 'fees' },
    { description: 'Salary deposit', type: 'inflow', sign: 1, category: 'salary' },
    { description: 'YouTube Premium', type: 'outflow', sign: -1, category: 'subscriptions' },
    { description: 'Card payment — Hotel', type: 'outflow', sign: -1, category: 'travel' },
  ],
  paypal: [
    { description: 'Payment received', type: 'inflow', sign: 1, category: 'freelance' },
    { description: 'Online purchase — Amazon', type: 'outflow', sign: -1, category: 'other' },
    { description: 'Freelance payment', type: 'inflow', sign: 1, category: 'freelance' },
    { description: 'Adobe subscription', type: 'outflow', sign: -1, category: 'subscriptions' },
    { description: 'Refund received', type: 'inflow', sign: 1, category: 'refunds' },
    { description: 'Online course — Udemy', type: 'outflow', sign: -1, category: 'education' },
    { description: 'Gift purchase', type: 'outflow', sign: -1, category: 'gifts' },
  ],
  galicia: [
    { description: 'Salary deposit', type: 'inflow', sign: 1, category: 'salary' },
    { description: 'Debit card purchase — Supermarket', type: 'outflow', sign: -1, category: 'food' },
    { description: 'Transfer received', type: 'inflow', sign: 1, category: 'transfers' },
    { description: 'Utility bill — Gas', type: 'outflow', sign: -1, category: 'utilities' },
    { description: 'ATM withdrawal', type: 'outflow', sign: -1, category: 'other' },
    { description: 'Wire transfer — Rent', type: 'outflow', sign: -1, category: 'housing' },
    { description: 'Insurance payment — Health', type: 'outflow', sign: -1, category: 'insurance' },
  ],
  santander: [
    { description: 'Salary credit', type: 'inflow', sign: 1, category: 'salary' },
    { description: 'Debit purchase — Gym membership', type: 'outflow', sign: -1, category: 'health' },
    { description: 'Transfer received', type: 'inflow', sign: 1, category: 'transfers' },
    { description: 'Insurance payment — Car', type: 'outflow', sign: -1, category: 'insurance' },
    { description: 'Loan payment — Mortgage', type: 'outflow', sign: -1, category: 'housing' },
    { description: 'Tax payment — AFIP', type: 'outflow', sign: -1, category: 'taxes' },
  ],
  bbva: [
    { description: 'Salary deposit', type: 'inflow', sign: 1, category: 'salary' },
    { description: 'Card purchase — Electronics', type: 'outflow', sign: -1, category: 'other' },
    { description: 'Transfer received', type: 'inflow', sign: 1, category: 'transfers' },
    { description: 'Service payment — Phone bill', type: 'outflow', sign: -1, category: 'utilities' },
    { description: 'ATM withdrawal', type: 'outflow', sign: -1, category: 'other' },
    { description: 'Card purchase — Cleaning service', type: 'outflow', sign: -1, category: 'cleaning' },
    { description: 'Card purchase — Dog food', type: 'outflow', sign: -1, category: 'pets' },
  ],
  coinbase: [
    { description: 'BTC purchase', type: 'outflow', sign: -1, category: 'crypto' },
    { description: 'ETH sell', type: 'inflow', sign: 1, category: 'crypto' },
    { description: 'USDC deposit', type: 'inflow', sign: 1, category: 'crypto' },
    { description: 'Trading fee', type: 'outflow', sign: -1, category: 'fees' },
    { description: 'SOL purchase', type: 'outflow', sign: -1, category: 'crypto' },
    { description: 'BTC sell', type: 'inflow', sign: 1, category: 'crypto' },
  ],
  kraken: [
    { description: 'BTC purchase', type: 'outflow', sign: -1, category: 'crypto' },
    { description: 'ETH sell', type: 'inflow', sign: 1, category: 'crypto' },
    { description: 'USD deposit', type: 'inflow', sign: 1, category: 'crypto' },
    { description: 'Trading fee', type: 'outflow', sign: -1, category: 'fees' },
    { description: 'ADA purchase', type: 'outflow', sign: -1, category: 'crypto' },
    { description: 'Withdrawal', type: 'outflow', sign: -1, category: 'transfers' },
  ],
  schwab: [
    { description: 'Stock purchase', type: 'outflow', sign: -1, category: 'investments' },
    { description: 'Dividend received', type: 'inflow', sign: 1, category: 'investments' },
    { description: 'ETF purchase', type: 'outflow', sign: -1, category: 'investments' },
    { description: 'Stock sale', type: 'inflow', sign: 1, category: 'investments' },
    { description: 'Account fee', type: 'outflow', sign: -1, category: 'fees' },
  ],
  fidelity: [
    { description: 'Mutual fund purchase', type: 'outflow', sign: -1, category: 'investments' },
    { description: 'Dividend received', type: 'inflow', sign: 1, category: 'investments' },
    { description: 'Bond purchase', type: 'outflow', sign: -1, category: 'investments' },
    { description: 'Stock sale', type: 'inflow', sign: 1, category: 'investments' },
    { description: '401k contribution', type: 'outflow', sign: -1, category: 'investments' },
  ],
  iol: [
    { description: 'CEDEAR purchase', type: 'outflow', sign: -1, category: 'investments' },
    { description: 'Bond coupon received', type: 'inflow', sign: 1, category: 'investments' },
    { description: 'FCI subscription', type: 'outflow', sign: -1, category: 'investments' },
    { description: 'Stock sale', type: 'inflow', sign: 1, category: 'investments' },
    { description: 'Commission fee', type: 'outflow', sign: -1, category: 'fees' },
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
      { description: 'Transaction', type: 'inflow' as const, sign: 1 as const, category: 'other' as const },
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

        // Bias toward inflows (~60%) for a healthier-looking portfolio
        const inflowTemplates = templates.filter((t) => t.type === 'inflow')
        const outflowTemplates = templates.filter((t) => t.type === 'outflow')
        const template = rand() < 0.6 && inflowTemplates.length > 0
          ? inflowTemplates[Math.floor(rand() * inflowTemplates.length)]
          : outflowTemplates.length > 0
            ? outflowTemplates[Math.floor(rand() * outflowTemplates.length)]
            : templates[Math.floor(rand() * templates.length)]
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
          category: template.category,
          timestamp: date,
        })
      }
    }
  })

  return txs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}
