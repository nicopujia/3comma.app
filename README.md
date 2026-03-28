# [3comma.app](https://3comma.app)

Simple is better than complex.

All your money, one number. A personal finance dashboard that aggregates multiple financial accounts into a single view.

## What it does

- Shows your total balance across bank accounts, crypto, investments, and cash
- AI chat assistant that understands your financial context
- Historical balance charts with time range analysis (1W/1M/3M/6M/1Y/ALL)
- Transaction list with search, filtering, and editing
- Manual cash tracking with custom transactions
- Mobile-first PWA (installable on phones)
- Dark/light theme support

## Tech stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **State:** Zustand with localStorage persistence
- **Styling:** Tailwind CSS 4 + shadcn/ui (New York theme)
- **Charts:** Recharts
- **AI Chat:** Vercel AI SDK + OpenAI GPT-4o-mini
- **Animations:** @number-flow/react for animated numbers

## Prerequisites

- Node.js 18+ (or Bun/pnpm)

## Setup and execution

### 1. Install dependencies

```bash
npm install
```

Or with other package managers:

```bash
pnpm install
# or
bun install
```

### 2. Run the development server

```bash
npm run dev
```

The app starts at [http://localhost:3000](http://localhost:3000).

### 3. Build for production

```bash
npm run build
npm run start
```

This builds the app and serves it on [http://localhost:3000](http://localhost:3000).

### 4. Lint

```bash
npm run lint
```

## AI chat

The chat feature uses the Vercel AI Gateway. In production (Vercel), it works automatically. By default it's configured with `openai/gpt-4o-mini`, but you can use any supported LLM by changing the model string in `app/api/chat/route.ts` and providing the corresponding API key. Without a key, the app runs fine but the chat page (`/chat`) won't work.

## Project structure

```
app/
  page.tsx              # Root page: onboarding or redirect to /home
  layout.tsx            # Root layout: fonts, theme, PWA metadata
  globals.css           # CSS variables, theme colors (OKLch)
  (app)/
    layout.tsx          # App shell: bottom tab navigation (Home, Chat, Analysis)
    home/page.tsx       # Dashboard: total balance + account breakdown
    chat/page.tsx       # AI chat with financial context
    analysis/page.tsx   # Charts + time range analysis
    transactions/page.tsx # Transaction list with filters and search
  api/chat/route.ts     # Chat API: streams GPT-4o-mini responses
  widget/page.tsx       # Compact balance widget
components/
  onboarding.tsx        # 4-step onboarding flow
  widget-display.tsx    # Widget component
  theme-provider.tsx    # Dark mode provider
  ui/                   # shadcn/ui component library (50+ components)
hooks/
  use-mobile.ts         # Viewport < 768px detection
  use-toast.ts          # Toast notification system
lib/
  store.ts              # Zustand store: accounts, transactions, balances
  mock-data.ts          # Demo accounts, transactions, historical data generation
  utils.ts              # cn() class name helper
public/
  manifest.json         # PWA manifest (standalone mode, start_url: /home)
```

## How it works

1. **First visit:** The root page shows a 4-step onboarding (welcome, account selection, plan selection, confirmation). State is saved to localStorage.
2. **Returning visits:** The root page detects persisted state and redirects straight to `/home`.
3. **Home:** Displays the total balance across all included accounts. Accounts can be toggled on/off. Cash balance can be edited manually.
4. **Chat:** Sends your account summaries and recent transactions as context to GPT-4o-mini. Responses stream in real-time.
5. **Analysis:** Generates synthetic historical data based on current balances and renders it with Recharts. Each time range has a pre-written AI explanation.
6. **Transactions:** Lists all transactions across accounts. Supports search, type/account/amount filters, and editing for manual cash entries.

## Widget

There is a standalone widget at `app/widget/page.tsx` that shows the total balance in compact notation, simulating how it would look on a phone home screen. It can be accessed at the `/widget` path of the deployed app.

## Demo data

The app uses mock financial data out of the box: Wallbit, GrabrFi, Wise, Brubank (ARS), Binance, IBKR, and manual cash. No real bank connections are made. ARS amounts are converted to USD at a hardcoded rate of 1025 ARS/USD.
