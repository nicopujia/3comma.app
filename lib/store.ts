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
}

interface AppStore extends PersistedState {
  completeOnboarding: (selectedIds: string[]) => void
  resetOnboarding: () => void
  toggleIncluded: (id: string) => void
  updateBalance: (id: string, delta: number) => void
  totalLiquidityUSD: () => number
  activeAccounts: () => Account[]
  transactions: Transaction[]
  activeView: number
  setActiveView: (v: number) => void
  tick: number
  incrementTick: () => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      onboardingComplete: false,
      selectedAccountIds: ALL_ACCOUNTS.map((a) => a.id),
      accounts: [],
      transactions: [],
      activeView: 0,
      tick: 0,

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

      totalLiquidityUSD: () => {
        const { accounts } = get()
        return accounts
          .filter((a) => a.included)
          .reduce((sum, a) => sum + toUSD(a.balance, a.currency), 0)
      },

      activeAccounts: () => get().accounts,

      setActiveView: (v: number) => set({ activeView: v }),

      incrementTick: () => set((s) => ({ tick: s.tick + 1 })),
    }),
    {
      name: '3comma-store',
      partialize: (state): PersistedState => ({
        onboardingComplete: state.onboardingComplete,
        selectedAccountIds: state.selectedAccountIds,
        accounts: state.accounts,
      }),
    }
  )
)
