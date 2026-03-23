# Real-Time Stock App

A real-time stock price dashboard built with **Angular 21**. Tracks 4 stocks (Apple, Alphabet, Microsoft, Tesla) with live price updates, on/off toggle per card, color-coded status, and a responsive CSS Grid layout.

**Live demo:** [https://real-time-stock.netlify.app](https://real-time-stock.netlify.app)

---

## Prerequisites

| Tool | Required Version |
|---|---|
| Node.js | v22.x (v22.12 or later) |
| npm | v10+ |
| Angular CLI | v21.x |

### Node version

This project includes a `.nvmrc` file pinned to Node 22. If you use [nvm](https://github.com/nvm-sh/nvm):

```bash
nvm use
```

If Node 22 is not installed yet:

```bash
nvm install 22 && nvm use
```

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm start
```

Open your browser at **http://localhost:4200**

---

## Configuring the API Key

The app connects to [Finnhub](https://finnhub.io) for real-time stock data. To use live data you need a free API key.

1. Register at [https://finnhub.io/register](https://finnhub.io/register) to get your API key
2. Open `src/environments/environment.ts`
3. Replace the `apiKey` value:

```typescript
export const environment = {
  production: false,
  useMock: false,           // set to false for real data
  finnhub: {
    apiKey: 'YOUR_API_KEY', // paste your key here
    wsUrl: 'wss://ws.finnhub.io',
    restUrl: 'https://finnhub.io/api/v1',
  },
};
```

> **Security note:** `environment.ts` is not committed to source control by default if you add it to `.gitignore`. Never expose API keys in public repositories.

---

## Mock Mode vs Live Mode

The `useMock` flag in `environment.ts` controls which data source is used.

### Mock mode (default for development)

```typescript
useMock: true
```

- No API key required
- Prices are randomly generated locally using a random walk algorithm
- Updates every ~800ms
- Safe for offline development and demos

### Live mode (Finnhub)

```typescript
useMock: false
```

- Requires a valid Finnhub API key (see above)
- Connects to `wss://ws.finnhub.io` for real-time WebSocket trade updates
- Fetches initial snapshot (current price, daily high/low, 52-week high/low) from the Finnhub REST API on startup
- Auto-reconnects on disconnect (up to 5 retries with 3s delay)

---

## Available Scripts

| Command | Description |
|---|---|
| `npm start` | Start dev server at `http://localhost:4200` |
| `npm run build` | Production build into `dist/` |
| `npm run watch` | Development build with file watching |
| `npm test` | Run unit tests with Vitest (watch mode) |

---

## Running Tests

The project uses **Vitest** (via `@angular/build:unit-test`) with `jsdom` as the test environment. No Zone.js — all component tests use `provideZonelessChangeDetection()`.

### Run all tests once

```bash
npm test -- --no-watch
```

### Run in watch mode (re-runs on file save)

```bash
npm test
```

### Run a single spec file

```bash
npx ng test --no-watch --include="**/stock.utils.spec.ts"
```

### What is covered

| Layer | Spec file | What is tested |
|---|---|---|
| Pure functions | `stock.utils.spec.ts` | `getPriceDirection`, `formatChange`, `formatChangePercent` |
| Pipe | `price-format.pipe.spec.ts` | null / undefined / number / custom decimals |
| Directive | `price-direction.directive.spec.ts` | Host class switching, mutual exclusivity |
| Service | `stock-api.service.spec.ts` | HTTP requests, response mapping, 52-week fallback |
| Service | `stock-state.service.spec.ts` | Initialization, `toggleStock`, `applyPriceUpdate`, inactive guard |
| Service | `mock-websocket.service.spec.ts` | Emission timing, valid symbols, positive price/volume |
| Component | `stock-toggle.spec.ts` | ON/OFF label, `aria-checked`, click toggles, output |
| Component | `stock-card-header.spec.ts` | Symbol in h2, name in span, reactive updates |
| Component | `stock-details-row.spec.ts` | Label, price-formatted value, reactive updates |
| Component | `stock-price-change.spec.ts` | Formatted price, +/- sign, percent in parentheses |
| Component | `stock-card.spec.ts` | Sub-components rendered, direction class, `toggleChanged` output |
| Component | `stock-dashboard.spec.ts` | Loading state, card count, `toggleStock` called on event |

### Test helpers

`src/app/features/stocks/testing/stock-data.factory.ts` exports two builder functions used across all specs:

```typescript
createStockData(overrides?)   // returns a full StockData object
createPriceUpdate(overrides?) // returns a StockPriceUpdate object
```

---

## Project Structure

```
src/app/
  features/
    stocks/
      components/
        stock-dashboard/    # Smart container — CSS Grid layout
        stock-card/         # Composition shell — assembles sub-components
        stock-card-header/  # Symbol + company name
        stock-price-change/ # Current price, change, change%
        stock-details-row/  # Reusable label-value row
        stock-toggle/       # ON/OFF toggle switch
      services/
        stock-state.service.ts         # Central signal-based state
        finnhub-websocket.service.ts   # Live WebSocket connection
        mock-websocket.service.ts      # Mock price generator
        stock-api.service.ts           # REST: initial quote + 52-week data
      models/
        stock.model.ts      # Shared TypeScript interfaces
      utils/
        stock.utils.ts      # Pure formatting functions
  shared/
    directives/
      price-direction.directive.ts  # Applies color classes (up/down/neutral)
    pipes/
      price-format.pipe.ts           # Formats numbers as $xxx.xx
  environments/
    environment.ts          # Development config (useMock, apiKey)
    environment.prod.ts     # Production config
```

---

## Features

- **Real-time updates** via Finnhub WebSocket or local mock generator
- **Toggle per card** — click ON/OFF to pause/resume updates for a specific stock
- **Color coding** — green (price up), red (price down), grey (toggled off)
- **Responsive layout** — 1 column on mobile, 2 on tablet, 4 on desktop
- **Desktop-only data** — 52-week high/low shown only on screens ≥ 768px
- **Angular 21** — zoneless change detection, signals, standalone components, `OnPush` everywhere
