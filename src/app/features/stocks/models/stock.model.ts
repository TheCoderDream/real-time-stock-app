export interface StockData {
  symbol: string;
  name: string;
  currentPrice: number;
  previousClose: number;
  dailyHigh: number;
  dailyLow: number;
  week52High: number;
  week52Low: number;
  change: number;
  changePercent: number;
  lastTradeTime: number;
  volume: number;
  isActive: boolean;
}

export type PriceDirection = 'up' | 'down' | 'neutral';

export interface StockPriceUpdate {
  symbol: string;
  price: number;
  volume: number;
  timestamp: number;
}

export interface FinnhubQuoteResponse {
  c: number;  // current price
  d: number;  // change
  dp: number; // change percent
  h: number;  // daily high
  l: number;  // daily low
  o: number;  // open
  pc: number; // previous close
  t: number;  // timestamp
}

export interface FinnhubMetricResponse {
  metric: {
    '52WeekHigh': number;
    '52WeekLow': number;
    [key: string]: unknown;
  };
}

export interface FinnhubWsMessage {
  type: 'trade' | 'ping';
  data?: Array<{
    s: string; // symbol
    p: number; // price
    v: number; // volume
    t: number; // timestamp
  }>;
}

export interface FinnhubWsOutboundMessage {
  type: 'subscribe' | 'unsubscribe';
  symbol: string;
}

export interface StockConfig {
  symbol: string;
  name: string;
}
