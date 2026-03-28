'use client'

'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { SendHorizonal } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { useAppStore } from '@/lib/store'
import { toUSD, FX_ARS_USD } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

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
      return `- ${a.name} [${a.type}]: $${usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD${fxNote}${a.included ? '' : ' [excluded from total]'}`
    })
    .join('\n')

  const recentTxs = [...transactions]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 20)
    .map((tx) => {
      const sign = tx.amount > 0 ? '+' : ''
      return `- [${tx.timestamp.toLocaleDateString()}] ${tx.accountName}: ${sign}$${Math.abs(tx.amount).toFixed(2)} — ${tx.description} (${tx.type})`
    })
    .join('\n')

  return `Total balance: $${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD

Accounts (${accounts.length}):
${accountLines}

Recent transactions (last 20):
${recentTxs}`
}

const SUGGESTED = [
  'Which account has the most money?',
  'Where is most of my money?',
  'What were my biggest expenses recently?',
]

// Nav bar height + safe area — matches the fixed nav in layout.tsx
// The nav uses safe-bottom which adds env(safe-area-inset-bottom) to its own padding.
// We match that here so the chat overlay bottom edge sits flush with the nav top edge.
const NAV_HEIGHT = 'calc(3.5rem + env(safe-area-inset-bottom))'

export default function ChatPage() {
  const accounts = useAppStore((s) => s.accounts)
  const transactions = useAppStore((s) => s.transactions)
  const context = buildContext(accounts, transactions)

  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      prepareSendMessagesRequest: ({ id, messages }) => ({
        body: { id, messages, context },
      }),
    }),
  })

  const isLoading = status === 'streaming' || status === 'submitted'
  const isEmpty = messages.length === 0

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    const text = input.trim()
    if (!text || isLoading) return
    sendMessage({ text })
    setInput('')
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    // Fixed overlay that sits between the top and the nav bar
    <div
      className="fixed inset-x-0 top-0 z-40 flex flex-col bg-background"
      style={{ bottom: NAV_HEIGHT }}
    >
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
              const text = msg.parts
                .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
                .map((p) => p.text)
                .join('')

              return (
                <div key={msg.id} className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
                  <div
                    className={cn(
                      'max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                      isUser
                        ? 'rounded-br-sm bg-foreground text-background'
                        : 'rounded-bl-sm bg-card text-foreground'
                    )}
                  >
                    {isUser ? text : (
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                          ul: ({ children }) => <ul className="ml-4 list-disc space-y-0.5">{children}</ul>,
                          ol: ({ children }) => <ol className="ml-4 list-decimal space-y-0.5">{children}</ol>,
                          li: ({ children }) => <li>{children}</li>,
                          code: ({ children }) => <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">{children}</code>,
                        }}
                      >
                        {text}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              )
            })}

            {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
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
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input — pinned to the bottom edge, directly above the nav bar */}
      <div className="shrink-0 border-t border-border bg-background/95 backdrop-blur-xl">
        <div className="flex items-end gap-2 px-4 pt-3 pb-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              e.target.style.height = 'auto'
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your finances..."
            rows={1}
            disabled={isLoading}
            className="flex-1 resize-none rounded-2xl border border-border bg-card px-4 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
            style={{ minHeight: '44px', maxHeight: '120px' }}
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
