'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useAppStore } from '@/lib/store'
import { getHistoricalData, getAIExplanation } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const RANGES = ['1W', '1M', '3M', '6M', '1Y', 'ALL'] as const
type Range = (typeof RANGES)[number]

function formatDateLabel(date: Date, range: Range): string {
  if (range === '1W') return date.toLocaleDateString('en-US', { weekday: 'short' })
  if (range === '1M') return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

function formatUSD(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}k`
  return `$${value.toFixed(0)}`
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl bg-foreground px-3 py-2 shadow-lg">
      <p className="tabular-nums text-xs font-semibold text-background">
        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(payload[0].value)}
      </p>
    </div>
  )
}

// Typewriter component that streams text character by character
function TypewriterText({ text, speed = 10 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDisplayed('')
    setDone(false)
    if (!text) return
    let i = 0
    const id = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(id)
        setDone(true)
      }
    }, speed)
    return () => clearInterval(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text])

  return (
    <span>
      {displayed}
      {!done && <span className="ml-px inline-block h-3.5 w-0.5 animate-pulse bg-foreground/60 align-middle" />}
    </span>
  )
}

export default function AnalysisPage() {
  const [range, setRange] = useState<Range>('1M')
  const accounts = useAppStore((s) => s.accounts)
  const totalLiquidityUSD = useAppStore((s) => s.totalLiquidityUSD)
  const total = totalLiquidityUSD()

  const historicalData = useMemo(() => getHistoricalData(accounts, range), [accounts, range])

  const chartData = useMemo(() => {
    const maxPoints = 60
    const step = Math.max(1, Math.floor(historicalData.length / maxPoints))
    return historicalData
      .filter((_, i) => i % step === 0)
      .map((p) => ({
        date: p.date,
        label: formatDateLabel(p.date, range),
        value: Math.round(p.value),
      }))
  }, [historicalData, range])

  const minValue = Math.min(...chartData.map((d) => d.value)) * 0.97
  const maxValue = Math.max(...chartData.map((d) => d.value)) * 1.02

  const aiText = useMemo(() => getAIExplanation(range, total), [range, total])

  const xTicks = useMemo(() => {
    const count = range === '1W' ? 7 : range === '1M' ? 5 : 4
    const step = Math.max(1, Math.floor(chartData.length / count))
    return chartData.filter((_, i) => i % step === 0).map((d) => d.label)
  }, [chartData, range])

  const txCount = useAppStore((s) => s.transactions.length)

  return (
    <div className="flex flex-col pb-24 pt-12">
      {/* Range selector */}
      <div className="flex items-center px-4 pb-6">
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={cn(
              'flex-1 cursor-pointer rounded-xl py-2 text-xs font-semibold transition-all',
              range === r
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted'
            )}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="px-2">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="0" stroke="var(--border)" strokeOpacity={0.5} vertical={false} />
            <XAxis
              dataKey="label"
              ticks={xTicks}
              tick={{ fontSize: 10, fill: 'var(--muted-foreground)', dy: 6 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[minValue, maxValue]}
              tickFormatter={formatUSD}
              tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
              axisLine={false}
              tickLine={false}
              width={46}
              tickCount={4}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border)', strokeWidth: 1 }} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--foreground)"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3, fill: 'var(--foreground)', strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Transactions link */}
      <div className="mx-6 mt-4 h-px bg-border" />
      <Link
        href="/transactions"
        className="flex cursor-pointer items-center justify-between px-6 py-4 transition-colors hover:bg-muted/50"
      >
        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Transactions
        </span>
        <div className="flex items-center gap-1.5">
          <span className="tabular-nums text-xs text-muted-foreground/50">{txCount}</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
        </div>
      </Link>

      {/* Analysis text */}
      <div className="mx-6 h-px bg-border" />
      <div className="flex flex-col gap-3 px-6 pt-5 pb-4">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Analysis</p>
        <p className="text-pretty text-sm leading-relaxed text-foreground">
          <TypewriterText text={aiText} speed={10} />
        </p>
      </div>
    </div>
  )
}
