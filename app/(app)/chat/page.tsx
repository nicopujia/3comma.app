'use client'


import { useState, useRef, useEffect, useCallback, useMemo } from 'react'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, UIMessage } from 'ai'
import { SendHorizonal, Bookmark, Check } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { useAppStore } from '@/lib/store'
import { toUSD, FX_ARS_USD } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { ToolInvocation as ToolInvocationComponent } from '@/components/tool-invocations/tool-invocation'

const CHART_COLORS = [
  '#18181b', // zinc-900
  '#52525b', // zinc-600
  '#a1a1aa', // zinc-400
  '#d4d4d8', // zinc-300
  '#71717a', // zinc-500
  '#3f3f46', // zinc-700
  '#e4e4e7', // zinc-200
  '#27272a', // zinc-800
]

interface ChartSpec {
  type: 'bar' | 'line' | 'pie'
  title?: string
  data: Array<{ name: string; value: number }>
}

function formatUSD(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}k`
  return `$${value.toFixed(0)}`
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name?: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg bg-foreground px-2.5 py-1.5 shadow-lg">
      {label && <p className="text-[10px] text-background/60">{label}</p>}
      <p className="tabular-nums text-xs font-semibold text-background">
        {formatUSD(payload[0].value)}
      </p>
    </div>
  )
}

function PieLegend({ data }: { data: ChartSpec['data'] }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  return (
    <div className="flex flex-col gap-1.5">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
          />
          <span className="truncate text-[11px] text-foreground/70">{d.name}</span>
          <span className="ml-auto tabular-nums text-[11px] font-medium text-foreground">
            {total > 0 ? `${((d.value / total) * 100).toFixed(0)}%` : '0%'}
          </span>
        </div>
      ))}
    </div>
  )
}

function chartFingerprint(spec: ChartSpec): string {
  return JSON.stringify({ t: spec.type, d: spec.data })
}

function ChatChart({ spec, onSave, isSaved }: { spec: ChartSpec; onSave?: (spec: ChartSpec) => void; isSaved?: boolean }) {
  if (!spec.data?.length) return null

  const handleSave = () => {
    if (isSaved || !onSave) return
    onSave(spec)
  }

  return (
    <div className="my-2 overflow-hidden rounded-xl border border-border/50 bg-background p-3">
      <div className="flex items-center justify-between">
        {spec.title ? (
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {spec.title}
          </p>
        ) : <span />}
        {onSave && (
          <button
            onClick={handleSave}
            disabled={isSaved}
            className={cn(
              'mb-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium transition-all',
              isSaved
                ? 'text-foreground'
                : 'cursor-pointer text-muted-foreground/60 hover:text-muted-foreground'
            )}
          >
            {isSaved ? <Check className="h-3 w-3" /> : <Bookmark className="h-3 w-3" />}
            {isSaved ? 'Saved' : 'Save'}
          </button>
        )}
      </div>

      {spec.type === 'pie' ? (
        <div className="flex items-center gap-4">
          <div className="w-[120px] shrink-0">
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie
                  data={spec.data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={32}
                  outerRadius={55}
                  paddingAngle={2}
                  stroke="none"
                >
                  {spec.data.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <PieLegend data={spec.data} />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={160}>
          {spec.type === 'line' ? (
            <LineChart data={spec.data} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeOpacity={0.4} vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                axisLine={false}
                tickLine={false}
                tickMargin={8}
              />
              <YAxis
                tickFormatter={formatUSD}
                tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                axisLine={false}
                tickLine={false}
                width={52}
                tickCount={4}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--border)', strokeWidth: 1 }} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="var(--foreground)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3.5, fill: 'var(--foreground)', strokeWidth: 0 }}
              />
            </LineChart>
          ) : (
            <BarChart data={spec.data} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeOpacity={0.4} vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                axisLine={false}
                tickLine={false}
                tickMargin={8}
              />
              <YAxis
                tickFormatter={formatUSD}
                tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                axisLine={false}
                tickLine={false}
                width={52}
                tickCount={4}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.3 }} />
              <Bar dataKey="value" fill="var(--foreground)" radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          )}
        </ResponsiveContainer>
      )}
    </div>
  )
}

/** Strip <think>...</think> blocks (used for chain-of-thought reasoning) */
function stripThinking(text: string): string {
  // Remove complete think blocks
  let result = text.replace(/<think>[\s\S]*?<\/think>/g, '')
  // Remove an unclosed <think> block at the end (still streaming)
  result = result.replace(/<think>[\s\S]*$/, '')
  return result.trim()
}

/** Split already-cleaned text into segments of plain text and chart specs */
function parseCharts(text: string): Array<{ type: 'text'; content: string } | { type: 'chart'; spec: ChartSpec }> {
  const parts: Array<{ type: 'text'; content: string } | { type: 'chart'; spec: ChartSpec }> = []
  const regex = /```chart\s*\n?([\s\S]*?)```|<chart>\s*([\s\S]*?)\s*<\/chart>/g
  let last = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push({ type: 'text', content: text.slice(last, match.index) })
    }
    try {
      const json = match[1] ?? match[2]
      const spec = JSON.parse(json) as ChartSpec
      if (spec.data && Array.isArray(spec.data)) {
        parts.push({ type: 'chart', spec })
      }
    } catch {
      parts.push({ type: 'text', content: match[0] })
    }
    last = match.index + match[0].length
  }
  if (last < text.length) {
    parts.push({ type: 'text', content: text.slice(last) })
  }
  return parts
}

function buildContext(
  accounts: ReturnType<typeof useAppStore.getState>['accounts'],
  transactions: ReturnType<typeof useAppStore.getState>['transactions']
): string {
  const total = accounts
    .filter((a) => a.included)
    .reduce((sum, a) => sum + toUSD(a.balance, a.currency), 0)

  const accountLines = accounts
    .map((a) => {
      const usd = toUSD(a.balance, a.currency)
      const fxNote = a.currency === 'ARS' ? ` (${a.balance.toLocaleString()} ARS at ${FX_ARS_USD} ARS/USD)` : ''
      const wallbitNote = a.id === 'wallbit' ? ' [USE TOOLS for real-time data — balance here may be stale]' : ''
      return `- ${a.name} [${a.type}, ${a.currency}]: $${usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD${fxNote}${a.included ? '' : ' [excluded from total]'}${wallbitNote}`
    })
    .join('\n')

  // Per-account monthly breakdown
  const acctMonthly: Record<string, Record<string, { inflow: number; outflow: number }>> = {}
  transactions.forEach((tx) => {
    const month = `${tx.timestamp.getFullYear()}-${String(tx.timestamp.getMonth() + 1).padStart(2, '0')}`
    if (!acctMonthly[tx.accountName]) acctMonthly[tx.accountName] = {}
    if (!acctMonthly[tx.accountName][month]) acctMonthly[tx.accountName][month] = { inflow: 0, outflow: 0 }
    const usd = tx.currency === 'ARS' ? Math.abs(tx.amount) / FX_ARS_USD : Math.abs(tx.amount)
    if (tx.type === 'inflow') acctMonthly[tx.accountName][month].inflow += usd
    else acctMonthly[tx.accountName][month].outflow += usd
  })
  const acctMonthlyLines = Object.entries(acctMonthly)
    .map(([name, months]) => {
      const lines = Object.entries(months)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([m, s]) => `    ${m}: in $${s.inflow.toFixed(0)}, out $${s.outflow.toFixed(0)}`)
        .join('\n')
      return `  ${name}:\n${lines}`
    })
    .join('\n')

  // Spending by category (description)
  const categorySpend: Record<string, number> = {}
  transactions.forEach((tx) => {
    if (tx.type !== 'outflow') return
    const usd = tx.currency === 'ARS' ? Math.abs(tx.amount) / FX_ARS_USD : Math.abs(tx.amount)
    categorySpend[tx.description] = (categorySpend[tx.description] ?? 0) + usd
  })
  const categoryLines = Object.entries(categorySpend)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15)
    .map(([desc, total]) => `- ${desc}: $${total.toFixed(0)}`)
    .join('\n')

  // Monthly totals
  const monthlySummary: Record<string, { inflow: number; outflow: number; count: number }> = {}
  transactions.forEach((tx) => {
    const key = `${tx.timestamp.getFullYear()}-${String(tx.timestamp.getMonth() + 1).padStart(2, '0')}`
    if (!monthlySummary[key]) monthlySummary[key] = { inflow: 0, outflow: 0, count: 0 }
    const usd = tx.currency === 'ARS' ? Math.abs(tx.amount) / FX_ARS_USD : Math.abs(tx.amount)
    if (tx.type === 'inflow') monthlySummary[key].inflow += usd
    else monthlySummary[key].outflow += usd
    monthlySummary[key].count++
  })
  const monthlyLines = Object.entries(monthlySummary)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, s]) => {
      const savingsRate = s.inflow > 0 ? (((s.inflow - s.outflow) / s.inflow) * 100).toFixed(1) : '0.0'
      return `- ${month}: inflow $${s.inflow.toFixed(0)}, outflow $${s.outflow.toFixed(0)}, net ${s.inflow - s.outflow >= 0 ? '+' : ''}$${(s.inflow - s.outflow).toFixed(0)}, savings rate ${savingsRate}% (${s.count} txns)`
    })
    .join('\n')

  const recentTxs = [...transactions]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 30)
    .map((tx) => {
      const sign = tx.amount > 0 ? '+' : ''
      return `- [${tx.timestamp.toLocaleDateString()}] ${tx.accountName}: ${sign}$${Math.abs(tx.amount).toFixed(2)} — ${tx.description} (${tx.type})`
    })
    .join('\n')

  return `Total balance: $${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD

Accounts (${accounts.length}):
${accountLines}

Monthly summary (USD equivalent):
${monthlyLines}

Top spending categories (all time, USD):
${categoryLines}

Per-account monthly breakdown (USD):
${acctMonthlyLines}

Recent transactions (last 30):
${recentTxs}`
}

const SUGGESTED = [
  'How is my capital distributed?',
  'How has my savings rate evolved over the past year?',
  'Which month did I spend the most?',
]

const CHAT_STORAGE_KEY = '3comma-chat'
const DRAFT_STORAGE_KEY = '3comma-chat-draft'

function loadPersistedMessages(): UIMessage[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY)
    if (!raw) return []
    const msgs = JSON.parse(raw) as UIMessage[]
    // Filter out stale approval-requested states (approval IDs are invalid across sessions)
    return msgs.map((msg) => ({
      ...msg,
      parts: msg.parts.filter((p) => {
        if (p.type.startsWith('tool-')) {
          const state = (p as { state?: string }).state
          return state !== 'approval-requested' && state !== 'approval-responded'
        }
        return true
      }),
    }))
  } catch {
    return []
  }
}

function persistMessages(messages: UIMessage[]) {
  try {
    if (messages.length === 0) {
      localStorage.removeItem(CHAT_STORAGE_KEY)
    } else {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages))
    }
  } catch { /* quota exceeded — ignore */ }
}

// Nav bar height + safe area — matches the fixed nav in layout.tsx
const NAV_HEIGHT = 'calc(3.5rem + env(safe-area-inset-bottom))'
const MIN_INPUT_HEIGHT = 44
const INPUT_BOTTOM_PADDING = 12

export default function ChatPage() {
  const accounts = useAppStore((s) => s.accounts)
  const transactions = useAppStore((s) => s.transactions)
  const saveChart = useAppStore((s) => s.saveChart)
  const savedCharts = useAppStore((s) => s.savedCharts)
  const savedFingerprints = useMemo(
    () => new Set(savedCharts.map((c) => chartFingerprint(c))),
    [savedCharts]
  )
  const contextRef = useRef('')
  contextRef.current = buildContext(accounts, transactions)

  const [input, setInput] = useState(() => {
    if (typeof window === 'undefined') return ''
    return localStorage.getItem(DRAFT_STORAGE_KEY) ?? ''
  })
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const composerRef = useRef<HTMLDivElement>(null)

  const [initialMessages] = useState(loadPersistedMessages)

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        prepareSendMessagesRequest: ({ id, messages }) => ({
          body: { id, messages: messages.slice(-20), context: contextRef.current },
        }),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const { messages, sendMessage, setMessages, status, addToolApprovalResponse } = useChat({
    transport,
    messages: initialMessages.length > 0 ? initialMessages : undefined,
    sendAutomaticallyWhen: ({ messages: msgs }) => {
      // Only auto-send when the last message has a tool part that was just approved/denied
      const last = msgs[msgs.length - 1]
      if (!last || last.role !== 'assistant') return false
      return last.parts.some(
        (p) =>
          p.type.startsWith('tool-') &&
          (p as { state?: string }).state === 'approval-responded',
      )
    },
  })

  const isLoading = status === 'streaming' || status === 'submitted'
  const isEmpty = messages.length === 0

  const handleResetChat = useCallback(() => {
    setMessages([])
    persistMessages([])
  }, [setMessages])

  // Persist messages on change
  useEffect(() => {
    persistMessages(messages)
  }, [messages])

  const handleSaveChart = useCallback((spec: ChartSpec) => {
    // Use the title truncated to 1-3 words as the label, or chart type
    const label = spec.title
      ? spec.title.split(/\s+/).slice(0, 3).join(' ')
      : spec.type.charAt(0).toUpperCase() + spec.type.slice(1)
    saveChart({ label, type: spec.type, title: spec.title, data: spec.data })
  }, [saveChart])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const resizeInput = useCallback((element?: HTMLTextAreaElement | null) => {
    const textarea = element ?? inputRef.current
    if (!textarea) return

    textarea.style.height = 'auto'

    const composerBottom = composerRef.current?.getBoundingClientRect().bottom
    const availableHeight = Math.max(
      MIN_INPUT_HEIGHT,
      (composerBottom ?? window.innerHeight) - textarea.getBoundingClientRect().top - INPUT_BOTTOM_PADDING
    )

    textarea.style.height = `${Math.max(MIN_INPUT_HEIGHT, Math.min(textarea.scrollHeight, availableHeight))}px`
    textarea.style.overflowY = textarea.scrollHeight > availableHeight ? 'auto' : 'hidden'
  }, [])

  useEffect(() => {
    resizeInput()
    try { localStorage.setItem(DRAFT_STORAGE_KEY, input) } catch {}
  }, [input, resizeInput])

  useEffect(() => {
    const handleResize = () => resizeInput()

    handleResize()
    window.addEventListener('resize', handleResize)
    window.visualViewport?.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.visualViewport?.removeEventListener('resize', handleResize)
    }
  }, [resizeInput])

  const handleSend = () => {
    const text = input.trim()
    if (!text || isLoading) return
    sendMessage({ text })
    setInput('')
    try { localStorage.removeItem(DRAFT_STORAGE_KEY) } catch {}
    requestAnimationFrame(() => resizeInput())
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      className="fixed inset-x-0 top-0 z-40 flex flex-col bg-background"
      style={{ bottom: NAV_HEIGHT }}
    >
      {/* Reset button */}
      {!isEmpty && (
        <div className="flex shrink-0 items-center justify-end border-b border-border px-4 py-2">
          <button
            onClick={handleResetChat}
            disabled={isLoading}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
New chat
          </button>
        </div>
      )}

      {/* Scrollable messages */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        {isEmpty ? (
          <div className="flex flex-1 flex-col justify-end gap-2 px-4 py-4">
            {SUGGESTED.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage({ text: s })}
                className="cursor-pointer rounded-2xl border border-border bg-card px-4 py-3 text-left text-sm text-foreground transition-colors hover:bg-muted active:bg-muted"
              >
                {s}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4 px-4 py-6">
            {messages.map((msg) => {
              const isUser = msg.role === 'user'

              // For user messages, just extract text
              if (isUser) {
                const text = msg.parts
                  .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
                  .map((p) => p.text)
                  .join('')
                return (
                  <div key={msg.id} className="flex justify-end">
                    <div className="max-w-[82%] rounded-2xl rounded-br-sm bg-foreground px-4 py-3 text-sm leading-relaxed text-background">
                      {text}
                    </div>
                  </div>
                )
              }

              // Assistant messages: render each part (text + tool-<name>)
              const hasVisibleContent = msg.parts.some((p) => {
                if (p.type === 'text') return !!stripThinking((p as { text: string }).text)
                if (p.type.startsWith('tool-')) return true
                return false
              })
              if (!hasVisibleContent) return null

              return (
                <div key={msg.id} className="flex justify-start">
                  <div className="max-w-[82%] rounded-2xl rounded-bl-sm bg-card px-4 py-3 text-sm leading-relaxed text-foreground">
                    {msg.parts.map((part, i) => {
                      // Text parts — existing markdown + chart rendering
                      if (part.type === 'text') {
                        const cleaned = stripThinking((part as { text: string }).text)
                        if (!cleaned) return null
                        return (
                          <div key={i}>
                            {parseCharts(cleaned).map((segment, j) =>
                              segment.type === 'chart' ? (
                                <ChatChart key={j} spec={segment.spec} onSave={handleSaveChart} isSaved={savedFingerprints.has(chartFingerprint(segment.spec))} />
                              ) : (
                                <ReactMarkdown
                                  key={j}
                                  components={{
                                    p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                                    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                                    ul: ({ children }) => <ul className="ml-4 list-disc space-y-0.5">{children}</ul>,
                                    ol: ({ children }) => <ol className="ml-4 list-decimal space-y-0.5">{children}</ol>,
                                    li: ({ children }) => <li>{children}</li>,
                                    code: ({ children }) => <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">{children}</code>,
                                  }}
                                >
                                  {segment.content}
                                </ReactMarkdown>
                              )
                            )}
                          </div>
                        )
                      }

                      // Tool parts — type is "tool-<toolName>"
                      if (part.type.startsWith('tool-')) {
                        const toolPart = part as {
                          type: string
                          toolCallId: string
                          state: string
                          input?: Record<string, unknown>
                          output?: unknown
                          errorText?: string
                          approval?: { id: string; approved?: boolean }
                        }
                        const toolName = toolPart.type.replace('tool-', '')
                        return (
                          <ToolInvocationComponent
                            key={i}
                            toolName={toolName}
                            state={toolPart.state}
                            input={toolPart.input}
                            output={toolPart.output}
                            errorText={toolPart.errorText}
                            approval={toolPart.approval}
                            onApprove={(id) => addToolApprovalResponse({ id, approved: true })}
                            onDeny={(id) => addToolApprovalResponse({ id, approved: false, reason: 'User cancelled' })}
                            isStreaming={isLoading}
                          />
                        )
                      }

                      // Skip other part types (reasoning, step-start, etc.)
                      return null
                    })}
                  </div>
                </div>
              )
            })}

            {isLoading && (() => {
              const lastMsg = messages[messages.length - 1]
              const lastText = lastMsg?.parts
                ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
                .map((p) => p.text)
                .join('') ?? ''
              const hasToolParts = lastMsg?.parts?.some((p) => p.type.startsWith('tool-')) ?? false
              const noAssistantYet = lastMsg?.role !== 'assistant'
              const visibleText = lastMsg?.role === 'assistant' ? stripThinking(lastText) : ''

              if (noAssistantYet || (lastMsg?.role === 'assistant' && !visibleText && !hasToolParts)) {
                return (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-sm bg-card px-4 py-3">
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50"
                            style={{ animationDelay: `${i * 150}ms` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )
              }
              return null
            })()}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input — pinned to the bottom edge, directly above the nav bar */}
      <div ref={composerRef} className="mb-2 shrink-0 border-t border-border bg-background/95 backdrop-blur-xl">
        <div className="flex items-end gap-2 px-4 py-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your finances..."
            rows={1}
            disabled={isLoading}
            className="flex-1 resize-none overflow-y-hidden rounded-2xl border border-border bg-card px-4 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
            style={{ minHeight: `${MIN_INPUT_HEIGHT}px` }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
            className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-2xl bg-foreground text-background transition-opacity disabled:cursor-not-allowed disabled:opacity-30 hover:opacity-80"
          >
            <SendHorizonal className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
