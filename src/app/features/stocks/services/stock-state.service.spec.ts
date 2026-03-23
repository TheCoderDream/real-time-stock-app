import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Subject, throwError } from 'rxjs';
import { StockStateService } from './stock-state.service';
import { StockApiService } from './stock-api.service';
import { STOCK_PRICE_STREAM } from '../stocks.config';
import { StockPriceUpdate } from '../models/stock.model';
import { createStockData, createPriceUpdate } from '../testing/stock-data.factory';

describe('StockStateService', () => {
  let service: StockStateService;
  let priceSubject: Subject<StockPriceUpdate>;

  beforeEach(() => {
    priceSubject = new Subject<StockPriceUpdate>();

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: STOCK_PRICE_STREAM, useValue: priceSubject.asObservable() },
        {
          provide: StockApiService,
          useValue: { fetchAllStocks: () => throwError(() => new Error('mock error')) },
        },
      ],
    });

    service = TestBed.inject(StockStateService);
  });

  describe('initialization (mock mode)', () => {
    it('seeds four stocks by default', () => {
      expect(service.stocks().length).toBe(4);
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
      const stock = service.stocks().find((s) => s.symbol === symbol);
      expect(stock?.isActive).toBe(false);
    });

    it('reactivates an inactive stock', () => {
      const symbol = service.stocks()[0].symbol;
      service.toggleStock(symbol);
      service.toggleStock(symbol);
      const stock = service.stocks().find((s) => s.symbol === symbol);
      expect(stock?.isActive).toBe(true);
    });

    it('does not affect other stocks when toggling one', () => {
      const symbol = service.stocks()[0].symbol;
      service.toggleStock(symbol);
      const others = service.stocks().filter((s) => s.symbol !== symbol);
      expect(others.every((s) => s.isActive)).toBe(true);
    });

    it('ignores unknown symbols gracefully', () => {
      const before = service.stocks().map((s) => s.isActive);
      service.toggleStock('UNKNOWN');
      const after = service.stocks().map((s) => s.isActive);
      expect(after).toEqual(before);
    });
  });

  describe('applyPriceUpdate (via price stream)', () => {
    it('updates currentPrice for an active stock', () => {
      const symbol = service.stocks()[0].symbol;
      const newPrice = 999.99;

      priceSubject.next(createPriceUpdate({ symbol, price: newPrice }));

      const stock = service.stocks().find((s) => s.symbol === symbol);
      expect(stock?.currentPrice).toBe(newPrice);
    });

    it('recalculates change and changePercent relative to previousClose', () => {
      const symbol = service.stocks()[0].symbol;
      const stock = service.stocks().find((s) => s.symbol === symbol)!;
      const previousClose = stock.previousClose;
      const newPrice = previousClose + 10;

      priceSubject.next(createPriceUpdate({ symbol, price: newPrice }));

      const updated = service.stocks().find((s) => s.symbol === symbol)!;
      expect(updated.change).toBeCloseTo(10, 5);
      expect(updated.changePercent).toBeCloseTo((10 / previousClose) * 100, 5);
    });

    it('updates dailyHigh when new price exceeds it', () => {
      const symbol = service.stocks()[0].symbol;
      priceSubject.next(createPriceUpdate({ symbol, price: 99999 }));
      const stock = service.stocks().find((s) => s.symbol === symbol)!;
      expect(stock.dailyHigh).toBe(99999);
    });

    it('updates dailyLow when new price is below it', () => {
      const symbol = service.stocks()[0].symbol;
      priceSubject.next(createPriceUpdate({ symbol, price: 1 }));
      const stock = service.stocks().find((s) => s.symbol === symbol)!;
      expect(stock.dailyLow).toBe(1);
    });

    it('accumulates volume', () => {
      const symbol = service.stocks()[0].symbol;
      const initialVolume = service.stocks().find((s) => s.symbol === symbol)!.volume;
      priceSubject.next(createPriceUpdate({ symbol, volume: 200 }));
      const stock = service.stocks().find((s) => s.symbol === symbol)!;
      expect(stock.volume).toBe(initialVolume + 200);
    });

    it('ignores price updates for inactive stocks', () => {
      const symbol = service.stocks()[0].symbol;
      service.toggleStock(symbol);
      const priceBeforeUpdate = service.stocks().find((s) => s.symbol === symbol)!.currentPrice;

      priceSubject.next(createPriceUpdate({ symbol, price: 99999 }));

      const stock = service.stocks().find((s) => s.symbol === symbol)!;
      expect(stock.currentPrice).toBe(priceBeforeUpdate);
    });

    it('ignores price updates for unknown symbols', () => {
      const before = service.stocks().map((s) => s.currentPrice);
      priceSubject.next(createPriceUpdate({ symbol: 'UNKNOWN', price: 1 }));
      const after = service.stocks().map((s) => s.currentPrice);
      expect(after).toEqual(before);
    });
  });
});
