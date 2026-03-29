'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  Account,
  ALL_ACCOUNTS,
  DEFAULT_ACCOUNT_IDS,
  toUSD,
  Transaction,
  generateTransactions,
} from './mock-data'

// Bump this when mock data generation changes to force regeneration
const TX_DATA_VERSION = 3
const CASH_ACCOUNT_ID = 'manual-cash'
const CASH_ACCOUNT_NAME = 'Cash'

export interface SavedChart {
  id: string
  label: string
  type: 'bar' | 'line' | 'pie'
  title?: string
  data: Array<{ name: string; value: number }>
  savedAt: number
}

interface PersistedState {
  onboardingComplete: boolean
  selectedAccountIds: string[]
  accounts: Account[]
  transactions: Transaction[]
  txDataVersion?: number
  savedCharts: SavedChart[]
}

interface AppStore extends PersistedState {
  completeOnboarding: (selectedIds: string[]) => void
  resetOnboarding: () => void
  toggleIncluded: (id: string) => void
  updateBalance: (id: string, delta: number) => void
  setCashBalance: (amount: number) => void
  addCashTransaction: (description: string, amount: number) => void
  updateCashTransaction: (id: string, description: string, amount: number) => void
  totalLiquidityUSD: () => number
  activeAccounts: () => Account[]
  saveChart: (chart: Omit<SavedChart, 'id' | 'savedAt'>) => void
  deleteSavedChart: (id: string) => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      onboardingComplete: false,
      selectedAccountIds: DEFAULT_ACCOUNT_IDS,
      accounts: [],
      transactions: [],
      savedCharts: [],

      completeOnboarding: (selectedIds: string[]) => {
        const accounts = ALL_ACCOUNTS.filter((a) => selectedIds.includes(a.id))
        set({
          onboardingComplete: true,
          selectedAccountIds: selectedIds,
          accounts,
          transactions: generateTransactions(accounts),
          txDataVersion: TX_DATA_VERSION,
        })
      },

      resetOnboarding: () =>
        set({
          onboardingComplete: false,
          selectedAccountIds: DEFAULT_ACCOUNT_IDS,
          accounts: [],
          transactions: [],
        }),

      toggleIncluded: (id: string) =>
        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.id === id ? { ...a, included: !a.included } : a
          ),
        })),

      updateBalance: (id: string, delta: number) =>
        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.id === id ? { ...a, balance: Math.max(0, a.balance + delta) } : a
          ),
        })),

      setCashBalance: (amount: number) =>
        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.id === CASH_ACCOUNT_ID ? { ...a, balance: Math.max(0, amount) } : a
          ),
        })),

      addCashTransaction: (description: string, amount: number) => {
        set((state) => {
          const newTx: Transaction = {
            id: `${CASH_ACCOUNT_ID}-${Date.now()}`,
            accountId: CASH_ACCOUNT_ID,
            accountName: CASH_ACCOUNT_NAME,
            description: description || (amount > 0 ? 'Cash received' : 'Cash spent'),
            amount,
            currency: 'USD',
            type: amount > 0 ? 'inflow' : 'outflow',
            timestamp: new Date(),
          }
          const cashAccount = state.accounts.find((a) => a.id === CASH_ACCOUNT_ID)
          const updatedAccounts = state.accounts.map((a) =>
            a.id === CASH_ACCOUNT_ID
              ? { ...a, balance: Math.max(0, a.balance + amount) }
              : a
          )
          return {
            accounts: cashAccount ? updatedAccounts : state.accounts,
            transactions: [newTx, ...state.transactions],
          }
        })
      },

      updateCashTransaction: (id: string, description: string, amount: number) => {
        set((state) => {
          const oldTx = state.transactions.find((t) => t.id === id)
          if (!oldTx) return {}
          const delta = amount - oldTx.amount
          return {
            transactions: state.transactions.map((t) =>
              t.id === id
                ? {
                    ...t,
                    description: description || t.description,
                    amount,
                    type: (amount > 0 ? 'inflow' : 'outflow') as Transaction['type'],
                  }
                : t
            ),
            accounts: state.accounts.map((a) =>
              a.id === CASH_ACCOUNT_ID
                ? { ...a, balance: Math.max(0, a.balance + delta) }
                : a
            ),
          }
        })
      },

      totalLiquidityUSD: () => {
        const { accounts } = get()
        return accounts
          .filter((a) => a.included)
          .reduce((sum, a) => sum + toUSD(a.balance, a.currency), 0)
      },

      activeAccounts: () => get().accounts,

      saveChart: (chart) =>
        set((state) => ({
          savedCharts: [
            ...state.savedCharts,
            { ...chart, id: `chart-${Date.now()}`, savedAt: Date.now() },
          ],
        })),

      deleteSavedChart: (id) =>
        set((state) => ({
          savedCharts: state.savedCharts.filter((c) => c.id !== id),
        })),
    }),
    {
      name: '3comma-store',
      partialize: (state): PersistedState => ({
        onboardingComplete: state.onboardingComplete,
        selectedAccountIds: state.selectedAccountIds,
        accounts: state.accounts,
        transactions: state.transactions,
        savedCharts: state.savedCharts,
      }),
      // JSON.parse turns Date objects into strings — revive them on load
      // Also migrate old transaction types to inflow/outflow
      // Regenerate transactions when TX_DATA_VERSION bumps
      merge: (persisted, current) => {
        const p = persisted as PersistedState
        const INFLOW_TYPES = new Set(['deposit', 'sell', 'inflow'])
        const needsRegen = (p.txDataVersion ?? 0) < TX_DATA_VERSION && p.accounts?.length > 0
        return {
          ...current,
          ...p,
          txDataVersion: needsRegen ? TX_DATA_VERSION : (p.txDataVersion ?? TX_DATA_VERSION),
          transactions: needsRegen
            ? generateTransactions(p.accounts)
            : (p.transactions ?? []).map((tx) => ({
                ...tx,
                timestamp: new Date(tx.timestamp),
                type: INFLOW_TYPES.has(tx.type) ? 'inflow' : 'outflow',
              })),
          accounts: (p.accounts ?? []).map((account) =>
            account.id === CASH_ACCOUNT_ID ? { ...account, name: CASH_ACCOUNT_NAME } : account
          ),
        }
      },
    }
  )
)
