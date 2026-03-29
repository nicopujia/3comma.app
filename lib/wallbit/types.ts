// Wallbit API response types derived from the OpenAPI spec

// --- Balance ---

export interface CheckingBalance {
  currency: string
  balance: number
}

export interface StockPosition {
  symbol: string
  shares: number
}

// --- Transactions ---

export interface TransactionCurrency {
  code: string
  alias: string
}

export interface WallbitTransaction {
  uuid: string
  type_id: string | number
  external_address: string
  source_currency: TransactionCurrency
  dest_currency: TransactionCurrency
  source_amount: number
  dest_amount: number
  status: string
  created_at: string
  comment: string | null
}

export interface PaginatedTransactions {
  data: WallbitTransaction[]
  pages: number
  current_page: number
  count: number
}

export interface TransactionFilters {
  page?: number
  limit?: number
  status?: string
  type?: string
  currency?: string
  from_date?: string
  to_date?: string
  from_amount?: number
  to_amount?: number
}

// --- Trades ---

export interface TradeRequest {
  symbol: string
  direction: 'BUY' | 'SELL'
  currency: string
  order_type: 'MARKET' | 'LIMIT' | 'STOP' | 'STOP_LIMIT'
  amount?: number
  shares?: number
  limit_price?: number
  stop_price?: number
  time_in_force?: 'DAY' | 'GTC'
}

export interface Trade {
  symbol: string
  direction: 'BUY' | 'SELL'
  amount: number
  shares: number
  status: string
  order_type: string
  limit_price?: number | null
  stop_price?: number | null
  time_in_force?: string | null
  created_at: string
  updated_at: string
}

// --- Account Details ---

export interface AccountAddress {
  street_line_1: string
  street_line_2?: string | null
  city: string
  state?: string
  postal_code: string
  country: string
}

export interface AccountDetails {
  bank_name: string
  currency: string
  account_type: string
  account_number?: string | null
  routing_number?: string | null
  iban?: string | null
  bic?: string | null
  swift_code?: string | null
  holder_name: string
  beneficiary?: string | null
  memo?: string | null
  address?: AccountAddress | null
}

// --- Wallets ---

export interface Wallet {
  address: string
  network: string
  currency_code: string
}

// --- Assets ---

export interface AssetDividend {
  amount: number | null
  yield: number | null
  ex_date: string | null
  payment_date: string | null
}

export interface Asset {
  symbol: string
  name: string
  price: number
  asset_type?: string | null
  exchange?: string | null
  sector?: string | null
  market_cap_m?: string | null
  description?: string | null
  description_es?: string | null
  country?: string | null
  ceo?: string | null
  employees?: string | null
  logo_url: string
  dividend?: AssetDividend | null
}

export interface PaginatedAssets {
  data: Asset[]
  pages: number
  current_page: number
  count: number
}

export interface AssetFilters {
  category?: string
  search?: string
  page?: number
  limit?: number
}

// --- Robo Advisor ---

export interface RoboAdvisorAsset {
  symbol: string
  shares: number
  market_value: number
  price: number
  daily_variation_percentage: number
  weight: number
  logo: string
}

export interface RoboAdvisorPortfolio {
  id: number
  label: string | null
  category: string | null
  portfolio_type: 'ROBOADVISOR' | 'CHEST'
  balance: number
  portfolio_value: number
  cash: number
  cash_available_withdrawal: number
  risk_profile: {
    risk_level: number
    name: string
  } | null
  performance: {
    net_deposits: number
    net_profits: number
    total_deposits: number
    total_withdrawals: number
  }
  assets: RoboAdvisorAsset[]
  allocation: {
    cash: number
    securities: number
  }
  has_pending_transactions: boolean
}

export interface RoboAdvisorDepositRequest {
  robo_advisor_id: number
  amount: number
  from: 'DEFAULT' | 'INVESTMENT'
}

export interface RoboAdvisorWithdrawRequest {
  robo_advisor_id: number
  amount: number
  to: 'DEFAULT' | 'INVESTMENT'
}

export interface RoboAdvisorTransaction {
  uuid: string
  type: 'ROBOADVISOR_DEPOSIT' | 'ROBOADVISOR_WITHDRAW'
  amount: number
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'UNCONFIRMED'
  created_at: string
}

// --- Internal Operations ---

export interface InternalOperationRequest {
  currency: string
  from: 'DEFAULT' | 'INVESTMENT'
  to: 'DEFAULT' | 'INVESTMENT'
  amount: number
}

// --- Cards ---

export interface Card {
  uuid: string
  status: 'ACTIVE' | 'SUSPENDED'
  card_type: string
  card_network: string
  card_last4: string
  expiration: string | null
}

// --- Error ---

export interface WallbitApiError {
  message?: string
  error?: string
  errors?: Record<string, string[]>
}
