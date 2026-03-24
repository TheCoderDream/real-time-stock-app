import { Injectable, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY } from 'rxjs';
import { StockData, StockPriceUpdate } from '../models/stock.model';
import { IStockPriceService, STOCK_PRICE_STREAM, TRACKED_STOCKS } from '../stocks.config';
import { StockApiService } from './stock-api.service';
import { resolveActiveStates, persistActiveStates } from '../utils/active-states.utils';
import { environment } from '@env';

const TRACKED_SYMBOLS = TRACKED_STOCKS.map((s) => s.symbol);

@Injectable({ providedIn: 'root' })
export class StockStateService {
  private readonly stockApi = inject(StockApiService);
  private readonly priceService: IStockPriceService = inject(STOCK_PRICE_STREAM);
  private readonly destroyRef = inject(DestroyRef);

  private readonly stockMap = signal<Record<string, StockData>>({});

  readonly stocks = computed(() => {
    const map = this.stockMap();
    return TRACKED_STOCKS.map((s) => map[s.symbol]).filter(Boolean);
  });

  readonly isLoading = signal(true);

  constructor() {
    this.initializeStocks();
    this.subscribeToPriceStream();
  }

  toggleStock(symbol: string): void {
    this.stockMap.update((map) => {
      const stock = map[symbol];
      if (!stock) return map;

      const newActive = !stock.isActive;
      this.priceService.notifyToggle(symbol, newActive);
      const newMap = { ...map, [symbol]: { ...stock, isActive: newActive } };
      persistActiveStates(Object.fromEntries(Object.entries(newMap).map(([sym, s]) => [sym, s.isActive])));
      return newMap;
    });
  }

  private initializeStocks(): void {
    if (environment.useMock) {
      this.seedMockData();
      return;
    }

    this.stockApi
      .fetchAllStocks()
      .pipe(
        catchError(() => {
          this.seedMockData();
          return EMPTY;
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((stocks) => {
        const activeStates = resolveActiveStates(TRACKED_SYMBOLS);
        const map: Record<string, StockData> = {};
        stocks.forEach((s) => (map[s.symbol] = { ...s, isActive: activeStates[s.symbol] ?? true }));
        this.stockMap.set(map);
        this.isLoading.set(false);
      });
  }

  private seedMockData(): void {
    const basePrices: Record<string, number> = {
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

    const activeStates = resolveActiveStates(TRACKED_SYMBOLS);
    const map: Record<string, StockData> = {};
    TRACKED_STOCKS.forEach((s) => {
      const price = basePrices[s.symbol] ?? 100;
      map[s.symbol] = {
        symbol: s.symbol,
        name: s.name,
        currentPrice: price,
        previousClose: price * 0.99,
        dailyHigh: price * 1.02,
        dailyLow: price * 0.98,
        week52High: price * 1.3,
        week52Low: price * 0.7,
        change: price * 0.01,
        changePercent: 1.0,
        lastTradeTime: Date.now(),
        volume: Math.floor(Math.random() * 10000) + 1000,
        isActive: activeStates[s.symbol] ?? true,
      };
    });

    this.stockMap.set(map);
    this.isLoading.set(false);
  }

  private subscribeToPriceStream(): void {
    this.priceService.prices$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((update) => this.applyPriceUpdate(update));
  }

  private applyPriceUpdate(update: StockPriceUpdate): void {
    this.stockMap.update((map) => {
      const stock = map[update.symbol];
      if (!stock || !stock.isActive) return map;

      const newPrice = update.price;
      const change = newPrice - stock.previousClose;
      const changePercent =
        stock.previousClose !== 0 ? (change / stock.previousClose) * 100 : 0;

      return {
        ...map,
        [update.symbol]: {
          ...stock,
          currentPrice: newPrice,
          change,
          changePercent,
          dailyHigh: Math.max(stock.dailyHigh, newPrice),
          dailyLow: Math.min(stock.dailyLow, newPrice),
          lastTradeTime: update.timestamp,
          volume: stock.volume + update.volume,
        },
      };
    });
  }
}
