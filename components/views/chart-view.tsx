'use client'

import { useState, useMemo } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { useAppStore } from '@/lib/store'
import { getHistoricalData, getAIExplanation } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const RANGES = ['1W', '1M', '3M', '6M', '1Y', 'ALL'] as const
type Range = (typeof RANGES)[number]

function formatDateLabel(date: Date, range: Range): string {
  if (range === '1W') {
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  }
  if (range === '1M') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
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
  label?: string
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl bg-foreground px-3 py-2 shadow-lg">
      <p className="text-xs font-semibold tabular-nums text-background">
        {new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0,
        }).format(payload[0].value)}
      </p>
    </div>
  )
}

export function ChartView() {
  const [range, setRange] = useState<Range>('1M')
  const accounts = useAppStore((s) => s.accounts)
  const totalLiquidityUSD = useAppStore((s) => s.totalLiquidityUSD)
  const total = totalLiquidityUSD()

  const historicalData = useMemo(() => {
    return getHistoricalData(accounts, range)
  }, [accounts, range])

  const chartData = useMemo(() => {
    // Sample down for performance
    const maxPoints = 60
    const step = Math.max(1, Math.floor(historicalData.length / maxPoints))
    const sampled = historicalData.filter((_, i) => i % step === 0)
    return sampled.map((p) => ({
      date: p.date,
      label: formatDateLabel(p.date, range),
      value: Math.round(p.value),
    }))
  }, [historicalData, range])

  const minValue = Math.min(...chartData.map((d) => d.value)) * 0.97
  const maxValue = Math.max(...chartData.map((d) => d.value)) * 1.02

  const aiText = useMemo(() => getAIExplanation(range, total), [range, total])

  // Thin out x-axis labels
  const xTicks = useMemo(() => {
    const count = range === '1W' ? 7 : range === '1M' ? 5 : 4
    const step = Math.max(1, Math.floor(chartData.length / count))
    return chartData.filter((_, i) => i % step === 0).map((d) => d.label)
  }, [chartData, range])

  return (
    <div className="flex flex-col pb-24 pt-12">
      {/* Range selector */}
      <div className="flex items-center gap-0 px-4 pb-6">
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={cn(
              'flex-1 rounded-xl py-2 text-xs font-semibold transition-all',
              range === r
                ? 'bg-foreground text-background'
                : 'text-muted-foreground active:bg-muted'
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
            <CartesianGrid
              strokeDasharray="0"
              stroke="var(--border)"
              strokeOpacity={0.5}
              vertical={false}
            />
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
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
            />
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

      {/* Divider */}
      <div className="mx-6 mt-6 h-px bg-border" />

      {/* AI explanation */}
      <div className="flex flex-col gap-3 px-6 pt-5">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Analysis
        </p>
        <p className="text-sm leading-relaxed text-foreground text-pretty">{aiText}</p>
      </div>
    </div>
  )
}
