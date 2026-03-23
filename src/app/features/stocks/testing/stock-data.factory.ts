import { StockData, StockPriceUpdate } from '../models/stock.model';

export function createStockData(overrides: Partial<StockData> = {}): StockData {
  return {
    symbol: 'AAPL',
    name: 'Apple',
    currentPrice: 230.0,
    previousClose: 227.7,
    dailyHigh: 232.0,
    dailyLow: 228.0,
    week52High: 299.0,
    week52Low: 161.0,
    change: 2.3,
    changePercent: 1.01,
    lastTradeTime: 1711234567000,
    volume: 5000,
    isActive: true,
    ...overrides,
  };
}

export function createPriceUpdate(overrides: Partial<StockPriceUpdate> = {}): StockPriceUpdate {
  return {
    symbol: 'AAPL',
    price: 231.0,
    volume: 500,
    timestamp: Date.now(),
    ...overrides,
  };
}
