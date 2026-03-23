import { PriceFormatPipe } from './price-format.pipe';

describe('PriceFormatPipe', () => {
  let pipe: PriceFormatPipe;

  beforeEach(() => {
    pipe = new PriceFormatPipe();
  });

  it('formats a number with two decimals and dollar sign', () => {
    expect(pipe.transform(230.5)).toBe('$230.50');
  });

  it('returns -- for null', () => {
    expect(pipe.transform(null)).toBe('--');
  });

  it('returns -- for undefined', () => {
    expect(pipe.transform(undefined)).toBe('--');
  });

  it('formats zero correctly', () => {
    expect(pipe.transform(0)).toBe('$0.00');
  });

  it('respects custom decimal argument', () => {
    expect(pipe.transform(1.1234, 4)).toBe('$1.1234');
  });

  it('formats integer without fractional part', () => {
    expect(pipe.transform(100, 0)).toBe('$100');
  });
});
