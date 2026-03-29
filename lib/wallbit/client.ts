import type {
  CheckingBalance,
  StockPosition,
  PaginatedTransactions,
  TransactionFilters,
  TradeRequest,
  Trade,
  AccountDetails,
  Wallet,
  Asset,
  PaginatedAssets,
  AssetFilters,
  RoboAdvisorPortfolio,
  RoboAdvisorDepositRequest,
  RoboAdvisorWithdrawRequest,
  RoboAdvisorTransaction,
  InternalOperationRequest,
  WallbitTransaction,
  Card,
  WallbitApiError,
} from './types'

const BASE_URL = 'https://api.wallbit.io'

class WallbitError extends Error {
  constructor(
    public status: number,
    public body: WallbitApiError,
  ) {
    const msg = body.message || body.error || `Wallbit API error (${status})`
    super(msg)
    this.name = 'WallbitError'
  }
}

function getApiKey(): string {
  const key = process.env.WALLBIT_API_KEY
  if (!key) throw new Error('WALLBIT_API_KEY is not configured')
  return key
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  params?: Record<string, string | number | undefined>,
): Promise<T> {
  const url = new URL(path, BASE_URL)
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) url.searchParams.set(k, String(v))
    }
  }

  const res = await fetch(url.toString(), {
    method,
    headers: {
      'X-API-Key': getApiKey(),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

  if (!res.ok) {
    let errorBody: WallbitApiError = {}
    try {
      errorBody = await res.json()
    } catch {
      errorBody = { message: `HTTP ${res.status}` }
    }
    throw new WallbitError(res.status, errorBody)
  }

  return res.json() as Promise<T>
}

// --- Balance ---

export async function getCheckingBalance(): Promise<CheckingBalance[]> {
  const res = await request<{ data: CheckingBalance[] }>('GET', '/api/public/v1/balance/checking')
  return res.data
}

export async function getStocksBalance(): Promise<StockPosition[]> {
  const res = await request<{ data: StockPosition[] }>('GET', '/api/public/v1/balance/stocks')
  return res.data
}

// --- Transactions ---

export async function getTransactions(filters?: TransactionFilters): Promise<PaginatedTransactions> {
  const res = await request<{ data: PaginatedTransactions }>(
    'GET',
    '/api/public/v1/transactions',
    undefined,
    filters as Record<string, string | number | undefined>,
  )
  return res.data
}

// --- Trades ---

export async function createTrade(params: TradeRequest): Promise<Trade> {
  const res = await request<{ data: Trade }>('POST', '/api/public/v1/trades', params)
  return res.data
}

// --- Account Details ---

export async function getAccountDetails(
  params?: { country?: string; currency?: string },
): Promise<AccountDetails> {
  const res = await request<{ data: AccountDetails }>(
    'GET',
    '/api/public/v1/account-details',
    undefined,
    params,
  )
  return res.data
}

// --- Wallets ---

export async function getWallets(
  params?: { currency?: string; network?: string },
): Promise<Wallet[]> {
  const res = await request<{ data: Wallet[] }>(
    'GET',
    '/api/public/v1/wallets',
    undefined,
    params,
  )
  return res.data
}

// --- Assets ---

export async function getAsset(symbol: string): Promise<Asset> {
  const res = await request<{ data: Asset }>('GET', `/api/public/v1/assets/${encodeURIComponent(symbol)}`)
  return res.data
}

export async function getAssets(filters?: AssetFilters): Promise<PaginatedAssets> {
  const res = await request<PaginatedAssets>(
    'GET',
    '/api/public/v1/assets',
    undefined,
    filters as Record<string, string | number | undefined>,
  )
  return res
}

// --- Robo Advisor ---

export async function getRoboadvisorBalance(): Promise<RoboAdvisorPortfolio[]> {
  const res = await request<{ data: RoboAdvisorPortfolio[] }>('GET', '/api/public/v1/roboadvisor/balance')
  return res.data
}

export async function roboadvisorDeposit(params: RoboAdvisorDepositRequest): Promise<RoboAdvisorTransaction> {
  const res = await request<{ data: RoboAdvisorTransaction }>('POST', '/api/public/v1/roboadvisor/deposit', params)
  return res.data
}

export async function roboadvisorWithdraw(params: RoboAdvisorWithdrawRequest): Promise<RoboAdvisorTransaction> {
  const res = await request<{ data: RoboAdvisorTransaction }>('POST', '/api/public/v1/roboadvisor/withdraw', params)
  return res.data
}

// --- Internal Operations ---

export async function internalOperation(params: InternalOperationRequest): Promise<WallbitTransaction> {
  const res = await request<WallbitTransaction>('POST', '/api/public/v1/operations/internal', params)
  return res
}

// --- Cards ---

export async function getCards(): Promise<Card[]> {
  const res = await request<{ data: Card[] }>('GET', '/api/public/v1/cards')
  return res.data
}

export async function updateCardStatus(
  cardUuid: string,
  status: 'ACTIVE' | 'SUSPENDED',
): Promise<{ uuid: string; status: string }> {
  const res = await request<{ data: { uuid: string; status: string } }>(
    'PATCH',
    `/api/public/v1/cards/${encodeURIComponent(cardUuid)}/status`,
    { status },
  )
  return res.data
}
