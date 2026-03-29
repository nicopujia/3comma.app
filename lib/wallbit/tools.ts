import { tool } from 'ai'
import { z } from 'zod'
import * as wallbit from './client'

// --- Read Tools (no approval needed) ---

const getCheckingBalance = tool({
  description:
    'Get the user\'s Wallbit checking account balances. Returns balances per currency (e.g. USD).',
  inputSchema: z.object({}),
  execute: async () => {
    const balances = await wallbit.getCheckingBalance()
    return { balances }
  },
})

const getStockPortfolio = tool({
  description:
    'Get the user\'s Wallbit investment portfolio — stock/ETF positions and available USD cash in the investment account. The "USD" symbol represents uninvested cash.',
  inputSchema: z.object({}),
  execute: async () => {
    const positions = await wallbit.getStocksBalance()
    return { positions }
  },
})

const getWallbitTransactions = tool({
  description:
    'Search Wallbit transaction history with optional filters. Supports pagination, date range, status, currency, and amount filters.',
  inputSchema: z.object({
    page: z.number().optional().describe('Page number (default 1)'),
    limit: z.number().optional().describe('Results per page (10, 20, or 50)'),
    status: z.string().optional().describe('Filter by status, e.g. COMPLETED'),
    currency: z.string().optional().describe('Filter by currency code, e.g. USD'),
    from_date: z.string().optional().describe('Start date (YYYY-MM-DD). Must not be in the future.'),
    to_date: z.string().optional().describe('End date (YYYY-MM-DD). Must not be in the future. Defaults to today.'),
    from_amount: z.number().optional().describe('Minimum amount'),
    to_amount: z.number().optional().describe('Maximum amount'),
  }),
  execute: async (input) => {
    const today = new Date().toISOString().split('T')[0]
    if (input.to_date && input.to_date > today) input.to_date = today
    if (input.from_date && input.from_date > today) input.from_date = today
    const result = await wallbit.getTransactions(input)
    return result
  },
})

const getAccountDetails = tool({
  description:
    'Get Wallbit bank account details for receiving deposits (ACH for US, SEPA for EU). Returns routing/account numbers, IBAN, holder info.',
  inputSchema: z.object({
    country: z.enum(['US', 'EU']).optional().describe('Account country (default US)'),
    currency: z.enum(['USD', 'EUR']).optional().describe('Account currency (default USD)'),
  }),
  execute: async (input) => {
    const details = await wallbit.getAccountDetails(input)
    return { details }
  },
})

const getWallets = tool({
  description:
    'Get Wallbit crypto wallet addresses for receiving deposits. Can filter by currency (USDT, USDC) and network (ethereum, arbitrum, solana, polygon, tron).',
  inputSchema: z.object({
    currency: z.enum(['USDT', 'USDC']).optional(),
    network: z.enum(['ethereum', 'arbitrum', 'solana', 'polygon', 'tron']).optional(),
  }),
  execute: async (input) => {
    const wallets = await wallbit.getWallets(input)
    return { wallets }
  },
})

const getAssetInfo = tool({
  description:
    'Look up detailed info about a specific stock or ETF by ticker symbol. Returns price, sector, market cap, description, dividend info, and more.',
  inputSchema: z.object({
    symbol: z.string().describe('Ticker symbol, e.g. AAPL, TSLA, VOO'),
  }),
  execute: async ({ symbol }) => {
    const asset = await wallbit.getAsset(symbol.toUpperCase())
    return { asset }
  },
})

const searchAssets = tool({
  description:
    'Browse or search available stocks and ETFs on Wallbit. Filter by category (MOST_POPULAR, ETF, TECHNOLOGY, etc.) or search by name/symbol.',
  inputSchema: z.object({
    search: z.string().optional().describe('Search by symbol, name, or keywords'),
    category: z
      .enum([
        'MOST_POPULAR',
        'ETF',
        'DIVIDENDS',
        'TECHNOLOGY',
        'HEALTH',
        'CONSUMER_GOODS',
        'ENERGY_AND_WATER',
        'FINANCE',
        'REAL_ESTATE',
        'TREASURY_BILLS',
        'VIDEOGAMES',
        'ARGENTINA_ADR',
      ])
      .optional(),
    page: z.number().optional(),
    limit: z.number().optional().describe('Results per page (max 50)'),
  }),
  execute: async (input) => {
    const result = await wallbit.getAssets(input)
    return result
  },
})

const getRoboadvisorBalance = tool({
  description:
    'Get Wallbit Robo Advisor and Chest portfolios — balance, allocation, performance, positions, and risk profile.',
  inputSchema: z.object({}),
  execute: async () => {
    const portfolios = await wallbit.getRoboadvisorBalance()
    return { portfolios }
  },
})

