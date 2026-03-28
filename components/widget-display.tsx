'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import NumberFlow from '@number-flow/react'

export function WidgetDisplay() {
  const totalLiquidityUSD = useAppStore((s) => s.totalLiquidityUSD)
  const [total, setTotal] = useState(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setTotal(totalLiquidityUSD())
    setReady(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!ready) return null

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
