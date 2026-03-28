'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
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
      <Link
        href="/home"
        aria-label="Open 3comma"
        className="flex h-[155px] w-[155px] cursor-pointer items-center justify-center overflow-hidden rounded-[28px] border border-border bg-card shadow-lg ring-1 ring-border/50 transition-transform active:scale-95"
      >
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Total
          </span>
          <div className="flex items-baseline gap-0.5">
            <span className="text-base font-light text-muted-foreground">$</span>
            <NumberFlow
              value={Math.round(total)}
              format={{ notation: 'compact', maximumFractionDigits: 1 }}
              className="text-[2.25rem] font-bold leading-none tracking-tight text-foreground tabular-nums"
            />
          </div>
        </div>
      </Link>
    </div>
  )
}
