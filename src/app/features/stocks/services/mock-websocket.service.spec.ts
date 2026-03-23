import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { MockWebSocketService } from './mock-websocket.service';
import { StockPriceUpdate } from '../models/stock.model';
import { TRACKED_STOCKS } from '../stocks.config';

const VALID_SYMBOLS = new Set(TRACKED_STOCKS.map((s) => s.symbol));

describe('MockWebSocketService', () => {
  let service: MockWebSocketService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(MockWebSocketService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('emits a price update after 800ms', () => {
    let received: StockPriceUpdate | undefined;
    const sub = service.prices$.subscribe((update) => (received = update));

    vi.advanceTimersByTime(800);
    expect(received).toBeDefined();

    sub.unsubscribe();
  });

  it('emits only known stock symbols', () => {
    const receivedSymbols = new Set<string>();
    const sub = service.prices$.subscribe((update) => receivedSymbols.add(update.symbol));

    vi.advanceTimersByTime(800 * 20);

    receivedSymbols.forEach((symbol) => {
      expect(VALID_SYMBOLS.has(symbol)).toBe(true);
    });

    sub.unsubscribe();
  });

  it('emits positive prices', () => {
    const prices: number[] = [];
    const sub = service.prices$.subscribe((update) => prices.push(update.price));

    vi.advanceTimersByTime(800 * 10);

    expect(prices.every((p) => p > 0)).toBe(true);

    sub.unsubscribe();
  });

  it('emits positive volume', () => {
    const volumes: number[] = [];
    const sub = service.prices$.subscribe((update) => volumes.push(update.volume));

    vi.advanceTimersByTime(800 * 10);

    expect(volumes.every((v) => v > 0)).toBe(true);

    sub.unsubscribe();
  });

  it('emits a numeric timestamp', () => {
    let timestamp: number | undefined;
    const sub = service.prices$.subscribe((update) => (timestamp = update.timestamp));

    vi.advanceTimersByTime(800);

    expect(typeof timestamp).toBe('number');
    expect(timestamp).toBeGreaterThan(0);

    sub.unsubscribe();
  });
});
