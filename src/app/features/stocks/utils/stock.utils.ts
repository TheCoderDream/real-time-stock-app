import { StockData, PriceDirection } from '../models/stock.model';

export function getPriceDirection(stock: StockData): PriceDirection {
  if (!stock.isActive) return 'neutral';
  if (stock.change > 0) return 'up';
  if (stock.change < 0) return 'down';
  return 'neutral';
}

export function formatChange(change: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}`;
}

export function formatChangePercent(changePercent: number): string {
  return `(${changePercent.toFixed(2)}%)`;
}
