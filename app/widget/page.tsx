'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import NumberFlow from '@number-flow/react'

export default function WidgetPage() {
  const totalLiquidityUSD = useAppStore((s) => s.totalLiquidityUSD)
  const [hydrated, setHydrated] = useState(false)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    setHydrated(true)
    setTotal(totalLiquidityUSD())
  }, [totalLiquidityUSD])

  if (!hydrated) return null

  return (
    <div className="flex min-h-screen items-center justify-center bg-background font-sans">
      <div className="flex h-[155px] w-[155px] items-center justify-center overflow-hidden rounded-[28px] bg-foreground shadow-2xl">
        <div className="flex items-baseline gap-0.5">
          <span className="text-xl font-light text-background/60">$</span>
          <NumberFlow
            value={Math.round(total)}
            format={{ notation: 'compact', maximumFractionDigits: 1 }}
            className="text-[2.5rem] font-bold leading-none tracking-tight text-background tabular-nums"
          />
        </div>
      </div>
    </div>
  )
}
    update()
    const interval = setInterval(update, 5000)
    return () => clearInterval(interval)
  }, [totalLiquidityUSD])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6 font-sans">
      {/* iOS widget preview */}
      <a
        href="/"
        className="block"
        aria-label="Open app"
      >
        <div className="relative flex h-[155px] w-[155px] flex-col justify-between overflow-hidden rounded-[28px] bg-foreground p-4 shadow-2xl transition-transform active:scale-95">
          {/* Top label */}
          <div className="flex flex-col gap-0.5">
            <p className="text-[9px] font-medium uppercase tracking-widest text-background/50">
              Deployable
            </p>
          </div>

          {/* Number */}
          <div className="flex flex-col gap-0.5">
            <div className="flex items-baseline gap-0.5">
              <span className="text-base font-light text-background/70">$</span>
              <NumberFlow
                value={Math.round(total)}
                format={{ notation: 'compact', maximumFractionDigits: 1 }}
                className="text-[1.75rem] font-bold leading-none tracking-tight text-background tabular-nums"
              />
            </div>
            <p className="text-[9px] text-background/40">{time}</p>
          </div>
        </div>
      </a>
    </div>
  )
}
