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
            a.id === 'manual-cash' ? { ...a, balance: Math.max(0, amount) } : a
          ),
        })),

      addCashTransaction: (description: string, amount: number) => {
        set((state) => {
          const newTx: Transaction = {
            id: `manual-cash-${Date.now()}`,
            accountId: 'manual-cash',
            accountName: 'Manual Cash',
            description: description || (amount > 0 ? 'Cash received' : 'Cash spent'),
            amount,
            currency: 'USD',
            type: amount > 0 ? 'deposit' : 'payment',
            timestamp: new Date(),
          }
          const cashAccount = state.accounts.find((a) => a.id === 'manual-cash')
          const updatedAccounts = state.accounts.map((a) =>
            a.id === 'manual-cash'
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
                    type: amount > 0 ? 'deposit' : ('payment' as Transaction['type']),
                  }
                : t
            ),
            accounts: state.accounts.map((a) =>
              a.id === 'manual-cash'
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
      merge: (persisted, current) => {
        const p = persisted as PersistedState
        return {
          ...current,
          ...p,
          transactions: (p.transactions ?? []).map((tx) => ({
            ...tx,
            timestamp: new Date(tx.timestamp),
          })),
        }
      },
    }
  )
)
