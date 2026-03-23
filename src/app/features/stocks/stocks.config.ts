import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { StockConfig, StockPriceUpdate } from './models/stock.model';

export const TRACKED_STOCKS: StockConfig[] = [
  { symbol: 'AAPL', name: 'Apple' },
  { symbol: 'GOOGL', name: 'Alphabet' },
  { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'TSLA', name: 'Tesla' },
];

export const STOCK_PRICE_STREAM = new InjectionToken<Observable<StockPriceUpdate>>(
  'StockPriceStream'
);
