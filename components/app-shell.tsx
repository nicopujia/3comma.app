'use client'

import { useEffect, useRef, useCallback } from 'react'
import { BarChart2, Home, List } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { HomeView } from './views/home-view'
import { ChartView } from './views/chart-view'
import { TransactionsView } from './views/transactions-view'
import { cn } from '@/lib/utils'
import { Toaster } from 'sonner'

const VIEWS = [
  { label: 'Home', Icon: Home, Component: HomeView },
  { label: 'Chart', Icon: BarChart2, Component: ChartView },
  { label: 'Activity', Icon: List, Component: TransactionsView },
]

export function AppShell() {
  const activeView = useAppStore((s) => s.activeView)
  const setActiveView = useAppStore((s) => s.setActiveView)
  const incrementTick = useAppStore((s) => s.incrementTick)

  // Live updates every 4 seconds
  useEffect(() => {
    const interval = setInterval(incrementTick, 4000)
    return () => clearInterval(interval)
  }, [incrementTick])

  // Swipe gesture
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }, [])

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null || touchStartY.current === null) return
      const dx = e.changedTouches[0].clientX - touchStartX.current
      const dy = e.changedTouches[0].clientY - touchStartY.current

      // Only horizontal swipes (dx > dy both in abs)
      if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return

      if (dx < 0 && activeView < VIEWS.length - 1) {
        setActiveView(activeView + 1)
      } else if (dx > 0 && activeView > 0) {
        setActiveView(activeView - 1)
      }
      touchStartX.current = null
      touchStartY.current = null
    },
    [activeView, setActiveView]
  )

  const ActiveComponent = VIEWS[activeView].Component

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      {/* Main content with swipe */}
      <main
        className="flex-1 overflow-y-auto"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <ActiveComponent />
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/90 backdrop-blur-xl">
        <div className="flex items-stretch">
          {VIEWS.map(({ label, Icon }, i) => {
            const isActive = i === activeView
            return (
              <button
                key={label}
                onClick={() => setActiveView(i)}
                aria-label={label}
                className={cn(
                  'flex flex-1 flex-col items-center gap-1 pb-safe py-3 transition-colors',
                  isActive ? 'text-foreground' : 'text-muted-foreground/50'
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 transition-all',
                    isActive ? 'stroke-[2]' : 'stroke-[1.5]'
                  )}
                />
                <span
                  className={cn(
                    'text-[10px] font-medium transition-all',
                    isActive ? 'opacity-100' : 'opacity-60'
                  )}
                >
                  {label}
                </span>
              </button>
            )
          })}
        </div>
        {/* iOS safe area spacing */}
        <div className="h-safe-area-inset-bottom" />
      </nav>

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: '14px',
            fontSize: '13px',
            fontWeight: 500,
          },
        }}
      />
    </div>
  )
}
