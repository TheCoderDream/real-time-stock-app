import { resolveActiveStates, persistActiveStates } from './active-states.utils';

const SYMBOLS = ['AAPL', 'GOOGL', 'MSFT'];

describe('active-states.utils', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  describe('resolveActiveStates', () => {
    it('returns all-true map and initializes localStorage when storage is empty', () => {
      const result = resolveActiveStates(SYMBOLS);
      expect(result).toEqual({ AAPL: true, GOOGL: true, MSFT: true });
    });

    it('writes to localStorage when storage is empty', () => {
      resolveActiveStates(SYMBOLS);
      const stored = JSON.parse(localStorage.getItem('stock-active-states') ?? 'null');
      expect(stored).toEqual({ AAPL: true, GOOGL: true, MSFT: true });
    });

    it('returns saved states from localStorage when present', () => {
      localStorage.setItem('stock-active-states', JSON.stringify({ AAPL: false, GOOGL: true, MSFT: true }));
      const result = resolveActiveStates(SYMBOLS);
      expect(result).toEqual({ AAPL: false, GOOGL: true, MSFT: true });
    });

    it('does not overwrite existing localStorage when states are already saved', () => {
      const initial = { AAPL: false, GOOGL: true, MSFT: false };
      localStorage.setItem('stock-active-states', JSON.stringify(initial));
      resolveActiveStates(SYMBOLS);
      const stored = JSON.parse(localStorage.getItem('stock-active-states') ?? '{}');
      expect(stored).toEqual(initial);
    });

    it('handles corrupted localStorage gracefully and re-initializes', () => {
      localStorage.setItem('stock-active-states', 'not-valid-json');
      const result = resolveActiveStates(SYMBOLS);
      expect(result).toEqual({ AAPL: true, GOOGL: true, MSFT: true });
    });
  });

  describe('persistActiveStates', () => {
    it('writes the given state map to localStorage', () => {
      persistActiveStates({ AAPL: false, GOOGL: true });
      const stored = JSON.parse(localStorage.getItem('stock-active-states') ?? 'null');
      expect(stored).toEqual({ AAPL: false, GOOGL: true });
    });

    it('overwrites a previous save', () => {
      persistActiveStates({ AAPL: true });
      persistActiveStates({ AAPL: false });
      const stored = JSON.parse(localStorage.getItem('stock-active-states') ?? 'null');
      expect(stored).toEqual({ AAPL: false });
    });
  });
});
