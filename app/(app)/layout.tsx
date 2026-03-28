'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Home, BarChart2, MessageSquare } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Toaster } from 'sonner'

const TABS = [
  { label: 'Home', href: '/home', Icon: Home },
  { label: 'Chat', href: '/chat', Icon: MessageSquare },
  { label: 'Analysis', href: '/analysis', Icon: BarChart2 },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const onboardingComplete = useAppStore((s) => s.onboardingComplete)
  const router = useRouter()
  const pathname = usePathname()
  // Don't render until Zustand has rehydrated from localStorage
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => { setHydrated(true) }, [])

  useEffect(() => {
    if (hydrated && !onboardingComplete) {
      router.replace('/')
    }
  }, [hydrated, onboardingComplete, router])

  if (!hydrated) return null
  if (!onboardingComplete) return null

  return (
    <div className="flex min-h-dvh flex-col bg-background font-sans">
      <main className="flex-1 overflow-y-auto pb-24">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/90 safe-bottom backdrop-blur-xl">
        <div className="flex items-stretch">
          {TABS.map(({ label, href, Icon }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                aria-label={label}
                className={cn(
                  'flex flex-1 cursor-pointer flex-col items-center gap-1 py-3 transition-colors hover:text-foreground',
                  isActive ? 'text-foreground' : 'text-muted-foreground/50'
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 transition-all',
                    isActive ? 'stroke-[2]' : 'stroke-[1.5]'
                  )}
                />
                <span className={cn('text-[10px] font-medium', isActive ? 'opacity-100' : 'opacity-60')}>
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      <Toaster
        position="top-center"
        toastOptions={{
          style: { borderRadius: '14px', fontSize: '13px', fontWeight: 500 },
        }}
      />
    </div>
  )
}
