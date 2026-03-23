import { FinnhubWsMessage, FinnhubWsOutboundMessage, StockPriceUpdate } from '../models/stock.model';

type FinnhubTradeEntry = NonNullable<FinnhubWsMessage['data']>[number];
export type FinnhubTradeMessage = FinnhubWsMessage & { data: NonNullable<FinnhubWsMessage['data']> };

export function isTradeMessage(
  msg: FinnhubWsMessage | FinnhubWsOutboundMessage
): msg is FinnhubTradeMessage {
  const inbound = msg as FinnhubWsMessage;
  return (
    inbound.type === 'trade' &&
    Array.isArray(inbound.data) &&
    inbound.data.length > 0
  );
}

export function mapTradeToUpdate(trade: FinnhubTradeEntry): StockPriceUpdate {
  return {
    symbol: trade.s,
    price: trade.p,
    volume: trade.v,
    timestamp: trade.t,
  };
}
