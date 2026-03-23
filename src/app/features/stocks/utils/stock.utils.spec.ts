import { formatChange, formatChangePercent, getPriceDirection } from './stock.utils';
import { createStockData } from '../testing/stock-data.factory';

describe('getPriceDirection', () => {
  it('returns neutral when stock is inactive', () => {
    const stock = createStockData({ isActive: false, change: 5 });
    expect(getPriceDirection(stock)).toBe('neutral');
  });

  it('returns up when change is positive', () => {
    const stock = createStockData({ isActive: true, change: 2.5 });
    expect(getPriceDirection(stock)).toBe('up');
  });

  it('returns down when change is negative', () => {
    const stock = createStockData({ isActive: true, change: -1.3 });
    expect(getPriceDirection(stock)).toBe('down');
  });

  it('returns neutral when change is zero', () => {
    const stock = createStockData({ isActive: true, change: 0 });
    expect(getPriceDirection(stock)).toBe('neutral');
  });
});

describe('formatChange', () => {
  it('prefixes positive values with a plus sign', () => {
    expect(formatChange(2.3)).toBe('+2.30');
  });

  it('does not double-prefix negative values', () => {
    expect(formatChange(-1.5)).toBe('-1.50');
  });

  it('prefixes zero with a plus sign', () => {
    expect(formatChange(0)).toBe('+0.00');
  });

  it('always formats to two decimal places', () => {
    expect(formatChange(10)).toBe('+10.00');
  });
});

describe('formatChangePercent', () => {
  it('wraps the percentage in parentheses', () => {
    expect(formatChangePercent(1.23)).toBe('(1.23%)');
  });

  it('formats negative percentage correctly', () => {
    expect(formatChangePercent(-0.75)).toBe('(-0.75%)');
  });

  it('formats zero correctly', () => {
    expect(formatChangePercent(0)).toBe('(0.00%)');
  });
});
