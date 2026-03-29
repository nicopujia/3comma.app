'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Search, Trash2, LogOut } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { ALL_ACCOUNTS } from '@/lib/mock-data'

export default function SettingsPage() {
  const router = useRouter()
  const accounts = useAppStore((s) => s.accounts)
  const addAccount = useAppStore((s) => s.addAccount)
  const removeAccount = useAppStore((s) => s.removeAccount)
  const logout = useAppStore((s) => s.logout)
  const [search, setSearch] = useState('')

  const availableToAdd = useMemo(() => {
    const currentIds = new Set(accounts.map((a) => a.id))
    const all = ALL_ACCOUNTS.filter((a) => !currentIds.has(a.id))
    if (search.trim() === '') return all
    return all.filter((a) =>
      a.name.toLowerCase().includes(search.toLowerCase())
    )
  }, [accounts, search])

  const handleLogout = () => {
    logout()
    router.replace('/')
  }

  return (
    <div className="flex flex-col gap-6 px-6 pt-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/home"
          className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </Link>
        <h1 className="text-lg font-semibold text-foreground">Settings</h1>
      </div>

      {/* Your accounts */}
      <section className="flex flex-col gap-3">
        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Your accounts
        </span>
        <div className="flex flex-col divide-y divide-border">
          {accounts
            .filter((a) => a.id !== 'manual-cash')
            .map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between py-3.5"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground">
                    {account.name}
                  </span>
                  <span className="text-xs capitalize text-muted-foreground">
                    {account.type}
                  </span>
                </div>
                <button
                  onClick={() => removeAccount(account.id)}
                  className="-mr-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-muted-foreground/40 transition-colors hover:bg-negative/10 hover:text-negative"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
        </div>
      </section>

      {/* Add accounts */}
      <section className="flex flex-col gap-3">
        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Add accounts
        </span>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search institutions..."
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
          />
        </div>
        <div className="flex flex-col divide-y divide-border">
          {availableToAdd.map((account) => (
            <div
              key={account.id}
              className="flex items-center justify-between py-3.5"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">
                  {account.name}
                </span>
                <span className="text-xs capitalize text-muted-foreground">
                  {account.type}
                </span>
              </div>
              <button
                onClick={() => addAccount(account.id)}
                className="-mr-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-muted-foreground/40 transition-colors hover:bg-positive/10 hover:text-positive"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          ))}
          {availableToAdd.length === 0 && search.trim() !== '' && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No accounts match &ldquo;{search}&rdquo;
            </p>
          )}
          {availableToAdd.length === 0 && search.trim() === '' && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              All accounts added
            </p>
          )}
        </div>
      </section>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="-mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-negative/20 py-3.5 text-sm font-semibold text-negative transition-colors hover:bg-negative/5"
      >
        <LogOut className="h-4 w-4" />
        Log out
      </button>
    </div>
  )
}
