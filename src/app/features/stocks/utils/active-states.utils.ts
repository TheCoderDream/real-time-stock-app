const STORAGE_KEY = 'stock-active-states';

/**
 * Returns the persisted active-state map for the given symbols.
 * If localStorage is empty (first visit), initialises it with all symbols active
 * and returns that default map.
 */
export function resolveActiveStates(symbols: string[]): Record<string, boolean> {
  const saved = readActiveStates();
  if (Object.keys(saved).length) return saved;

  const initial = Object.fromEntries(symbols.map((s) => [s, true]));
  persistActiveStates(initial);
  return initial;
}

/** Persists the full active-state map to localStorage. */
export function persistActiveStates(states: Record<string, boolean>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
}

function readActiveStates(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Record<string, boolean>;
  } catch {
    return {};
  }
}
