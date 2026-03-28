'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  Account,
  ALL_ACCOUNTS,
  toUSD,
  Transaction,
  generateTransactions,
} from './mock-data'

const CASH_ACCOUNT_ID = 'manual-cash'
const CASH_ACCOUNT_NAME = 'Cash'

interface PersistedState {
  onboardingComplete: boolean
  selectedAccountIds: string[]
  accounts: Account[]
  transactions: Transaction[]
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
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      onboardingComplete: false,
      selectedAccountIds: ALL_ACCOUNTS.map((a) => a.id),
      accounts: [],
      transactions: [],

      completeOnboarding: (selectedIds: string[]) => {
        const accounts = ALL_ACCOUNTS.filter((a) => selectedIds.includes(a.id))
        set({
          onboardingComplete: true,
          selectedAccountIds: selectedIds,
          accounts,
          transactions: generateTransactions(accounts),
        })
      },

      resetOnboarding: () =>
        set({
          onboardingComplete: false,
          selectedAccountIds: ALL_ACCOUNTS.map((a) => a.id),
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
    }),
    {
      name: '3comma-store',
      partialize: (state): PersistedState => ({
        onboardingComplete: state.onboardingComplete,
        selectedAccountIds: state.selectedAccountIds,
        accounts: state.accounts,
        transactions: state.transactions,
      }),
      // JSON.parse turns Date objects into strings — revive them on load
      // Also migrate old transaction types to inflow/outflow
      merge: (persisted, current) => {
        const p = persisted as PersistedState
        const INFLOW_TYPES = new Set(['deposit', 'sell', 'inflow'])
        return {
          ...current,
          ...p,
          accounts: (p.accounts ?? []).map((account) =>
            account.id === CASH_ACCOUNT_ID ? { ...account, name: CASH_ACCOUNT_NAME } : account
          ),
          transactions: (p.transactions ?? []).map((tx) => ({
            ...tx,
            accountName: tx.accountId === CASH_ACCOUNT_ID ? CASH_ACCOUNT_NAME : tx.accountName,
            timestamp: new Date(tx.timestamp),
            type: INFLOW_TYPES.has(tx.type) ? 'inflow' : 'outflow',
          })),
        }
      },
    }
  )
)
