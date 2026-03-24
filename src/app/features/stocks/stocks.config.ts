import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { StockConfig, StockPriceUpdate } from './models/stock.model';

export interface IStockPriceService {
  prices$: Observable<StockPriceUpdate>;
  notifyToggle(symbol: string, active: boolean): void;
}

export const TRACKED_STOCKS: StockConfig[] = [
  { symbol: 'AAPL', name: 'Apple' },
  { symbol: 'GOOGL', name: 'Alphabet' },
  { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'TSLA', name: 'Tesla' },
  { symbol: 'AMZN', name: 'Amazon' },
  { symbol: 'META', name: 'Meta' },
  { symbol: 'NVDA', name: 'Nvidia' },
  { symbol: 'NFLX', name: 'Netflix' },
  { symbol: 'AMD', name: 'AMD' },
  { symbol: 'ORCL', name: 'Oracle' },
  { symbol: 'INTC', name: 'Intel' },
  { symbol: 'CRM', name: 'Salesforce' },
];

export const STOCK_PRICE_STREAM = new InjectionToken<IStockPriceService>(
  'StockPriceStream'
);
