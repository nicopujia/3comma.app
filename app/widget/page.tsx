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
