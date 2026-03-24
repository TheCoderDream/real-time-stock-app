import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Subject, throwError } from 'rxjs';
import { StockStateService } from './stock-state.service';
import { StockApiService } from './stock-api.service';
import { STOCK_PRICE_STREAM } from '../stocks.config';
import { StockPriceUpdate } from '../models/stock.model';
import { createPriceUpdate } from '../testing/stock-data.factory';

function makeStream() {
  const subject = new Subject<StockPriceUpdate>();
  const notifyToggle = vi.fn();
  const stream = { prices$: subject.asObservable(), notifyToggle };
  return { subject, notifyToggle, stream };
}

const mockApiService = {
  fetchAllStocks: () => throwError(() => new Error('mock error')),
};

describe('StockStateService', () => {
  let service: StockStateService;
  let subject: Subject<StockPriceUpdate>;
  let notifyToggleSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorage.clear();
    const { subject: s, notifyToggle, stream } = makeStream();
    subject = s;
    notifyToggleSpy = notifyToggle;

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: STOCK_PRICE_STREAM, useValue: stream },
        { provide: StockApiService, useValue: mockApiService },
      ],
    });

    service = TestBed.inject(StockStateService);
  });

  afterEach(() => localStorage.clear());

  describe('initialization', () => {
    it('seeds twelve stocks by default', () => {
      expect(service.stocks().length).toBe(12);
    });

    it('sets isLoading to false after seeding', () => {
      expect(service.isLoading()).toBe(false);
    });

    it('all seeded stocks are active', () => {
      expect(service.stocks().every((s) => s.isActive)).toBe(true);
    });
  });

  describe('toggleStock', () => {
    it('deactivates an active stock', () => {
      const symbol = service.stocks()[0].symbol;
      service.toggleStock(symbol);
      expect(service.stocks().find((s) => s.symbol === symbol)?.isActive).toBe(false);
    });

    it('reactivates an inactive stock', () => {
      const symbol = service.stocks()[0].symbol;
      service.toggleStock(symbol);
      service.toggleStock(symbol);
      expect(service.stocks().find((s) => s.symbol === symbol)?.isActive).toBe(true);
    });

    it('does not affect other stocks when toggling one', () => {
      const symbol = service.stocks()[0].symbol;
      service.toggleStock(symbol);
      expect(service.stocks().filter((s) => s.symbol !== symbol).every((s) => s.isActive)).toBe(true);
    });

    it('ignores unknown symbols gracefully', () => {
      const before = service.stocks().map((s) => s.isActive);
      service.toggleStock('UNKNOWN');
      expect(service.stocks().map((s) => s.isActive)).toEqual(before);
    });

    it('calls notifyToggle with false when deactivating', () => {
      const symbol = service.stocks()[0].symbol;
      service.toggleStock(symbol);
      expect(notifyToggleSpy).toHaveBeenCalledWith(symbol, false);
    });

    it('calls notifyToggle with true when reactivating', () => {
      const symbol = service.stocks()[0].symbol;
      service.toggleStock(symbol);
      service.toggleStock(symbol);
      expect(notifyToggleSpy).toHaveBeenLastCalledWith(symbol, true);
    });
  });

  describe('localStorage persistence', () => {
    it('initializes localStorage on first load when it is empty', () => {
      const saved = JSON.parse(localStorage.getItem('stock-active-states') ?? 'null');
      expect(saved).not.toBeNull();
      expect(Object.keys(saved).length).toBe(12);
      expect(Object.values(saved).every((v) => v === true)).toBe(true);
    });

    it('saves toggle state to localStorage on toggle', () => {
      const symbol = service.stocks()[0].symbol;
      service.toggleStock(symbol);
      const saved = JSON.parse(localStorage.getItem('stock-active-states') ?? '{}');
      expect(saved[symbol]).toBe(false);
    });

    it('restores saved toggle states on initialization', () => {
      const symbol = service.stocks()[0].symbol;
      localStorage.setItem('stock-active-states', JSON.stringify({ [symbol]: false }));

      TestBed.resetTestingModule();
      const { stream } = makeStream();
      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          { provide: STOCK_PRICE_STREAM, useValue: stream },
          { provide: StockApiService, useValue: mockApiService },
        ],
      });
      const freshService = TestBed.inject(StockStateService);

      expect(freshService.stocks().find((s) => s.symbol === symbol)?.isActive).toBe(false);
    });
  });

  describe('applyPriceUpdate (via price stream)', () => {
    it('updates currentPrice for an active stock', () => {
      const symbol = service.stocks()[0].symbol;
      subject.next(createPriceUpdate({ symbol, price: 999.99 }));
      expect(service.stocks().find((s) => s.symbol === symbol)?.currentPrice).toBe(999.99);
    });

    it('recalculates change and changePercent relative to previousClose', () => {
      const symbol = service.stocks()[0].symbol;
      const stock = service.stocks().find((s) => s.symbol === symbol)!;
      const newPrice = stock.previousClose + 10;
      subject.next(createPriceUpdate({ symbol, price: newPrice }));
      const updated = service.stocks().find((s) => s.symbol === symbol)!;
      expect(updated.change).toBeCloseTo(10, 5);
      expect(updated.changePercent).toBeCloseTo((10 / stock.previousClose) * 100, 5);
    });

    it('updates dailyHigh when new price exceeds it', () => {
      const symbol = service.stocks()[0].symbol;
      subject.next(createPriceUpdate({ symbol, price: 99999 }));
      expect(service.stocks().find((s) => s.symbol === symbol)?.dailyHigh).toBe(99999);
    });

    it('updates dailyLow when new price is below it', () => {
      const symbol = service.stocks()[0].symbol;
      subject.next(createPriceUpdate({ symbol, price: 1 }));
      expect(service.stocks().find((s) => s.symbol === symbol)?.dailyLow).toBe(1);
    });

    it('accumulates volume', () => {
      const symbol = service.stocks()[0].symbol;
      const initialVolume = service.stocks().find((s) => s.symbol === symbol)!.volume;
      subject.next(createPriceUpdate({ symbol, volume: 200 }));
      expect(service.stocks().find((s) => s.symbol === symbol)?.volume).toBe(initialVolume + 200);
    });

    it('ignores price updates for inactive stocks', () => {
      const symbol = service.stocks()[0].symbol;
      service.toggleStock(symbol);
      const priceBefore = service.stocks().find((s) => s.symbol === symbol)!.currentPrice;
      subject.next(createPriceUpdate({ symbol, price: 99999 }));
      expect(service.stocks().find((s) => s.symbol === symbol)?.currentPrice).toBe(priceBefore);
    });

    it('ignores price updates for unknown symbols', () => {
      const before = service.stocks().map((s) => s.currentPrice);
      subject.next(createPriceUpdate({ symbol: 'UNKNOWN', price: 1 }));
      expect(service.stocks().map((s) => s.currentPrice)).toEqual(before);
    });
  });
});