const getCards = tool({
  description: 'List the user\'s Wallbit cards (virtual and physical) with their status, type, network, and last 4 digits.',
  inputSchema: z.object({}),
  execute: async () => {
    const cards = await wallbit.getCards()
    return { cards }
  },
})

// --- Write Tools (all require approval) ---

const executeTrade = tool({
  description:
    'Execute a buy or sell trade for stocks/ETFs on Wallbit. Supports MARKET, LIMIT, STOP, and STOP_LIMIT orders. Use amount_usd for a dollar amount, or shares for a share count — never both.',
  inputSchema: z.object({
    symbol: z.string().describe('Ticker symbol, e.g. AAPL'),
    direction: z.enum(['BUY', 'SELL']),
    order_type: z.enum(['MARKET', 'LIMIT', 'STOP', 'STOP_LIMIT']),
    amount_usd: z.number().optional().describe('Dollar amount to trade (omit if using shares)'),
    shares: z.number().optional().describe('Number of shares to trade (omit if using amount_usd)'),
    limit_price: z.number().optional().describe('Limit price (required for LIMIT and STOP_LIMIT)'),
    stop_price: z.number().optional().describe('Stop price (required for STOP and STOP_LIMIT)'),
    time_in_force: z.enum(['DAY', 'GTC']).optional().describe('Time in force (required for LIMIT orders)'),
  }),
  needsApproval: true,
  execute: async (input) => {
    // API requires amount OR shares, not both — prefer amount_usd if both are given
    const { amount_usd, shares, ...rest } = input
    const trade = await wallbit.createTrade({
      ...rest,
      currency: 'USD',
      ...(amount_usd ? { amount: amount_usd } : { shares }),
    })
    return { trade }
  },
})

const internalTransfer = tool({
  description:
    'Move money between Wallbit checking (DEFAULT) and investment (INVESTMENT) accounts. Use DEFAULT→INVESTMENT to fund trading, INVESTMENT→DEFAULT to withdraw.',
  inputSchema: z.object({
    from: z.enum(['DEFAULT', 'INVESTMENT']).describe('Source account'),
    to: z.enum(['DEFAULT', 'INVESTMENT']).describe('Destination account'),
    amount: z.number().describe('Amount in USD'),
  }),
  needsApproval: true,
  execute: async (input) => {
    const result = await wallbit.internalOperation({
      ...input,
      currency: 'USD',
    })
    return { transaction: result }
  },
})

const roboadvisorDeposit = tool({
  description:
    'Deposit funds into a Wallbit Robo Advisor or Chest portfolio. Minimum $10. Source can be checking (DEFAULT) or investment (INVESTMENT) account.',
  inputSchema: z.object({
    robo_advisor_id: z.number().describe('Portfolio ID (from getRoboadvisorBalance)'),
    amount: z.number().min(10).describe('Amount in USD (minimum $10)'),
    from: z.enum(['DEFAULT', 'INVESTMENT']).describe('Source account'),
  }),
  needsApproval: true,
  execute: async (input) => {
    const result = await wallbit.roboadvisorDeposit(input)
    return { transaction: result }
  },
})

const roboadvisorWithdraw = tool({
  description:
    'Withdraw funds from a Wallbit Robo Advisor or Chest portfolio. Minimum $1. Destination can be checking (DEFAULT) or investment (INVESTMENT) account.',
  inputSchema: z.object({
    robo_advisor_id: z.number().describe('Portfolio ID (from getRoboadvisorBalance)'),
    amount: z.number().min(1).describe('Amount in USD (minimum $1)'),
    to: z.enum(['DEFAULT', 'INVESTMENT']).describe('Destination account'),
  }),
  needsApproval: true,
  execute: async (input) => {
    const result = await wallbit.roboadvisorWithdraw(input)
    return { transaction: result }
  },
})

const updateCardStatus = tool({
  description: 'Block (SUSPENDED) or unblock (ACTIVE) a Wallbit card by its UUID.',
  inputSchema: z.object({
    cardUuid: z.string().describe('Card UUID (from getCards)'),
    status: z.enum(['ACTIVE', 'SUSPENDED']).describe('Target status'),
  }),
  needsApproval: true,
  execute: async ({ cardUuid, status }) => {
    const result = await wallbit.updateCardStatus(cardUuid, status)
    return { card: result }
  },
})

export const wallbitTools = {
  // Read
  getCheckingBalance,
  getStockPortfolio,
  getWallbitTransactions,
  getAccountDetails,
  getWallets,
  getAssetInfo,
  searchAssets,
  getRoboadvisorBalance,
  getCards,
  // Write
  executeTrade,
  internalTransfer,
  roboadvisorDeposit,
  roboadvisorWithdraw,
  updateCardStatus,
}
