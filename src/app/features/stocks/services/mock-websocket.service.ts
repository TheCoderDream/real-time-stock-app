import { Injectable } from '@angular/core';
import { Observable, interval, map, scan, share, switchMap, of, delay } from 'rxjs';
import { StockPriceUpdate } from '../models/stock.model';
import { TRACKED_STOCKS } from '../stocks.config';

interface MockStockState {
  symbol: string;
  price: number;
  volume: number;
}

const BASE_PRICES: Record<string, number> = {
  AAPL: 230.0,
  GOOGL: 175.0,
  MSFT: 420.0,
  TSLA: 250.0,
  AMZN: 195.0,
  META: 510.0,
  NVDA: 875.0,
  NFLX: 630.0,
  AMD: 165.0,
  ORCL: 140.0,
  INTC: 30.0,
  CRM: 285.0,
};

@Injectable({ providedIn: 'root' })
export class MockWebSocketService {
  readonly prices$: Observable<StockPriceUpdate>;

  constructor() {
    this.prices$ = this.createMockStream();
  }

  private createMockStream(): Observable<StockPriceUpdate> {
    const states = new Map<string, MockStockState>(
      TRACKED_STOCKS.map((s) => [
        s.symbol,
        {
          symbol: s.symbol,
          price: BASE_PRICES[s.symbol] ?? 100,
          volume: Math.floor(Math.random() * 10000) + 1000,
        },
      ])
    );

    return interval(800).pipe(
      map(() => {
        const symbols = TRACKED_STOCKS.map((s) => s.symbol);
        const symbol = symbols[Math.floor(Math.random() * symbols.length)];
        const state = states.get(symbol)!;

        const changePct = (Math.random() - 0.5) * 0.02;
        state.price = Math.max(1, state.price * (1 + changePct));
        state.volume = Math.floor(Math.random() * 5000) + 500;

        return {
          symbol: state.symbol,
          price: parseFloat(state.price.toFixed(2)),
          volume: state.volume,
          timestamp: Date.now(),
        };
      }),
      share()
    );
  }
}
